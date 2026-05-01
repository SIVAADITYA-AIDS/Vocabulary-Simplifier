/**
 * main.js — Entry Point Orchestrator
 * Imports all modules and wires DOM events.
 */

import { showToast } from './modules/toast.js';
import {
  analyzeText, extractPdfText, generateStory,
  saveSession, fetchLibrary, fetchSession, clearLibrary,
  translateVocabList, generateMnemonics, simplifyPassage,
  generateSRSQuestions, SPINNER_SVG
} from './modules/api.js';
import { initAuth, handleAuthButtonClick, getCurrentUser } from './modules/auth.js';
import {
  renderResults, renderLibraryLoading, renderLibraryGrid,
  renderLibraryError, renderLibraryLoggedOut, renderStory
} from './modules/ui.js';
import {
  setVocabList, setTranslatedVocabList, setSRSQuestions,
  startQuiz, closeQuiz, initQuiz, nextQuestion,
  initQuizModeTabs, getMode
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
const mnemonicBtn      = document.getElementById('mnemonicBtn');
const simplifyBtn      = document.getElementById('simplifyBtn');
const simplifyResult   = document.getElementById('simplifyResult');
const simplifyText     = document.getElementById('simplifyText');
const simplifyLevelLabel = document.getElementById('simplifyLevelLabel');
const simplifyLevel    = document.getElementById('simplifyLevel');
const useSimplifiedBtn = document.getElementById('useSimplifiedBtn');

const uiElements = { resultsBox, wordCountBadge, startQuizBtn, generateStoryBtn, storyContainer, saveBtn };

// ======================
// State
// ======================
let currentVocabList  = [];
let currentTranslated = [];
let currentMnemonics  = [];
let currentLangName   = '';

// ======================
// 1. AUTH
// ======================
firebase.initializeApp(firebaseConfig);
initAuth(firebase, (user) => {
  if (user) {
    authBtn.textContent = 'Log Out';
    userNameDisplay.textContent = `Hi, ${user.displayName.split(' ')[0]}`;
    userNameDisplay.style.display = 'inline';
    saveBtn.disabled = false;
    clearLibBtn.style.display = 'inline';
    loadLibrary();
  } else {
    authBtn.textContent = 'Log In with Google';
    userNameDisplay.style.display = 'none';
    saveBtn.disabled = true;
    clearLibBtn.style.display = 'none';
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
  pdfFileName.style.display = 'inline';
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
    pdfFileName.style.display = 'none';
  } finally {
    pdfUploadBtn.innerHTML = orig;
    pdfUploadBtn.disabled = false;
    pdfUploadInput.value = '';
  }
}

// ======================
// 3. PASSAGE SIMPLIFIER
// ======================
simplifyBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (text.length < 20) { showToast('Please paste some text to simplify.', 'warning'); return; }
  const level = simplifyLevel.value;
  const orig = simplifyBtn.innerHTML;
  simplifyBtn.innerHTML = `${SPINNER_SVG} Simplifying...`;
  simplifyBtn.disabled = true;
  try {
    const result = await simplifyPassage(text, level);
    simplifyText.textContent = result.simplified;
    simplifyLevelLabel.textContent = level === 'eli5' ? '🧒 EXPLAINED SIMPLY' : '✨ PLAIN ENGLISH';
    simplifyResult.style.display = 'block';
    showToast('Passage simplified! Check the result below the textarea.', 'success', 4000);
  } catch (err) {
    showToast(`Simplification failed: ${err.message}`, 'error');
  } finally {
    simplifyBtn.innerHTML = orig;
    simplifyBtn.disabled = false;
  }
});

// "Use as Input" — copy simplified text into the textarea
useSimplifiedBtn.addEventListener('click', () => {
  if (simplifyText.textContent) {
    inputText.value = simplifyText.textContent;
    simplifyResult.style.display = 'none';
    showToast('Simplified text loaded into the analyzer. Click "Decipher Text"!', 'info', 4000);
  }
});

// ======================
// 4. TEXT ANALYSIS
// ======================
analyzeBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  const theme = themeSelect.value;
  if (text.length < 20) { showToast('Please enter a longer passage (at least 20 characters).', 'warning'); return; }

  const orig = analyzeBtn.innerHTML;
  analyzeBtn.innerHTML = `${SPINNER_SVG} Analyzing...`;
  analyzeBtn.disabled = true;
  resultsBox.innerHTML = `
    <div class="scan-state">
      <div class="scan-frame">
        <div class="scan-line-anim"></div>
        <div class="scan-corner tl"></div>
        <div class="scan-corner tr"></div>
        <div class="scan-corner bl"></div>
        <div class="scan-corner br"></div>
      </div>
      <p class="scan-text">DECIPHERING...</p>
    </div>`;

  // Reset all derived state
  currentTranslated = []; currentMnemonics = []; currentLangName = '';
  translationBar.style.display = 'none';
  mnemonicBtn.style.display = 'none';
  setTranslatedVocabList([]);
  setSRSQuestions([]);

  try {
    currentVocabList = await analyzeText(text, theme);
    setVocabList(currentVocabList);
    renderResults(currentVocabList, uiElements, null, '', null);
    translationBar.style.display = 'block';
    mnemonicBtn.style.display = 'inline';
    mnemonicBtn.disabled = false;
    mnemonicBtn.style.opacity = '1';
  } catch (err) {
    showToast(`Analysis failed: ${err.message}`, 'error');
    resultsBox.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:200px;color:#f87171;">Analysis failed. Please try again.</div>`;
  } finally {
    analyzeBtn.innerHTML = orig;
    analyzeBtn.disabled = false;
  }
});

