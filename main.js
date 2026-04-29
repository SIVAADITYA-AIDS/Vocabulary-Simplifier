/**
 * main.js — Entry Point Orchestrator
 * Imports all modules and wires DOM events. No business logic lives here.
 */

import { showToast } from './modules/toast.js';
import {
  analyzeText, extractPdfText, generateStory,
  saveSession, fetchLibrary, fetchSession, clearLibrary,
  translateVocabList, SPINNER_SVG
} from './modules/api.js';
import { initAuth, handleAuthButtonClick, getCurrentUser } from './modules/auth.js';
import {
  renderResults, renderLibraryLoading, renderLibraryGrid,
  renderLibraryError, renderLibraryLoggedOut, renderStory
} from './modules/ui.js';
import {
  setVocabList, setTranslatedVocabList,
  startQuiz, closeQuiz, initQuiz, nextQuestion,
  initQuizModeTabs
} from './modules/quiz.js';
import { LANGUAGES } from './modules/languages.js';

// ======================
// Populate Language Select
// ======================
const langSelect = document.getElementById('langSelect');
LANGUAGES.forEach(lang => {
  const opt = document.createElement('option');
  opt.value = lang.code;
  opt.textContent = `${lang.name} — ${lang.native}`;
  langSelect.appendChild(opt);
});

// ======================
// DOM References
// ======================
const authBtn          = document.getElementById('authBtn');
const userNameDisplay  = document.getElementById('userNameDisplay');
const libraryGrid      = document.getElementById('libraryGrid');
const clearLibBtn      = document.getElementById('clearLibBtn');
const saveBtn          = document.getElementById('saveBtn');
const themeSelect      = document.getElementById('themeSelect');
const inputText        = document.getElementById('inputText');
const analyzeBtn       = document.getElementById('analyzeBtn');
const sampleBtn        = document.getElementById('sampleBtn');
const generateStoryBtn = document.getElementById('generateStoryBtn');
const storyContainer   = document.getElementById('storyContainer');
const startQuizBtn     = document.getElementById('startQuizBtn');
const resultsBox       = document.getElementById('resultsBox');
const wordCountBadge   = document.getElementById('wordCountBadge');
const pdfUploadInput   = document.getElementById('pdfUploadInput');
const pdfUploadBtn     = document.getElementById('pdfUploadBtn');
const pdfFileName      = document.getElementById('pdfFileName');
const pdfDropZone      = document.getElementById('pdfDropZone');
const translateBtn     = document.getElementById('translateBtn');
const translationBar   = document.getElementById('translationBar');
const reverseQuizBtn   = document.getElementById('reverseQuizBtn');

const uiElements = { resultsBox, wordCountBadge, startQuizBtn, generateStoryBtn, storyContainer, saveBtn };

// ======================
// State
// ======================
let currentVocabList     = [];
let currentTranslated    = [];
let currentLangName      = '';

// ======================
// 1. AUTH
// ======================
firebase.initializeApp(firebaseConfig);
initAuth(firebase, (user) => {
  if (user) {
    authBtn.textContent = 'Log Out';
    userNameDisplay.textContent = `Hi, ${user.displayName.split(' ')[0]}`;
    userNameDisplay.classList.remove('hidden');
    saveBtn.disabled = false;
    clearLibBtn.classList.remove('hidden');
    loadLibrary();
  } else {
    authBtn.textContent = 'Log In with Google';
    userNameDisplay.classList.add('hidden');
    saveBtn.disabled = true;
    clearLibBtn.classList.add('hidden');
    renderLibraryLoggedOut(libraryGrid);
  }
});
authBtn.addEventListener('click', handleAuthButtonClick);

// ======================
// 2. PDF UPLOAD
// ======================
pdfUploadBtn.addEventListener('click', () => pdfUploadInput.click());
pdfUploadInput.addEventListener('change', e => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); });

