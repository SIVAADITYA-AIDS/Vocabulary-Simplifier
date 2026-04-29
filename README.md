# VocabGenius: AI-Powered Contextual Vocabulary Mastering

VocabGenius is an advanced reading companion designed to bridge the gap between encountering a difficult word and truly mastering it. By leveraging the **Gemini 2.5 Flash** LLM and a secure **Firebase** backend, it provides a personalized, context-aware learning ecosystem for students, professionals, and language learners.

## 🚀 The "Learning Loop" Workflow

Unlike traditional tools, VocabGenius follows a proven pedagogical cycle:
1.  **Extract & Analyze**: Users paste complex text. The AI extracts the most challenging vocabulary specific to a chosen theme (General, Technical, Academic, etc.).
2.  **Contextual Understanding**: Instead of generic dictionary entries, definitions are derived from how the word is used in the *provided* text.
3.  **Reinforcement (AI Story)**: The system generates a brand-new, original narrative that integrates all extracted words, helping users see the vocabulary in a fresh context.
4.  **Assessment (Dynamic Quiz)**: An interactive quiz is dynamically generated based on the user's current session to test retention immediately.
5.  **Persistence**: Sessions are saved to a personal library using Google Authentication for long-term review.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+).
-   **Backend**: Node.js & Express.js.
-   **AI Engine**: Google Generative AI (Gemini 2.5 Flash) with structured JSON output.
-   **Database & Auth**: Firebase Firestore (NoSQL) and Firebase Google Authentication.

## 🌟 Why It’s Better Than Existing Solutions

*   **Context over Definition**: Most market tools (like Kindle Vocabulary Builder or generic dictionaries) provide static definitions. VocabGenius explains the word *in the specific context* of what you are reading.
*   **Generative Reinforcement**: While apps like Quizlet or Anki require manual card creation, VocabGenius **generates new content** (stories and quizzes) on the fly, reducing the friction of study prep.
*   **Thematic Intelligence**: It understands domain-specific nuances. A word like "volatile" is defined differently if the user selects a "Technical" theme versus a "General" one.
*   **Zero-Config Sync**: By using Firebase ID Token verification, users get a secure, personalized library that syncs across devices without needing a complex account setup.

## 🤖 Comparison to Other AI Tools

With the rise of AI, many tools offer vocabulary help, but VocabGenius stands out by focusing on a complete, pedagogical learning loop rather than isolated features. Here's how it compares to popular AI-powered alternatives:

| Feature | VocabGenius | ChatGPT/Claude | Grammarly | Duolingo (AI-enhanced) | Anki (with AI plugins) |
|---------|-------------|----------------|-----------|-------------------------|-------------------------|
| **Contextual Extraction** | Extracts challenging words from user-provided text with thematic filtering | Can analyze text if prompted, but requires manual input and lacks automated extraction | Detects unclear language in writing, but not vocabulary-focused | Provides word explanations in lessons, but not from custom text | Manual card creation; AI plugins can suggest definitions but no text analysis |
| **Personalized Definitions** | Definitions based on word usage in your specific text | Generic or prompted definitions; not tied to user context | Suggests synonyms/clarity, but no deep definitions | Contextual hints in exercises, but predefined content | User-defined or AI-suggested cards, but static |
| **Generative Content** | Creates original stories and dynamic quizzes integrating all words | Can generate stories/examples on request, but not integrated into a learning workflow | Generates rephrasing suggestions, not narratives | AI-generated exercises, but focused on language patterns | AI can generate cards, but requires manual review and lacks narrative reinforcement |
| **Learning Workflow** | 5-step pedagogical cycle (extract, understand, reinforce, assess, persist) | Conversational; user must guide the process | Writing-focused corrections; no structured learning | Gamified lessons with AI feedback, but broad language learning | Spaced repetition; AI enhances cards but no built-in extraction or stories |
| **Persistence & Sync** | Secure Firebase library with Google Auth; cross-device sync | No built-in persistence; relies on user memory or external tools | Account-based suggestions, but not vocabulary tracking | Progress tracking with account, but limited to app content | Local/cloud sync for cards; AI plugins may add features but not integrated |
| **Target Use Case** | Deep vocabulary mastery from reading materials | General Q&A, creative writing, or ad-hoc explanations | Writing improvement and proofreading | Comprehensive language acquisition | Long-term memorization via flashcards |
| **Friction** | Zero setup; paste text and learn | Requires crafting prompts for each word/text | Integrated into writing, but not standalone vocab tool | Daily lessons; less flexible for specific texts | High initial setup for card creation |

**Why Choose VocabGenius Over "All AI" Tools?**
- **Specialized for Vocabulary Learning**: While general AI like ChatGPT excels at many tasks, VocabGenius is purpose-built for vocabulary mastery, incorporating cognitive science principles (e.g., contextual learning, reinforcement through stories).
- **Automated Workflow**: Other tools require manual effort (e.g., prompting AI repeatedly or creating flashcards). VocabGenius automates the entire process from text input to quiz.
- **Contextual Depth**: AI tools often give generic responses. VocabGenius analyzes your exact text, ensuring relevance to what you're reading.
- **Integrated Ecosystem**: Combines AI generation with secure storage and assessment, creating a "learning loop" that's more effective than piecemeal AI usage.

If you're using other AI tools for vocab, VocabGenius complements them by providing the structured, contextual practice they lack.

## 🛣️ Future Roadmap

*   **Spaced Repetition System (SRS)**: Implementing algorithms like SM-2 to prompt users to review saved words at optimal intervals (1 day, 3 days, 1 week) for permanent retention.
*   **PDF & E-book Support**: Allowing users to upload documents directly for full-chapter vocabulary analysis.
*   **Browser Extension**: A "Highlight-to-Learn" Chrome extension that pushes snippets from any website directly into the VocabGenius library.
*   **Collaborative Sets**: Letting teachers or study groups share "Vocab Sessions" with others.

## ⚙️ Setup Instructions

1.  **Clone the Repo**:
    ```bash
    git clone <your-repo-url>
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    GEMINI_API_KEY=your_google_ai_key_here
    ```
4.  **Firebase Configuration**:
    -   Place your `serviceAccountKey.json` (for the Admin SDK) in the root.
    -   Ensure `firebase-config.js` contains your client-side Firebase credentials.
5.  **Run the Server**:
    ```bash
    node server.js
    ```
6.  **Access**: Open `http://localhost:3000` in your browser.

---
*Developed with a focus on cognitive science and modern AI.*
