require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const admin = require("firebase-admin");

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

app.use(cors());
app.use(express.json());
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

// --- ROUTES ---

// AI Analysis (Unchanged)
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text || text.length < 20) return res.status(400).json({ error: "Text too short." });

  try {
    const prompt = `
      You are an advanced vocabulary extraction tool. 
      Read the following text and extract the most difficult, complex, or advanced vocabulary words. 
      Limit the extraction to a maximum of 15 words.
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
    console.error("Error during AI analysis:", error);
    res.status(500).json({ error: "AI analysis failed. Please check the server logs for more details." });
  }
});

// UPGRADED: Save session WITH User ID
app.post('/api/history', async (req, res) => {
  const { snippet, words, userId } = req.body;
  
  if (!userId) return res.status(401).json({ error: "Must be logged in to save." });
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
app.get('/api/history', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(401).json({ error: "Must be logged in to view history." });

  try {
    // Find only documents that belong to this user
    const snapshot = await sessionsCollection.where('userId', '==', userId).get();
    
    let history = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const timestamp = data.createdAt ? data.createdAt.toMillis() : Date.now();
      const dateString = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
      
      history.push({
        id: doc.id,
        date: dateString,
        rawDate: timestamp, // Used for sorting
        snippet: data.snippet,
        words: data.words
      });
    });

    // Sort newest first and limit to 10
    history.sort((a, b) => b.rawDate - a.rawDate);
    const finalHistory = history.slice(0, 10).map(item => {
        delete item.rawDate;
        return item;
    });

    res.json(finalHistory);
  } catch (err) {
    console.error("Error fetching history from database:", err);
    res.status(500).json({ error: "Failed to fetch history. Please check the server logs for more details." });
  }
});

// Get a specific session by ID (Unchanged)
app.get('/api/history/:id', async (req, res) => {
  try {
    const doc = await sessionsCollection.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Session not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error fetching session by ID:", err);
    res.status(500).json({ error: "Invalid ID format or database error. Please check the server logs." });
  }
});

// UPGRADED: Clear ONLY the logged-in user's history
app.delete('/api/history', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(401).json({ error: "Must be logged in." });

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