pdfDropZone.addEventListener('dragover', e => { e.preventDefault(); pdfDropZone.classList.add('drag-over'); });
pdfDropZone.addEventListener('dragleave', () => pdfDropZone.classList.remove('drag-over'));
pdfDropZone.addEventListener('drop', e => {
  e.preventDefault(); pdfDropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
});

async function handleFileUpload(file) {
  const ext = file.name.toLowerCase();
  if (!ext.endsWith('.pdf') && !ext.endsWith('.epub')) {
    showToast('Only PDF and EPUB files are supported.', 'error'); return;
  }
  if (file.size > 20 * 1024 * 1024) {
    showToast('File is too large. Please upload a file under 20MB.', 'error'); return;
  }
  pdfFileName.textContent = `📎 ${file.name}`;
  pdfFileName.classList.remove('hidden');
  const orig = pdfUploadBtn.innerHTML;
  pdfUploadBtn.innerHTML = `${SPINNER_SVG} Extracting...`;
  pdfUploadBtn.disabled = true;
  try {
    const result = await extractPdfText(file);
    inputText.value = result.text;
    showToast(`Extracted ${result.pageCount} page(s) from "${result.fileName}". Ready to analyze!`, 'success', 5000);
    document.getElementById('analyzer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showToast(`PDF extraction failed: ${err.message}`, 'error');
    pdfFileName.classList.add('hidden');
  } finally {
    pdfUploadBtn.innerHTML = orig;
    pdfUploadBtn.disabled = false;
    pdfUploadInput.value = '';
  }
}

// ======================
// 3. TEXT ANALYSIS
// ======================
analyzeBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const theme = themeSelect.value;
  if (text.length < 20) { showToast('Please enter a longer passage (at least 20 characters).', 'warning'); return; }

  const orig = analyzeBtn.innerHTML;
  analyzeBtn.innerHTML = `${SPINNER_SVG} Analyzing...`;
  analyzeBtn.disabled = true;
  resultsBox.innerHTML = `
    <div class="h-full flex flex-col items-center justify-center text-center gap-3" style="padding:40px 0">
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <p style="color:var(--text-muted);font-size:14px">AI is analyzing your text...</p>
    </div>`;

  // Reset translation state
  currentTranslated = []; currentLangName = '';
  translationBar.classList.add('hidden');
  setTranslatedVocabList([]);

  try {
    currentVocabList = await analyzeText(text, theme);
    setVocabList(currentVocabList);
    renderResults(currentVocabList, uiElements, null, '');
    translationBar.classList.remove('hidden'); // show translation bar
  } catch (err) {
    showToast(`Analysis failed: ${err.message}`, 'error');
    resultsBox.innerHTML = `<div class="h-full flex items-center justify-center" style="color:#f87171;padding:40px 0">Analysis failed. Please try again.</div>`;
  } finally {
    analyzeBtn.innerHTML = orig;
    analyzeBtn.disabled = false;
  }
});

// ======================
// 4. TRANSLATION
// ======================
translateBtn.addEventListener('click', async () => {
  if (currentVocabList.length === 0) { showToast('Analyze some text first.', 'warning'); return; }
  const lang = langSelect.value;
  if (!lang) { showToast('Please select a target language.', 'warning'); return; }

  currentLangName = LANGUAGES.find(l => l.code === lang)?.name || lang;

  const orig = translateBtn.innerHTML;
  translateBtn.innerHTML = `${SPINNER_SVG} Translating...`;
  translateBtn.disabled = true;
  langSelect.disabled = true;

  try {
    currentTranslated = await translateVocabList(currentVocabList, lang);
    setTranslatedVocabList(currentTranslated);
    renderResults(currentVocabList, uiElements, currentTranslated, currentLangName);
    reverseQuizBtn.classList.remove('hidden');
    showToast(`Translated to ${currentLangName}! Toggle EN/TR on each card.`, 'success', 4000);
  } catch (err) {
    showToast(`Translation failed: ${err.message}`, 'error');
  } finally {
    translateBtn.innerHTML = orig;
    translateBtn.disabled = false;
    langSelect.disabled = false;
  }
});

