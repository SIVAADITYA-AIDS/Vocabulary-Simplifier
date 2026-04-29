/**
 * Quiz Module — Standard + Reverse Mode
 *
 * Standard Mode:  Show English term → select correct definition.
 * Reverse Mode:   Show translated definition → select correct English term.
 */

import { showToast } from './toast.js';

// DOM references
const quizModal      = document.getElementById('quizModal');
const quizContent    = document.getElementById('quizContent');
const quizStartScreen= document.getElementById('quizStartScreen');
const quizPlayScreen = document.getElementById('quizPlayScreen');
const quizEndScreen  = document.getElementById('quizEndScreen');
const optionsContainer = document.getElementById('optionsContainer');
const nextQBtn       = document.getElementById('nextQBtn');
const modeStandard   = document.getElementById('modeStandard');
const modeReverse    = document.getElementById('modeReverse');
const reverseUnavail = document.getElementById('reverseUnavailNote');

let fullVocabList      = [];   // [{term, def, syn, context}]
let translatedVocabList = [];  // [{term, translatedDef, translatedContext, ...}]
let currentMode        = 'standard'; // 'standard' | 'reverse'
let quizState = { active: false, questions: [], currentIndex: 0, score: 0 };

// ----------------------
// Public API
// ----------------------

export function setVocabList(list) {
  fullVocabList = list;
}

export function setTranslatedVocabList(list) {
  translatedVocabList = list;
  // Enable reverse mode tab if we have data
  if (modeReverse) {
    modeReverse.disabled = (list.length === 0);
    if (reverseUnavail) reverseUnavail.classList.toggle('hidden', list.length > 0);
  }
}

export function startQuiz() {
  if (fullVocabList.length < 4) {
    showToast('You need at least 4 words to start a quiz.', 'warning'); return;
  }
  // Default to standard if reverse has no data
  if (currentMode === 'reverse' && translatedVocabList.length === 0) {
    showToast('Translate the words first to use Reverse Mode.', 'warning'); return;
  }

  _buildAndOpen();
}

export function closeQuiz() {
  quizModal.classList.remove('active');
  quizContent.style.transform = 'scale(0.95)';
  quizContent.style.opacity = '0';
}

export function initQuiz() {
  quizStartScreen.style.display = 'none';
  quizPlayScreen.style.display  = 'block';
  loadQuestion();
}

export function nextQuestion() {
  quizState.currentIndex++;
  if (quizState.currentIndex < quizState.questions.length) {
    loadQuestion();
  } else {
    endQuiz();
  }
}

// ----------------------
// Mode Tab Wiring (called from main.js)
// ----------------------
export function initQuizModeTabs() {
  if (!modeStandard || !modeReverse) return;
  modeStandard.addEventListener('click', () => setMode('standard'));
  modeReverse.addEventListener('click',  () => setMode('reverse'));
}

function setMode(mode) {
  currentMode = mode;
  modeStandard.classList.toggle('mode-active', mode === 'standard');
  modeReverse.classList.toggle('mode-active', mode === 'reverse');
}

// ----------------------
// Private Helpers
// ----------------------

function _buildAndOpen() {
  const shuffled = [...fullVocabList].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, 10);

  quizState = { active: true, questions, currentIndex: 0, score: 0 };

  document.getElementById('quizWordCount').textContent = questions.length;
  document.getElementById('totalQ').textContent = questions.length;
  document.getElementById('quizModeLabel').textContent =
    currentMode === 'reverse' ? '🔄 Reverse Mode' : '📘 Standard Mode';

  quizStartScreen.style.display = 'block';
  quizPlayScreen.style.display  = 'none';
  quizEndScreen.style.display   = 'none';

  quizModal.classList.add('active');
  requestAnimationFrame(() => {
    quizContent.style.transform = 'scale(1)';
    quizContent.style.opacity = '1';
  });
}

function loadQuestion() {
  const qData = quizState.questions[quizState.currentIndex];
  const progress = ((quizState.currentIndex + 1) / quizState.questions.length) * 100;

  document.getElementById('currentQ').textContent = quizState.currentIndex + 1;
  document.getElementById('currentScore').textContent = quizState.score;
  document.getElementById('progressBar').style.width = `${progress}%`;
  nextQBtn.classList.add('hidden');

  if (currentMode === 'reverse') {
    _loadReverseQuestion(qData);
  } else {
    _loadStandardQuestion(qData);
  }
}

function _loadStandardQuestion(qData) {
  // Show English term → pick correct definition
  document.getElementById('questionText').innerHTML =
    `What does <span class="question-term">"${qData.term}"</span> mean?`;

  let options = [qData.def];
  const wrong = fullVocabList.filter(v => v.term !== qData.term).sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3; i++) options.push(wrong[i] ? wrong[i].def : 'A related concept.');
  options.sort(() => Math.random() - 0.5);

  optionsContainer.innerHTML = options.map(opt =>
    `<button class="quiz-option" data-correct="${opt === qData.def}">${opt}</button>`
  ).join('');
  _attachOptionListeners();
}

function _loadReverseQuestion(qData) {
  // Build lookup for translated data
  const tMap = {};
  translatedVocabList.forEach(t => { tMap[t.term.toLowerCase()] = t; });
  const tData = tMap[qData.term.toLowerCase()];

  if (!tData) {
    // fallback to standard if translation missing for this word
    _loadStandardQuestion(qData); return;
  }

  // Show translated definition → pick correct English term
  document.getElementById('questionText').innerHTML =
    `<span class="question-hint">Which English word matches this meaning?</span><br>
     <span class="question-translated">${tData.translatedDef}</span>`;

  // Options: English terms (not definitions)
  let correctTerm = qData.term;
  let options = [correctTerm];
  const wrong = fullVocabList.filter(v => v.term !== qData.term).sort(() => Math.random() - 0.5);
  for (let i = 0; i < 3; i++) options.push(wrong[i] ? wrong[i].term : 'unknown');
  options.sort(() => Math.random() - 0.5);

  optionsContainer.innerHTML = options.map(opt =>
    `<button class="quiz-option quiz-option-term" data-correct="${opt === correctTerm}">${opt}</button>`
  ).join('');
  _attachOptionListeners();
}

function _attachOptionListeners() {
  optionsContainer.querySelectorAll('.quiz-option').forEach(btn =>
    btn.addEventListener('click', handleOptionClick)
  );
}

function handleOptionClick(event) {
  const clicked = event.currentTarget;
  const isCorrect = clicked.dataset.correct === 'true';

  if (isCorrect) {
    quizState.score++;
    document.getElementById('currentScore').textContent = quizState.score;
  }

  optionsContainer.querySelectorAll('.quiz-option').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.correct === 'true') btn.classList.add('correct');
    else if (btn === clicked) btn.classList.add('wrong');
  });

  nextQBtn.classList.remove('hidden');
}

function endQuiz() {
  quizPlayScreen.style.display = 'none';
  quizEndScreen.style.display  = 'block';
  const pct = Math.round((quizState.score / quizState.questions.length) * 100);
  document.getElementById('finalScore').textContent = `${pct}%`;

  const modeStr = currentMode === 'reverse' ? 'Reverse Mode' : 'Standard Mode';
  if (pct === 100) showToast(`Perfect score in ${modeStr}! You're a vocabulary master! 🏆`, 'success', 6000);
  else if (pct >= 70) showToast(`Great job in ${modeStr}! You scored ${pct}% 🌟`, 'success', 5000);
  else showToast(`You scored ${pct}% in ${modeStr}. Keep practicing!`, 'info', 5000);
}
