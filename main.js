/**
 * main.js — Entry Point Orchestrator
 * Imports all modules and wires DOM events.
 */

import { showToast } from './modules/toast.js';
import {
  analyzeText, extractPdfText, generateStory,
  saveSession, fetchLibrary, fetchSession, clearLibrary,
  translateVocabList, generateMnemonics, simplifyPassage,
  generateSRSQuestions, SPINNER_SVG,
  extractImageText, fetchYouTubeTranscript, sendChatMessage, generateOppositeDay
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

// New feature DOM refs
const oppositeDayBtn   = document.getElementById('oppositeDayBtn');
const imageUploadBtn   = document.getElementById('imageUploadBtn');
const imageUploadInput = document.getElementById('imageUploadInput');
const imageFileName    = document.getElementById('imageFileName');
const youtubeLoadBtn   = document.getElementById('youtubeLoadBtn');
const youtubeUrl       = document.getElementById('youtubeUrl');
const ytStatus         = document.getElementById('ytStatus');
const tutorFab         = document.getElementById('tutorFab');
const tutorPanel       = document.getElementById('tutorPanel');
const tutorClose       = document.getElementById('tutorClose');
const tutorMessages    = document.getElementById('tutorMessages');
const tutorInput       = document.getElementById('tutorInput');
const tutorSend        = document.getElementById('tutorSend');

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
  // Build data dots for scan animation
  const dots = Array.from({length:24},(_,i)=>`<div class="scan-dot" style="animation-delay:${(i*0.08).toFixed(2)}s"></div>`).join('');
  resultsBox.innerHTML = `
    <div class="scan-state">
      <div class="scan-frame">
        <div class="scan-data-dots">${dots}</div>
        <div class="scan-line-anim"></div>
        <div class="scan-corner tl"></div>
        <div class="scan-corner tr"></div>
        <div class="scan-corner bl"></div>
        <div class="scan-corner br"></div>
      </div>
      <p class="scan-text">DECIPHERING...</p>
      <p class="scan-sub">EXTRACTING VOCABULARY</p>
    </div>`;

  // Reset all derived state
  currentTranslated = []; currentMnemonics = []; currentLangName = '';
  translationBar.style.display = 'none';
  mnemonicBtn.style.display = 'none';
  if (oppositeDayBtn) { oppositeDayBtn.style.display = 'none'; }
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
    if (oppositeDayBtn) { oppositeDayBtn.style.display = 'inline'; oppositeDayBtn.disabled = false; oppositeDayBtn.style.opacity = '1'; }
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
// THEME TOGGLE
// ======================
(function initTheme() {
  const saved = localStorage.getItem('decipher-theme') || 'dark';
  // Use data-theme attribute so we never wipe other html classes
  document.documentElement.setAttribute('data-theme', saved);
  // Mark active button — covers both .theme-btn and .theme-btn-sm
  document.querySelectorAll('.theme-btn, .theme-btn-sm').forEach(b => {
    if (b.dataset.theme === saved) b.classList.add('active');
  });
  document.querySelectorAll('.theme-btn, .theme-btn-sm').forEach(b => {
    b.addEventListener('click', () => {
      const t = b.dataset.theme;
      document.documentElement.setAttribute('data-theme', t);
      document.querySelectorAll('.theme-btn, .theme-btn-sm').forEach(x => x.classList.remove('active'));
      // Activate all buttons sharing this theme (desktop + mobile copies)
      document.querySelectorAll(`.theme-btn[data-theme="${t}"], .theme-btn-sm[data-theme="${t}"]`)
        .forEach(x => x.classList.add('active'));
      localStorage.setItem('decipher-theme', t);
    });
  });
})();

// Nav scroll: add .scrolled class so backdrop darkens slightly after hero
(function initNavScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  const onScroll = () => {
    // 1. Darken nav when scrolled
    nav.classList.toggle('scrolled', window.scrollY > 20);
    
    // 2. Scroll Spy (Highlight active nav link)
    let current = '';
    // If we haven't scrolled past the hero section, 'Home' is active
    if (window.scrollY < 400) {
      current = 'home';
    } else {
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= (sectionTop - 150)) {
          current = section.getAttribute('id');
        }
      });
    }

    navLinks.forEach(link => {
      link.classList.remove('nav-link-active');
      const href = link.getAttribute('href');
      if (current === 'home' && href === '#') {
        link.classList.add('nav-link-active');
      } else if (current && href === `#${current}`) {
        link.classList.add('nav-link-active');
      }
    });
  };
  
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