// Reverse Quiz button (separate from main quiz)
reverseQuizBtn.addEventListener('click', () => {
  // Force reverse mode and open quiz
  document.getElementById('modeReverse').click();
  startQuiz();
});

// ======================
// 5. STORY GENERATION
// ======================
generateStoryBtn.addEventListener('click', async () => {
  if (currentVocabList.length === 0) return;
  const orig = generateStoryBtn.innerHTML;
  generateStoryBtn.innerHTML = `${SPINNER_SVG} Generating...`;
  generateStoryBtn.disabled = true;
  try {
    const data = await generateStory(currentVocabList.map(i => i.term));
    renderStory(storyContainer, data.story);
    showToast('Story generated!', 'success', 2000);
  } catch (err) {
    showToast('Failed to generate story. Please try again.', 'error');
  } finally {
    generateStoryBtn.innerHTML = orig;
    generateStoryBtn.disabled = false;
  }
});

// ======================
// 6. SAVE SESSION
// ======================
saveBtn.addEventListener('click', async () => {
  if (!getCurrentUser()) { showToast('You must be logged in to save.', 'warning'); return; }
  if (currentVocabList.length === 0) return;
  const snippet = inputText.value.substring(0, 40) + '...';
  const orig = saveBtn.innerHTML;
  saveBtn.innerHTML = `${SPINNER_SVG} Saving...`;
  saveBtn.disabled = true;
  try {
    await saveSession(snippet, currentVocabList);
    showToast('Session saved to your library! 📚', 'success');
    await loadLibrary();
  } catch (err) {
    showToast(`Save failed: ${err.message}`, 'error');
  } finally {
    saveBtn.innerHTML = orig;
    saveBtn.disabled = false;
  }
});

// ======================
// 7. LIBRARY
// ======================
async function loadLibrary() {
  if (!getCurrentUser()) return;
  renderLibraryLoading(libraryGrid);
  try {
    const history = await fetchLibrary();
    renderLibraryGrid(libraryGrid, history, loadSession);
  } catch (err) {
    renderLibraryError(libraryGrid, 'Failed to load library. Please try again later.');
  }
}

async function loadSession(id) {
  try {
    const session = await fetchSession(id);
    if (session && session.words) {
      currentVocabList = session.words;
      currentTranslated = []; currentLangName = '';
      setVocabList(currentVocabList);
      setTranslatedVocabList([]);
      renderResults(currentVocabList, uiElements, null, '');
      translationBar.classList.remove('hidden');
      reverseQuizBtn.classList.add('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Session loaded!', 'success', 2000);
    }
  } catch (err) {
    showToast('Could not load session. It may have been deleted.', 'error');
  }
}

clearLibBtn.addEventListener('click', async () => {
  if (!confirm('Delete your entire personal library? This cannot be undone.')) return;
  try {
    await clearLibrary();
    showToast('Library cleared.', 'info');
    await loadLibrary();
  } catch (err) {
    showToast('Failed to clear library. Please try again.', 'error');
  }
});

// ======================
// 8. SAMPLE TEXT
// ======================
sampleBtn.addEventListener('click', () => {
  inputText.value = 'The proliferation of digital technology has precipitated a paradigm shift in pedagogical methodologies. While traditional education relied on a teacher-centric model, modern approaches necessitate a more interactive and student-focused framework. This unprecedented integration of sophisticated algorithms into learning platforms has created both opportunities and challenges.';
  showToast('Sample text loaded!', 'info', 2000);
});

// ======================
// 9. QUIZ EVENTS
// ======================
initQuizModeTabs();
startQuizBtn.addEventListener('click', startQuiz);
document.getElementById('closeQuiz').addEventListener('click', closeQuiz);
document.getElementById('initQuizBtn').addEventListener('click', initQuiz);
document.getElementById('nextQBtn').addEventListener('click', nextQuestion);
document.getElementById('restartQuizBtn').addEventListener('click', startQuiz);
document.getElementById('exitQuizBtn').addEventListener('click', closeQuiz);
document.getElementById('quizModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeQuiz(); });