// ======================
// 5. MEMORY HOOKS (MNEMONICS)
// ======================
mnemonicBtn.addEventListener('click', async () => {
  if (currentVocabList.length === 0) return;
  const orig = mnemonicBtn.innerHTML;
  mnemonicBtn.innerHTML = `${SPINNER_SVG} Generating...`;
  mnemonicBtn.disabled = true;
  try {
    currentMnemonics = await generateMnemonics(currentVocabList);
    // Enable SRS quiz after mnemonics are ready
    setSRSQuestions([]); // clear old; SRS will be generated when quiz starts

    // Re-render cards with mnemonics shown
    renderResults(currentVocabList, uiElements, currentTranslated.length ? currentTranslated : null, currentLangName, currentMnemonics);
    showToast('💡 Memory Hooks generated! Expand them on each card.', 'success', 4000);
  } catch (err) {
    showToast(`Memory Hook generation failed: ${err.message}`, 'error');
  } finally {
    mnemonicBtn.innerHTML = orig;
    mnemonicBtn.disabled = false;
  }
});

// ======================
// 6. TRANSLATION
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
    renderResults(currentVocabList, uiElements, currentTranslated, currentLangName, currentMnemonics.length ? currentMnemonics : null);
    reverseQuizBtn.style.display = 'inline-flex';
    showToast(`Translated to ${currentLangName}! Toggle EN / TR on each card.`, 'success', 4000);
  } catch (err) {
    showToast(`Translation failed: ${err.message}`, 'error');
  } finally {
    translateBtn.innerHTML = orig;
    translateBtn.disabled = false;
    langSelect.disabled = false;
  }
});

reverseQuizBtn.addEventListener('click', () => {
  document.getElementById('modeReverse').click();
  startQuiz();
});

// ======================
// 7. STORY GENERATION
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
// 8. SAVE SESSION
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
// 9. LIBRARY
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
      currentTranslated = []; currentMnemonics = []; currentLangName = '';
      setVocabList(currentVocabList);
      setTranslatedVocabList([]);
      setSRSQuestions([]);
      renderResults(currentVocabList, uiElements, null, '', null);
      translationBar.style.display = 'block';
      mnemonicBtn.style.display = 'inline';
      mnemonicBtn.style.opacity = '1';
      mnemonicBtn.disabled = false;
      reverseQuizBtn.style.display = 'none';
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
// 10. SAMPLE TEXT
// ======================
sampleBtn.addEventListener('click', () => {
  inputText.value = 'The proliferation of digital technology has precipitated a paradigm shift in pedagogical methodologies. While traditional education relied on a teacher-centric model, modern approaches necessitate a more interactive and student-focused framework. This unprecedented integration of sophisticated algorithms into learning platforms has created both opportunities and challenges.';
  simplifyResult.style.display = 'none';
  showToast('Sample text loaded!', 'info', 2000);
});

// ======================
// 11. QUIZ EVENTS
// ======================
initQuizModeTabs();

startQuizBtn.addEventListener('click', async () => {
  const mode = getMode();
  if (mode === 'srs') {
    // SRS requires pre-generated questions — generate them on quiz start
    if (currentVocabList.length < 4) { showToast('You need at least 4 words.', 'warning'); return; }
    const origText = startQuizBtn.textContent;
    startQuizBtn.textContent = '⏳ Generating...';
    startQuizBtn.disabled = true;
    try {
      const sentences = await generateSRSQuestions(currentVocabList);
      setSRSQuestions(sentences);
      startQuiz(sentences);
    } catch (err) {
      showToast(`Smart Quiz generation failed: ${err.message}`, 'error');
    } finally {
      startQuizBtn.textContent = origText;
      startQuizBtn.disabled = false;
    }
  } else {
    startQuiz();
  }
});

document.getElementById('closeQuiz').addEventListener('click', closeQuiz);
document.getElementById('initQuizBtn').addEventListener('click', initQuiz);
document.getElementById('nextQBtn').addEventListener('click', nextQuestion);
document.getElementById('restartQuizBtn').addEventListener('click', async () => {
  // Regenerate SRS sentences on retry for true variety
  if (getMode() === 'srs' && currentVocabList.length >= 4) {
    try {
      const sentences = await generateSRSQuestions(currentVocabList);
      setSRSQuestions(sentences);
      startQuiz(sentences);
    } catch { startQuiz(); }
  } else {
    startQuiz();
  }
});
document.getElementById('exitQuizBtn').addEventListener('click', closeQuiz);
document.getElementById('quizModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeQuiz(); });