// ======================
// SOURCE TABS
// ======================
document.querySelectorAll('.source-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.source-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.source-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + tab.dataset.src);
    if (panel) panel.classList.add('active');
  });
});

// ======================
// IMAGE OCR
// ======================
if (imageUploadBtn) imageUploadBtn.addEventListener('click', () => imageUploadInput && imageUploadInput.click());
if (imageUploadInput) {
  imageUploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imageFileName) { imageFileName.textContent = '📎 ' + file.name; imageFileName.style.display = 'inline'; }
    const orig = imageUploadBtn.innerHTML;
    imageUploadBtn.innerHTML = SPINNER_SVG + ' Extracting text...';
    imageUploadBtn.disabled = true;
    try {
      const result = await extractImageText(file);
      inputText.value = result.text;
      // Switch to text tab to show the extracted text
      document.getElementById('srcTabText').click();
      showToast('Text extracted from image! Review it and click Decipher Text.', 'success', 5000);
    } catch (err) {
      showToast('OCR failed: ' + err.message, 'error');
    } finally {
      imageUploadBtn.innerHTML = orig;
      imageUploadBtn.disabled = false;
      imageUploadInput.value = '';
    }
  });
}

// ======================
// YOUTUBE TRANSCRIPT
// ======================
if (youtubeLoadBtn) {
  youtubeLoadBtn.addEventListener('click', async () => {
    const url = youtubeUrl ? youtubeUrl.value.trim() : '';
    if (!url) { showToast('Please enter a YouTube URL.', 'warning'); return; }
    const orig = youtubeLoadBtn.innerHTML;
    youtubeLoadBtn.innerHTML = SPINNER_SVG + ' Loading...';
    youtubeLoadBtn.disabled = true;
    if (ytStatus) ytStatus.textContent = 'Fetching transcript...';
    try {
      const result = await fetchYouTubeTranscript(url);
      inputText.value = result.text;
      document.getElementById('srcTabText').click();
      if (ytStatus) ytStatus.textContent = '';
      showToast('Transcript loaded (' + result.wordCount + ' words). Click Decipher Text!', 'success', 5000);
    } catch (err) {
      if (ytStatus) ytStatus.textContent = 'Error: ' + err.message;
      showToast('Transcript failed: ' + err.message, 'error');
    } finally {
      youtubeLoadBtn.innerHTML = orig;
      youtubeLoadBtn.disabled = false;
    }
  });
}

// ======================
// OPPOSITE DAY
// ======================
if (oppositeDayBtn) {
  oppositeDayBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text || currentVocabList.length === 0) { showToast('Analyze some text first.', 'warning'); return; }
    const orig = oppositeDayBtn.innerHTML;
    oppositeDayBtn.innerHTML = SPINNER_SVG + ' Flipping...';
    oppositeDayBtn.disabled = true;
    try {
      const result = await generateOppositeDay(text, currentVocabList);
      // Show result in storyContainer (reuse it)
      storyContainer.style.display = 'block';
      storyContainer.innerHTML = '<div class="opposite-label">🔄 Opposite Day — Antonym Rewrite</div><p style="font-size:13px;line-height:1.7;font-style:italic;">' + result.opposite + '</p>';
      showToast('Opposite Day generated! All words flipped to their antonyms.', 'success', 4000);
    } catch (err) {
      showToast('Opposite Day failed: ' + err.message, 'error');
    } finally {
      oppositeDayBtn.innerHTML = orig;
      oppositeDayBtn.disabled = false;
    }
  });
}

