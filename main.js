// --- 1. FIREBASE AUTHENTICATION SETUP ---
// The configuration is now loaded from firebase-config.js
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

let currentUser = null; // Tracks who is logged in

// DOM Elements
const authBtn = document.getElementById('authBtn');
const userNameDisplay = document.getElementById('userNameDisplay');
const libraryGrid = document.getElementById('libraryGrid');
const clearLibBtn = document.getElementById('clearLibBtn');
const saveBtn = document.getElementById('saveBtn');

// Listen for Login/Logout changes
auth.onAuthStateChanged((user) => {
  currentUser = user;
  
  if (user) {
    // User is logged in
    authBtn.textContent = "Log Out";
    userNameDisplay.textContent = `Hi, ${user.displayName.split(' ')[0]}`;
    userNameDisplay.classList.remove('hidden');
    saveBtn.disabled = false;
    clearLibBtn.classList.remove('hidden');
    renderLibrary(); // Fetch their personal library
  } else {
    // User is logged out
    authBtn.textContent = "Log In with Google";
    userNameDisplay.classList.add('hidden');
    saveBtn.disabled = true;
    clearLibBtn.classList.add('hidden');
    libraryGrid.innerHTML = `<div class="glass rounded-xl p-6 col-span-full text-center border-dashed border-2 border-[var(--border)] text-[var(--text-muted)]">Please log in to view your saved sessions.</div>`;
  }
});

// Handle Login/Logout button click
authBtn.addEventListener('click', () => {
  if (currentUser) {
    auth.signOut();
  } else {
    auth.signInWithPopup(provider).catch(error => console.error("Login failed:", error));
  }
});

// --- 2. VOCABGENIUS LOGIC ---
// Use a relative URL for the API. This works for both local dev and production deployments.
const API_BASE = '/api';
let currentVocabList = [];
const SPINNER_SVG = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

// UI Elements
const themeSelect = document.getElementById('themeSelect');
const inputText = document.getElementById('inputText');
const analyzeBtn = document.getElementById('analyzeBtn');
const sampleBtn = document.getElementById('sampleBtn');
const generateStoryBtn = document.getElementById('generateStoryBtn');
const storyContainer = document.getElementById('storyContainer');
const startQuizBtn = document.getElementById('startQuizBtn');
const resultsBox = document.getElementById('resultsBox');
const wordCountBadge = document.getElementById('wordCountBadge');

function renderResults(vocabArray) {
  if (vocabArray.length === 0) return;
  resultsBox.innerHTML = vocabArray.map(item => `
    <div class="vocab-item rounded-lg px-2">
      <span class="font-bold text-[var(--accent)] capitalize">${item.term}</span>
      <p class="text-sm text-[var(--text-main)] mb-1">${item.def}</p>
      <p class="text-xs text-[var(--text-muted)]"><span class="text-[var(--accent)]">Syn: </span>${item.syn}</p>
      <p class="text-xs italic opacity-70 mt-2 border-l-2 border-[var(--accent)] pl-2">${item.context}</p>
    </div>
  `).join('');
  wordCountBadge.textContent = `(${vocabArray.length})`;
  startQuizBtn.disabled = false;
  startQuizBtn.classList.remove('opacity-50');
  generateStoryBtn.disabled = false;
  generateStoryBtn.classList.remove('opacity-50', 'hidden');
  storyContainer.classList.add('hidden');
  storyContainer.textContent = '';
  saveBtn.classList.remove('hidden');
}

// --- API CALLS (Now with secure ID Token) ---

// Helper to get authorization headers
async function getAuthHeaders() {
  if (!currentUser) return { 'Content-Type': 'application/json' };
  try {
    const token = await currentUser.getIdToken(true); // Force refresh token if needed
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error("Error getting auth token:", error);
    // Handle token error, maybe sign the user out
    auth.signOut();
    return null;
  }
}

analyzeBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const theme = themeSelect.value;
  if(text.length < 20) return alert("Please enter a longer passage.");
  try {
    analyzeBtn.innerHTML = `${SPINNER_SVG} Analyzing...`;
    analyzeBtn.disabled = true;
    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, theme })
    });

    if (!response.ok) {
      // Attempt to parse error message from response, or use a generic one
      const errorData = await response.json().catch(() => ({ error: "Unknown server error or malformed response." }));
      throw new Error(errorData.error || 'Analysis failed');
    }
    
    // Only parse JSON for success responses
    currentVocabList = await response.json();

    renderResults(currentVocabList);
  } catch (err) {
    // Error handling improved to show server message
    alert(`Failed to analyze text: ${err.message}`);
    console.error("Analysis error details:", err);
  } finally {
    analyzeBtn.innerHTML = `Analyze`;
    analyzeBtn.disabled = false;
  }
});

