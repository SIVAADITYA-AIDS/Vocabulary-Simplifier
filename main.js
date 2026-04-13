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
const API_BASE = 'http://localhost:3000/api';
let currentVocabList = [];

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

// --- API CALLS (Now sending user ID) ---

analyzeBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const theme = themeSelect.value;
  if(text.length < 20) return alert("Please enter a longer passage.");
  try {
    analyzeBtn.innerHTML = `Analyzing...`;
    analyzeBtn.disabled = true;
    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, theme })
    });
    currentVocabList = await response.json();
    renderResults(currentVocabList);
  } catch (err) {
    alert("Failed to analyze text.");
  } finally {
    analyzeBtn.innerHTML = `Analyze`;
    analyzeBtn.disabled = false;
  }
});

generateStoryBtn.addEventListener('click', async () => {
  if (currentVocabList.length === 0) return;
  
  generateStoryBtn.textContent = 'Generating...';
  generateStoryBtn.disabled = true;
  
  try {
    const words = currentVocabList.map(item => item.term);
    const response = await fetch(`${API_BASE}/story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words })
    });
    const data = await response.json();
    storyContainer.textContent = data.story;
    storyContainer.classList.remove('hidden');
  } catch (err) {
    alert("Failed to generate contextual story.");
  } finally {
    generateStoryBtn.textContent = 'Generate Story';
    generateStoryBtn.disabled = false;
  }
});

saveBtn.addEventListener('click', async () => {
  if(!currentUser) return alert("You must be logged in to save.");
  if(currentVocabList.length === 0) return;

  const snippet = inputText.value.substring(0, 40) + "...";
  try {
    saveBtn.textContent = "Saving...";
    await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Send the user ID to the backend!
      body: JSON.stringify({ snippet, words: currentVocabList, userId: currentUser.uid })
    });
    await renderLibrary();
    saveBtn.textContent = "Saved to Cloud!";
    setTimeout(() => saveBtn.textContent = "Save to Cloud", 2000);
  } catch (err) {
    console.error("Failed to save", err);
  }
});

async function renderLibrary() {
  if(!currentUser) return; // Don't fetch if logged out
  
  // UI/UX Improvement: Add a loading state
  libraryGrid.innerHTML = `<div class="glass rounded-xl p-6 col-span-full text-center text-[var(--text-muted)]">Loading your library...</div>`;

  try {
    // Ask the backend only for THIS user's history
    const response = await fetch(`${API_BASE}/history?userId=${currentUser.uid}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
    const response = await fetch(`${API_BASE}/history/${id}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
    try {
        const response = await fetch(`${API_BASE}/history?userId=${currentUser.uid}`, { method: 'DELETE' });
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

// --- QUIZ LOGIC (Unchanged) ---
const quizModal=document.getElementById('quizModal'),quizContent=document.getElementById('quizContent'),closeQuiz=document.getElementById('closeQuiz'),quizStartScreen=document.getElementById('quizStartScreen'),quizPlayScreen=document.getElementById('quizPlayScreen'),quizEndScreen=document.getElementById('quizEndScreen'),initQuizBtn=document.getElementById('initQuizBtn'),nextQBtn=document.getElementById('nextQBtn'),restartQuizBtn=document.getElementById('restartQuizBtn'),exitQuizBtn=document.getElementById('exitQuizBtn');
let quizState={active:false,questions:[],currentIndex:0,score:0};

function startQuiz(){if(currentVocabList.length<4)return alert("Need 4 words minimum");quizState={active:true,questions:[...currentVocabList].sort(()=>Math.random()-0.5).slice(0,10),currentIndex:0,score:0};document.getElementById('quizWordCount').textContent=quizState.questions.length;document.getElementById('totalQ').textContent=quizState.questions.length;quizStartScreen.classList.remove('hidden');quizPlayScreen.classList.add('hidden');quizEndScreen.classList.add('hidden');quizModal.classList.add('active');setTimeout(()=>quizContent.style.transform='scale(1)',10);}
function loadQuestion(){const qData=quizState.questions[quizState.currentIndex];document.getElementById('currentQ').textContent=quizState.currentIndex+1;document.getElementById('currentScore').textContent=quizState.score;document.getElementById('progressBar').style.width=`${(quizState.currentIndex/quizState.questions.length)*100}%`;document.getElementById('questionText').textContent=`What does "${qData.term}" mean?`;let opts=[qData.def],wrongPool=currentVocabList.filter(v=>v.term!==qData.term).sort(()=>Math.random()-0.5);for(let i=0;i<3;i++)opts.push(wrongPool[i]?wrongPool[i].def:"Related concept");opts.sort(()=>Math.random()-0.5);const container=document.getElementById('optionsContainer');container.innerHTML=opts.map(opt=>`<button class="quiz-option" data-correct="${opt===qData.def}">${opt}</button>`).join('');container.querySelectorAll('.quiz-option').forEach(b=>b.addEventListener('click',e=>{container.querySelectorAll('.quiz-option').forEach(btn=>{btn.disabled=true;if(btn.dataset.correct==='true')btn.classList.add('correct');else if(btn===e.target)btn.classList.add('wrong');});if(e.target.dataset.correct==='true'){quizState.score++;document.getElementById('currentScore').textContent=quizState.score;}nextQBtn.classList.remove('hidden');}));nextQBtn.classList.add('hidden');}

startQuizBtn.addEventListener('click',startQuiz);closeQuiz.addEventListener('click',()=>{quizModal.classList.remove('active');quizContent.style.transform='scale(0.95)';});initQuizBtn.addEventListener('click',()=>{quizStartScreen.classList.add('hidden');quizPlayScreen.classList.remove('hidden');loadQuestion();});nextQBtn.addEventListener('click',()=>{if(++quizState.currentIndex<quizState.questions.length)loadQuestion();else{quizPlayScreen.classList.add('hidden');quizEndScreen.classList.remove('hidden');document.getElementById('finalScore').textContent=Math.round((quizState.score/quizState.questions.length)*100)+'%';}});restartQuizBtn.addEventListener('click',startQuiz);exitQuizBtn.addEventListener('click',()=>closeQuiz.click());