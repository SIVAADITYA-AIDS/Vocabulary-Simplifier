require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multer: store uploads in memory (no disk writes), max 20 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.epub'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and EPUB files are supported.'));
    }
  }
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('.'));

// --- CONNECT TO FIREBASE ---
try {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("✅ Connected to Firebase Firestore!");
} catch (error) {
  console.error("❌ ERROR: Could not load serviceAccountKey.json.");
  process.exit(1);
}

const db = admin.firestore();
const sessionsCollection = db.collection('sessions'); 

// --- MIDDLEWARE ---
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: "Unauthorized: No token provided." });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info (like uid) to the request
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ error: "Unauthorized: Invalid token." });
  }
};

// --- ROUTES ---

// AI Analysis (Unchanged)
app.post('/api/analyze', async (req, res) => {
  const { text, theme } = req.body;
  if (!text || text.length < 20) return res.status(400).json({ error: "Text too short." });

  try {
    const themePrompt = theme && theme !== 'General' 
      ? `Focus the definitions and context strongly around the domain of ${theme}. ` 
      : '';

    const prompt = `
      You are an advanced vocabulary extraction tool. 
      Read the following text and extract the most difficult, complex, or advanced vocabulary words. 
      Limit the extraction to a maximum of 15 words.
      ${themePrompt}
      For each word, provide:
      1. The word itself (term)
      2. A concise definition based on how it is used in the text
      3. A common synonym
      4. The exact sentence or clause from the text where it was used (context).
      Text to analyze: "${text}"
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: { term: { type: "STRING" }, def: { type: "STRING" }, syn: { type: "STRING" }, context: { type: "STRING" } },
                    required: ["term", "def", "syn", "context"]
                }
            }
        }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error('Error during AI analysis:', error);
    res.status(500).json({ error: 'AI analysis failed. Please check the server logs for more details.' });
  }
});

// --- PDF / EPUB TEXT EXTRACTION ---
app.post('/api/extract-pdf', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Please attach a PDF or EPUB.' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    if (ext === '.pdf' || req.file.mimetype === 'application/pdf') {
      // --- Parse PDF ---
      const data = await pdfParse(req.file.buffer);

      if (!data.text || data.text.trim().length < 50) {
        return res.status(422).json({
          error: 'Could not extract readable text from this PDF. It may be a scanned image without OCR layer.'
        });
      }

      // Limit to first ~6000 characters to stay within AI token budgets
      const truncated = data.text.replace(/\s+/g, ' ').trim().slice(0, 6000);

      return res.json({
        text: truncated,
        pageCount: data.numpages,
        fileName: req.file.originalname,
        truncated: data.text.length > 6000
      });
    }

    if (ext === '.epub') {
      // EPUB is a ZIP with HTML inside — basic extraction
      // For now, return a friendly error pointing users toward PDF
      return res.status(422).json({
        error: 'EPUB support is coming soon. Please convert your e-book to PDF first.'
      });
    }

    return res.status(400).json({ error: 'Unsupported file type.' });
  } catch (err) {
    console.error('PDF extraction error:', err);
    res.status(500).json({ error: 'Failed to process the file. Ensure it is a valid, non-password-protected PDF.' });
  }
});

// Multer error handler (file size limit, file type rejection, etc.)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 20MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// --- CONTEXTUAL TRANSLATION (with Cultural Notes & Mirror Word Detection) ---
app.post('/api/translate', async (req, res) => {
  const { vocabList, targetLang } = req.body;
  if (!vocabList || !Array.isArray(vocabList) || vocabList.length === 0) {
    return res.status(400).json({ error: 'No vocabulary list provided.' });
  }
  if (!targetLang) {
    return res.status(400).json({ error: 'No target language specified.' });
  }

  try {
    const prompt = `
      You are a professional multilingual educator and linguist. Your job is to translate English vocabulary into ${targetLang} in a way that is pedagogically rich.

      For EACH word in the list below, provide ALL of the following:

      1. "translatedDef": Translate the English definition into ${targetLang}. Preserve educational tone.
      2. "translatedContext": Translate the context sentence into ${targetLang}. Keep it natural.
      3. "culturalNote": If the word carries a cultural nuance, idiomatic meaning, or if the concept exists differently in ${targetLang}-speaking cultures, write a SHORT insightful note (1-2 sentences, in English for clarity). If there is no significant cultural note, return an empty string.
      4. "mirrorWord": Check if the English word LOOKS or SOUNDS similar to a word in ${targetLang} but has a completely DIFFERENT meaning. If such a pair exists, return an object with:
         - "nativeWord": The visually/phonetically similar word in ${targetLang}
         - "nativeMeaning": What that native word actually means (in English)
         - "alert": A friendly, educational warning in English (e.g., "Heads up! The word 'X' in ${targetLang} looks very similar but actually means 'Y'. Don't let it fool you!")
         If NO mirror word exists, return { "nativeWord": "", "nativeMeaning": "", "alert": "" }.

      Keep the original English "term" UNCHANGED in your response.

      Vocabulary list:
      ${JSON.stringify(vocabList.map(v => ({ term: v.term, def: v.def, context: v.context })))}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              term:              { type: 'STRING' },
              translatedDef:     { type: 'STRING' },
              translatedContext: { type: 'STRING' },
              culturalNote:      { type: 'STRING' },
              mirrorWord: {
                type: 'OBJECT',
                properties: {
                  nativeWord:    { type: 'STRING' },
                  nativeMeaning: { type: 'STRING' },
                  alert:         { type: 'STRING' }
                },
                required: ['nativeWord', 'nativeMeaning', 'alert']
              }
            },
            required: ['term', 'translatedDef', 'translatedContext', 'culturalNote', 'mirrorWord']
          }
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

// NEW: Contextual Story Generation
app.post('/api/story', async (req, res) => {
  const { words } = req.body;
  if (!words || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: "No words provided to generate a story." });
  }

  try {
    const prompt = `
      Write a short, engaging paragraph or very short story (maximum 150 words) 
      that correctly integrates all of the following vocabulary words:
      ${words.join(', ')}.
      Make the context clear enough so the meaning of the words is reinforced. 
      Do not use any markdown formatting, just return plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    res.json({ story: response.text });
  } catch (error) {
    console.error("Error generating story:", error);
    res.status(500).json({ error: "Story generation failed." });
  }
});

// UPGRADED: Save session WITH User ID
app.post('/api/history', verifyToken, async (req, res) => {
  const { snippet, words } = req.body;
  const userId = req.user.uid; // Get UID from verified token
  if (!words || words.length === 0) return res.status(400).json({ error: "No words to save." });

  try {
    const newSession = {
      snippet,
      words,
      userId, // Attach the user's ID to this specific list
      createdAt: admin.firestore.FieldValue.serverTimestamp() 
    };
    
    const docRef = await sessionsCollection.add(newSession);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error saving session to database:", err);
    res.status(500).json({ error: "Failed to save to database. Please check the server logs for more details." });
  }
});

// UPGRADED: Get history ONLY for the logged-in user
app.get('/api/history', verifyToken, async (req, res) => {
  const userId = req.user.uid; // Get UID from verified token

  try {
    // Let Firestore do the sorting and limiting to save memory and read costs
    const snapshot = await sessionsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    let history = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const dateString = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
      
      history.push({
        id: doc.id,
        date: dateString,
        snippet: data.snippet,
        words: data.words
      });
    });

    res.json(history);
  } catch (err) {
    console.error("Error fetching history from database:", err);
    res.status(500).json({ error: "Failed to fetch history. Please check the server logs for more details." });
  }
});

// Get a specific session by ID (Unchanged)
app.get('/api/history/:id', verifyToken, async (req, res) => {
  try {
    const doc = await sessionsCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Session not found" });

    const sessionData = doc.data();
    // SECURITY CHECK: Ensure the user requesting the session is the one who owns it
    if (sessionData.userId !== req.user.uid) return res.status(403).json({ error: "Forbidden: You do not own this session." });
    res.json({ id: doc.id, ...sessionData });
  } catch (err) {
    console.error("Error fetching session by ID:", err);
    res.status(500).json({ error: "Invalid ID format or database error. Please check the server logs." });
  }
});

// UPGRADED: Clear ONLY the logged-in user's history
app.delete('/api/history', verifyToken, async (req, res) => {
  const userId = req.user.uid; // Get UID from verified token

  try {
    const snapshot = await sessionsCollection.where('userId', '==', userId).get();
    const batch = db.batch();
    
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    
    res.json({ success: true, message: "User library cleared" });
  } catch (err) {
    console.error("Error clearing user library:", err);
    res.status(500).json({ error: "Failed to clear library. Please check the server logs." });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));