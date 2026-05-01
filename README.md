# 🔍 Decipher — AI Vocabulary Intelligence Platform

<div align="center">

**Upload any text or PDF. AI extracts vocabulary, translates it to your language, and trains you until you master every word.**

[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Auth%20%26%20DB-Firebase-FF6F00?style=flat-square&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Backend-Express%205-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)

</div>

---

## ✨ What is Decipher?

Decipher is a **full-stack AI vocabulary learning platform** built for students, researchers, ESL learners, and lifelong readers. It turns any dense passage — academic papers, legal documents, novels, business reports — into a complete, interactive learning session.

Instead of just giving you a dictionary definition, Decipher understands the **context** of each word, explains it in your **native language**, and then quizzes you in multiple modes until the knowledge actually sticks.

---

## 🚀 Core Feature Set

### 📄 Multi-Source Input
| Feature | Detail |
|---|---|
| **Paste Text** | Paste any paragraph or passage directly |
| **PDF Upload** | Drag & drop or browse — up to 20MB, extracts text automatically |
| **Sample Mode** | Instantly load a sample academic passage to try the platform |
| **Keyboard Accessible** | Full keyboard navigation throughout |

---

### 🧠 AI Analysis Engine *(Gemini 2.5 Flash)*
The core of Decipher. Paste your text, select a **theme**, and the AI extracts up to **15 of the most complex vocabulary words** with:

- **Contextual Definition** — what the word means *in this specific passage*
- **Synonym** — a simpler equivalent
- **Context Sentence** — the exact phrase from the text where it appeared
- **🔊 Pronunciation** — click to hear the word spoken via Web Speech API

**Available Themes:** General · Business & Finance · Medical & Science · Legal · Literature & Poetry

---

### 🔍 Decipher the Passage *(ELI5 Mode)*
> *"I understand the words, but the whole passage is confusing."*

A **Simplify Passage** tool that rewrites the entire text using AI before you even analyze it.

- **Plain English Mode** — strips jargon, simplifies syntax, targets B1–B2 reading level
- **Explain Like I'm 5 Mode** — uses analogies, short sentences, and conversational language a 12-year-old would understand
- **"Use as Input" Button** — instantly transfer the simplified text into the analyzer to extract vocabulary from the simplified version

---

### 💡 Memory Hooks *(AI Mnemonic Generator)*
> *"I know what it means right now, but I'll forget it by tomorrow."*

Click **"💡 Memory Hooks"** after analyzing a passage. The AI generates a **creative, personalized memory device** for every word:

- Uses **wordplay, vivid imagery, or humor** to connect the word's spelling/sound to its meaning
- Displayed as an expandable section on each vocabulary card
- Example for *"Gregarious"*: *"Think of GREG who's always HILARIOUS at parties — he never shuts up because he loves being around people!"*

---

### 🌐 Contextual Translator *(51 Languages)*
Translate the **definition and context sentence** of every word into your native language — with AI that understands nuance, not just words.

**Includes three layers of intelligence per word:**

| Layer | Description |
|---|---|
| 🌍 **Cultural Note** | Explains if the word has a different cultural significance, idiomatic use, or doesn't exist as a concept in the target language |
| 🪞 **Mirror Word Alert** | Detects if the English word looks/sounds like a native word but means something *completely different* — a premium linguistics safety net |
| EN/TR **Toggle** | Every card has a flip button to switch between English and translated content |

<details>
<summary><strong>📋 All 51 Supported Languages</strong></summary>