// ======================
// SOCRATIC TUTOR CHAT
// ======================
let chatMessages = [];

function appendTutorMsg(role, content) {
  const el = document.createElement('div');
  el.className = 'tutor-msg ' + role;
  el.textContent = content;
  tutorMessages.appendChild(el);
  tutorMessages.scrollTop = tutorMessages.scrollHeight;
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'tutor-typing'; el.id = 'tutor-typing'; el.textContent = '···';
  tutorMessages.appendChild(el);
  tutorMessages.scrollTop = tutorMessages.scrollHeight;
}
function removeTyping() { const el = document.getElementById('tutor-typing'); if (el) el.remove(); }

async function sendTutorMessage() {
  const text = tutorInput.value.trim();
  if (!text) return;
  // Clear placeholder
  if (tutorMessages.querySelector('.tutor-empty')) tutorMessages.innerHTML = '';
  tutorInput.value = '';
  chatMessages.push({ role: 'user', content: text });
  appendTutorMsg('user', text);
  showTyping();
  tutorSend.disabled = true;
  try {
    const passage = inputText ? inputText.value : '';
    const result = await sendChatMessage(chatMessages, passage, currentVocabList);
    removeTyping();
    chatMessages.push({ role: 'assistant', content: result.reply });
    appendTutorMsg('ai', result.reply);
  } catch (err) {
    removeTyping();
    appendTutorMsg('ai', 'Sorry, I had trouble responding. Please try again.');
  } finally {
    tutorSend.disabled = false;
  }
}

if (tutorFab)   tutorFab.addEventListener('click', () => tutorPanel.classList.toggle('open'));
if (tutorClose) tutorClose.addEventListener('click', () => tutorPanel.classList.remove('open'));
if (tutorSend)  tutorSend.addEventListener('click', sendTutorMessage);
if (tutorInput) tutorInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTutorMessage(); } });

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
  const btn = document.getElementById('restartQuizBtn');
  if (getMode() === 'srs' && currentVocabList.length >= 4) {
    const orig = btn.innerHTML;
    btn.innerHTML = '⏳ Generating...';
    btn.disabled = true;
    try {
      const sentences = await generateSRSQuestions(currentVocabList);
      setSRSQuestions(sentences);
      startQuiz(sentences);
    } catch (err) {
      showToast('Could not regenerate quiz: ' + err.message, 'error');
    } finally {
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  } else {
    startQuiz();
  }
});
document.getElementById('exitQuizBtn').addEventListener('click', closeQuiz);
document.getElementById('quizModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeQuiz(); });
// ======================
// 12. PARALLAX + REVEAL
// ======================
(function initParallaxAndReveal() {
  const heroBg = document.getElementById('heroBg');
  const heroWords = document.getElementById('heroWords');
  const heroContent = document.getElementById('heroContent');
  const heroReticle = document.getElementById('heroReticle');

  // Parallax on scroll
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (heroBg)      heroBg.style.transform      = `translateY(${y * 0.35}px) scale(1.1)`;
    if (heroWords) {
      heroWords.querySelectorAll('.fd1').forEach(el => { el.style.transform = `translateY(${y * -0.18}px)`; });
      heroWords.querySelectorAll('.fd2').forEach(el => { el.style.transform = `translateY(${y * -0.10}px)`; });
      heroWords.querySelectorAll('.fd3').forEach(el => { el.style.transform = `translateY(${y * -0.06}px)`; });
    }
    if (heroContent)  heroContent.style.transform  = `translateY(${y * 0.12}px)`;
    if (heroReticle)  heroReticle.style.transform  = `translate(-50%,-50%) translateY(${y * 0.08}px)`;
  }, { passive: true });

  // Floating word entrance stagger
  if (heroWords) {
    heroWords.querySelectorAll('.float-word').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transition = `opacity 1s ease ${i * 0.12}s, transform 0.05s linear`;
      setTimeout(() => { el.style.opacity = '1'; }, 300 + i * 120);
    });
  }

  // Scroll reveal for sections
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal-section').forEach(el => revealObserver.observe(el));
})();