generateStoryBtn.addEventListener('click', async () => {
  if (currentVocabList.length === 0) return;
  
  const originalText = generateStoryBtn.textContent;
  generateStoryBtn.innerHTML = `${SPINNER_SVG} Generating...`;
  generateStoryBtn.disabled = true;
  
  try {
    const words = currentVocabList.map(item => item.term);
    const response = await fetch(`${API_BASE}/story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words })
    });
    if (!response.ok) throw new Error((await response.json()).error);
    const data = await response.json();
    storyContainer.textContent = data.story;
    storyContainer.classList.remove('hidden');
  } catch (err) {
    alert("Failed to generate contextual story.");
  } finally {
    generateStoryBtn.innerHTML = originalText;
    generateStoryBtn.disabled = false;
  }
});

saveBtn.addEventListener('click', async () => {
  if(!currentUser) return alert("You must be logged in to save.");
  if(currentVocabList.length === 0) return;

  const snippet = inputText.value.substring(0, 40) + "...";
  try {
    const headers = await getAuthHeaders();
    if (!headers) return alert("Authentication error. Please log in again.");

    saveBtn.innerHTML = `${SPINNER_SVG} Saving...`;
    await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: headers,
      // NO MORE userId in body. It's derived from the token on the backend.
      body: JSON.stringify({ snippet, words: currentVocabList })
    });
    await renderLibrary();
    saveBtn.textContent = "Saved!";
    setTimeout(() => saveBtn.textContent = "Save", 2000);
  } catch (err) {
    console.error("Failed to save", err);
  }
});

async function renderLibrary() {
  if(!currentUser) return; // Don't fetch if logged out
  
  // UI/UX Improvement: Add a loading state
  libraryGrid.innerHTML = `<div class="glass rounded-xl p-6 col-span-full text-center text-[var(--text-muted)]">Loading your library...</div>`;

  try {
    const headers = await getAuthHeaders();
    if (!headers) return; // Error handled in getAuthHeaders

    const response = await fetch(`${API_BASE}/history`, { headers });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    const history = await response.json();
    
    if(history.length === 0) {
      libraryGrid.innerHTML = `<div class="glass rounded-xl p-6 col-span-full text-center border-dashed border-2 border-[var(--border)] text-[var(--text-muted)]">Your library is empty.</div>`;
      return;
    }

    libraryGrid.innerHTML = history.map(item => `
      <div class="glass rounded-xl p-4 hover:border-[var(--accent)] transition-all cursor-pointer" onclick="loadSession('${item.id}')">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs text-[var(--text-muted)]">${item.date}</span>
          <span class="text-[var(--accent)] font-bold text-sm">${item.words.length} words</span>
        </div>
        <p class="text-xs text-[var(--text-muted)] truncate">${item.snippet}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error("Failed to load library", err);
    // UI/UX Improvement: Show an error message
    libraryGrid.innerHTML = `<div class="glass rounded-xl p-6 col-span-full text-center text-red-400">Failed to load library. Please try again later.</div>`;
  }
}

async function loadSession(id) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`${API_BASE}/history/${id}`, { headers });
    if (!response.ok) {
        throw new Error((await response.json()).error || `HTTP error! status: ${response.status}`);
    }
    const session = await response.json();
    if(session && session.words) {
      currentVocabList = session.words;
      resultsBox.innerHTML = ''; 
      renderResults(currentVocabList);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  } catch (err) {
      console.error(`Failed to load session ${id}`, err);
      alert(`Could not load session. It may have been deleted or there was a network error.`);
  }
}