| # | Language | Native Script |
|---|---|---|
| 1 | Mandarin Chinese | 中文 (普通话) |
| 2 | Spanish | Español |
| 3 | Hindi | हिन्दी |
| 4 | Arabic | العربية |
| 5 | Bengali | বাংলা |
| 6 | French | Français |
| 7 | Portuguese | Português |
| 8 | Russian | Русский |
| 9 | Japanese | 日本語 |
| 10 | Punjabi | ਪੰਜਾਬੀ |
| 11 | Marathi | मराठी |
| 12 | Telugu | తెలుగు |
| 13 | Turkish | Türkçe |
| 14 | Korean | 한국어 |
| 15 | Vietnamese | Tiếng Việt |
| 16 | German | Deutsch |
| 17 | Urdu | اردو |
| 18 | Italian | Italiano |
| 19 | Gujarati | ગુજરાતી |
| 20 | Persian | فارسی |
| 21 | Indonesian | Bahasa Indonesia |
| 22 | Hausa | Hausa |
| 23 | Pashto | پښتو |
| 24 | Yoruba | Yorùbá |
| 25 | Malay | Bahasa Melayu |
| 26 | Burmese | မြန်မာ |
| 27 | Amharic | አማርኛ |
| 28 | Odia | ଓଡ଼ିଆ |
| 29 | Filipino (Tagalog) | Filipino |
| 30 | Sindhi | سنڌي |
| 31 | Polish | Polski |
| 32 | Zulu | isiZulu |
| 33 | Xhosa | isiXhosa |
| 34 | Kannada | ಕನ್ನಡ |
| 35 | Romanian | Română |
| 36 | Ukrainian | Українська |
| 37 | Igbo | Igbo |
| 38 | Dutch | Nederlands |
| 39 | Swahili | Kiswahili |
| 40 | Thai | ภาษาไทย |
| 41 | Malayalam | മലയാളം |
| 42 | Cantonese | 粵語 |
| 43 | Hungarian | Magyar |
| 44 | Czech | Čeština |
| 45 | Greek | Ελληνικά |
| 46 | Swedish | Svenska |
| 47 | Hebrew | עברית |
| 48 | Finnish | Suomi |
| 49 | Norwegian | Norsk |
| 50 | Serbian | Српски |
| 51 | **Tamil** | **தமிழ்** |

</details>

---

### 🎯 Three-Mode Quiz System

#### 📘 Standard Mode
Classic vocabulary quiz. The word is shown — you pick the correct definition from 4 choices.

#### 🔄 Reverse Mode *(requires translation)*
The **translated definition** is shown — you identify the correct English term. Tests active recall, not just passive recognition. Unlocked after using the translator.

#### 📝 Smart Quiz Mode — *Infinite SRS (Spaced Repetition)*
> *"I always pick the right answer because I memorized the quiz, not the word."*

The most powerful quiz mode. Every time you start it, the AI generates **entirely new fill-in-the-blank sentences** for each word. You never see the same question twice.

- AI writes a realistic sentence (from a news article, email, or academic text) with a `___` blank
- You select the correct English term from 4 options
- **Regenerates completely on every retry** — true spaced repetition, no memorizing the quiz

---

### 📖 AI Story Generator
After analysis, click **"Generate Story"** to have the AI write a short story or paragraph that naturally weaves all extracted words into context. Reinforces comprehension, and has a **Copy to Clipboard** button.

---

### ☁️ Personal Cloud Library *(Firebase)*
- **Save** any session to your personal Firestore library
- **Reload** past sessions to re-study vocabulary from previous readings
- **Secure** — your library is private. You can only see and delete your own data (enforced server-side with Firebase Admin SDK token verification)
- Stores up to your **10 most recent sessions**

---

## 🏗️ Architecture

```
Decipher/
├── server.js                  # Express backend — all AI & DB routes
├── main.js                    # Frontend orchestrator (ES module)
├── index.html                 # UI structure & quiz modal
├── styles.css                 # Design system (Cyber-Intelligence theme)
├── firebase-config.js         # Firebase client config (gitignored)
├── serviceAccountKey.json     # Firebase Admin SDK key (gitignored)
├── .env                       # GEMINI_API_KEY (gitignored)
└── modules/
    ├── api.js                 # All fetch() calls — single source of truth
    ├── auth.js                # Firebase Google auth module
    ├── ui.js                  # DOM rendering (cards, library, story)
    ├── quiz.js                # Standard + Reverse + SRS quiz engine
    ├── toast.js               # Non-blocking toast notification system
    └── languages.js           # 51-language registry
```

