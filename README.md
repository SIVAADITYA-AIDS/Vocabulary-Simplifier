# 🔍 Decipher — AI Vocabulary Intelligence Platform

<div align="center">

**Upload any text, PDF, image, or YouTube video. AI extracts vocabulary, translates it, and trains you until every word sticks.**

[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FF6F00?style=flat-square&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## ✨ What is Decipher?

Decipher is a full-stack AI vocabulary platform that turns any dense reading material into a complete learning session — definitions, translations, mnemonics, quizzes, and an AI tutor included.

---

## 🚀 Feature Overview

| Category | Feature |
|---|---|
| **Input Sources** | Paste text · PDF/DOCX upload · Image OCR · YouTube transcript |
| **AI Analysis** | Extracts up to 25 complex words with definition, synonym & context |
| **ELI5 Simplifier** | Rewrites the passage in Plain English or "Explain Like I'm 5" |
| **Memory Hooks** | AI generates creative, humorous mnemonics per word |
| **Translator** | Translates definitions to 51 languages + Cultural Notes + Mirror Word detection |
| **Quiz System** | 📘 Standard · 🔄 Reverse · 📝 Smart Quiz (AI fill-in-the-blank, regenerates every time) |
| **Story Generator** | AI weaves all extracted words into a contextual paragraph |
| **Opposite Day** | Rewrites your passage using antonyms — fun and brain-bending |
| **Pronunciation Coach** | Mic button grades your pronunciation with % match score |
| **Socratic Tutor** | AI chatbot answers questions about words/passage with analogies |
| **Library** | Save/reload sessions to Firebase — private, per-user |
| **Themes** | 🌑 Cyber Dark · ☀️ Ice Latte + Mint · 🔴 Matte Black + Red |

---

## 🎨 Themes

Switch themes instantly from the nav bar — preference is saved in localStorage.

- **🌑 Cyber Dark** — Midnight Blue + Neon Cyan (default, AI/tech vibe)
- **☀️ Ice Latte** — Warm cream `#E4DDD3` + Mint `#00A19B` (clean, premium)
- **🔴 Matte Red** — Matte black `#080808` + Crimson `#dc2626` (bold, dramatic)

---

## 🏗️ Architecture

```
Decipher/
├── server.js              # Express backend — all AI & DB routes
├── main.js                # Frontend orchestrator (ES module)
├── index.html             # UI structure
├── styles.css             # Design system + 3 themes
└── modules/
    ├── api.js             # All fetch() calls
    ├── auth.js            # Firebase Google auth
    ├── ui.js              # DOM rendering + pronunciation coach
    ├── quiz.js            # Standard + Reverse + SRS quiz engine
    ├── toast.js           # Toast notifications
    └── languages.js       # 51-language registry
```

### API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/analyze` | Extract up to 25 vocabulary words |
| `POST` | `/api/simplify` | Rewrite passage (Plain / ELI5) |
| `POST` | `/api/mnemonic` | Generate memory hooks |
| `POST` | `/api/translate` | Translate + cultural notes + mirror word detection |
| `POST` | `/api/srs-questions` | AI fill-in-the-blank sentences |
| `POST` | `/api/story` | Contextual story from vocabulary |
| `POST` | `/api/opposite-day` | Antonym rewrite of passage |
| `POST` | `/api/ocr` | Extract text from image (Gemini Vision) |
| `POST` | `/api/youtube-transcript` | Fetch YouTube caption transcript |
| `POST` | `/api/chat` | Socratic tutor conversation |
| `POST` | `/api/extract-pdf` | Extract text from PDF or DOCX (100MB limit) |
| `GET/POST/DELETE` | `/api/history` | Library CRUD (auth required) |

---

## ⚙️ Setup

### 1. Clone & Install
```bash
git clone https://github.com/your-username/decipher.git
cd decipher
npm install
```

### 2. Environment Variables
Create `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Firebase
- Download `serviceAccountKey.json` from Firebase Console → Service Accounts
- Create `firebase-config.js` with your Firebase client config object

### 4. Run
```bash
npm start
# → http://localhost:3000
```

---

## 🔒 Security

- Gemini API key stays server-side only — never exposed to the browser
- Every library operation verifies Firebase ID token before touching Firestore
- Users can only read/delete their own data (enforced with Firebase Admin SDK)
- Files processed in memory only (no disk writes via `multer.memoryStorage()`)

---

## 🧰 Tech Stack

`Gemini 2.5 Flash` · `Node.js + Express 5` · `Firebase Auth + Firestore` · `pdf-parse` · `mammoth (DOCX)` · `youtube-transcript` · `Web Speech API` · `Vanilla JS ES Modules` · `TailwindCSS CDN` · `Space Grotesk + Inter`

---

## 📄 License

MIT © 2026