clearLibBtn.addEventListener('click', async () => {
  if(confirm("Delete your personal history?")) {
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${API_BASE}/history`, { method: 'DELETE', headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        await renderLibrary();
    } catch (err) {
        console.error("Failed to clear library", err);
        alert("Failed to clear library. Please try again.");
    }
  }
});

sampleBtn.addEventListener('click', () => { inputText.value = "The proliferation of digital technology has precipitated a paradigm shift in pedagogical methodologies. While traditional education relied on a teacher-centric model, modern approaches necessitate a more interactive and student-focused framework. This unprecedented integration of sophisticated algorithms into learning platforms has created both opportunities and challenges."; });

// --- 3. QUIZ LOGIC (Refactored for Clarity) ---
const quizModal = document.getElementById('quizModal');
const quizContent = document.getElementById('quizContent');
const closeQuizBtn = document.getElementById('closeQuiz');
const quizStartScreen = document.getElementById('quizStartScreen');
const quizPlayScreen = document.getElementById('quizPlayScreen');
const quizEndScreen = document.getElementById('quizEndScreen');
const initQuizBtn = document.getElementById('initQuizBtn');
const nextQBtn = document.getElementById('nextQBtn');
const restartQuizBtn = document.getElementById('restartQuizBtn');
const exitQuizBtn = document.getElementById('exitQuizBtn');
const optionsContainer = document.getElementById('optionsContainer');

let quizState = { active: false, questions: [], currentIndex: 0, score: 0 };

function startQuiz() {
  if (currentVocabList.length < 4) return alert("You need at least 4 words to start a quiz.");
  
  const shuffled = [...currentVocabList].sort(() => Math.random() - 0.5);
  quizState = {
    active: true,
    questions: shuffled.slice(0, 10), // Max 10 questions
    currentIndex: 0,
    score: 0
  };

  document.getElementById('quizWordCount').textContent = quizState.questions.length;
  document.getElementById('totalQ').textContent = quizState.questions.length;
  
  quizStartScreen.classList.remove('hidden');
  quizPlayScreen.classList.add('hidden');
  quizEndScreen.classList.add('hidden');
  
  quizModal.classList.add('active');
  setTimeout(() => quizContent.style.transform = 'scale(1)', 10);
}

function initQuiz() {
  quizStartScreen.classList.add('hidden');
  quizPlayScreen.classList.remove('hidden');
  loadQuestion();
}

function loadQuestion() {
  const qData = quizState.questions[quizState.currentIndex];
  
  // Update UI
  document.getElementById('currentQ').textContent = quizState.currentIndex + 1;
  document.getElementById('currentScore').textContent = quizState.score;
  document.getElementById('progressBar').style.width = `${((quizState.currentIndex + 1) / quizState.questions.length) * 100}%`;
  document.getElementById('questionText').textContent = `What does "${qData.term}" mean?`;
  nextQBtn.classList.add('hidden');

  // Generate options
  let options = [qData.def];
  let wrongPool = currentVocabList.filter(v => v.term !== qData.term).sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3; i++) {
    options.push(wrongPool[i] ? wrongPool[i].def : "A related concept");
  }
  options.sort(() => Math.random() - 0.5);

  // Render options
  optionsContainer.innerHTML = options.map(opt => `<button class="quiz-option" data-correct="${opt === qData.def}">${opt}</button>`).join('');
  optionsContainer.querySelectorAll('.quiz-option').forEach(b => b.addEventListener('click', handleOptionClick));
}

function handleOptionClick(event) {
  const clickedButton = event.target;
  const isCorrect = clickedButton.dataset.correct === 'true';

  if (isCorrect) {
    quizState.score++;
    document.getElementById('currentScore').textContent = quizState.score;
  }

  // Disable all options and show correct/wrong styles
  optionsContainer.querySelectorAll('.quiz-option').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.correct === 'true') btn.classList.add('correct');
    else if (btn === clickedButton) btn.classList.add('wrong');
  });

  nextQBtn.classList.remove('hidden');
}

function nextQuestion() {
  quizState.currentIndex++;
  if (quizState.currentIndex < quizState.questions.length) {
    loadQuestion();
  } else {
    // End of quiz
    quizPlayScreen.classList.add('hidden');
    quizEndScreen.classList.remove('hidden');
    const finalPercentage = Math.round((quizState.score / quizState.questions.length) * 100);
    document.getElementById('finalScore').textContent = `${finalPercentage}%`;
  }
}

function closeQuiz() {
  quizModal.classList.remove('active');
  quizContent.style.transform = 'scale(0.95)';
}

// --- Event Listeners ---
startQuizBtn.addEventListener('click', startQuiz);
closeQuizBtn.addEventListener('click', closeQuiz);
initQuizBtn.addEventListener('click', initQuiz);
nextQBtn.addEventListener('click', nextQuestion);
restartQuizBtn.addEventListener('click', startQuiz); // Restart just re-initializes
exitQuizBtn.addEventListener('click', closeQuiz);