### Backend API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/analyze` | None | Extract vocabulary from text |
| `POST` | `/api/simplify` | None | Rewrite passage (Plain / ELI5) |
| `POST` | `/api/mnemonic` | None | Generate memory hooks for word list |
| `POST` | `/api/translate` | None | Translate vocab + cultural notes + mirror word detection |
| `POST` | `/api/srs-questions` | None | Generate fill-in-the-blank sentences for SRS quiz |
| `POST` | `/api/story` | None | Generate reinforcement story |
| `POST` | `/api/extract-pdf` | None | Extract text from PDF (multer, pdf-parse) |
| `POST` | `/api/history` | ✅ Required | Save session to Firestore |
| `GET` | `/api/history` | ✅ Required | Fetch user's saved sessions |
| `GET` | `/api/history/:id` | ✅ Required | Fetch one session (ownership verified) |
| `DELETE` | `/api/history` | ✅ Required | Delete all user sessions |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- A Google Gemini API Key — [Get one here](https://ai.google.dev/)
- A Firebase project with Firestore and Google Authentication enabled

### 1. Clone & Install

```bash
git clone https://github.com/your-username/decipher.git
cd decipher
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Project Settings → Service Accounts
2. Generate a new private key → download as `serviceAccountKey.json`
3. Place it in the project root
4. Create `firebase-config.js` in the root:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...rest of your config
};
```

### 4. Run

```bash
npm start
# → Server running on http://localhost:3000
```

---

## 🔒 Security Model

| Concern | How it's handled |
|---|---|
| **API Key Exposure** | Gemini API key lives only in `.env` on the server — never sent to the browser |
| **User Data Isolation** | Every library operation verifies the Firebase ID token server-side. You can only read/delete your own data |
| **File Upload Safety** | `multer` uses `memoryStorage` (no disk writes), enforces 20MB limit and `.pdf`/`.epub` extension check |
| **Request Size Limit** | JSON body capped at 1MB to prevent payload abuse |
| **Token Verification** | `firebase-admin` verifies every authenticated request before touching Firestore |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **AI Engine** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Backend** | Node.js + Express 5 |
| **Authentication** | Firebase Auth (Google Sign-In) |
| **Database** | Cloud Firestore (Firebase) |
| **PDF Parsing** | `pdf-parse` |
| **File Upload** | `multer` (memory storage) |
| **Frontend** | Vanilla JS (ES Modules), HTML5, CSS3 |
| **UI Framework** | TailwindCSS CDN + Custom Design System |
| **Typography** | Space Grotesk + Inter (Google Fonts) |
| **Speech** | Web Speech API (native browser) |
| **Environment** | `dotenv` |

---

## 🎨 Design System

**Theme:** Cyber-Intelligence  
**Palette:** Midnight Blue (`#040914`) · Neon Cyan (`#06b6d4`) · Violet (`#a78bfa`) · Amber (`#fbbf24`)  
**Fonts:** Space Grotesk (headings) · Inter (body)  
**Effects:** Glassmorphism cards · Animated scan-line loading · CSS glow orbs · Entrance animations

---

## 🗺️ Learning Flow

```
1. Upload PDF or Paste Text
       ↓
2. (Optional) Simplify Passage → Plain English / ELI5
       ↓
3. Click "Decipher Text" → AI extracts vocabulary
       ↓
4. (Optional) Generate Memory Hooks → 💡 Mnemonics for long-term retention
       ↓
5. (Optional) Translate → 51 languages + Cultural Notes + Mirror Word Alerts
       ↓
6. Quiz yourself:
   ├── 📘 Standard (definition → term)
   ├── 🔄 Reverse  (translated definition → English term)
   └── 📝 Smart Quiz (AI fill-in-the-blank, regenerates every time)
       ↓
7. Generate Story → AI weaves all words into a memorable paragraph
       ↓
8. Save to Library → Cloud-stored, reload anytime
```

---

## 📄 License

MIT © 2026 — Built with ❤️ using the Gemini AI API
