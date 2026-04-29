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
