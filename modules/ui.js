/**
 * UI Rendering Module
 * Handles all DOM updates: vocab cards (with translation), library grid, story panel.
 */

import { showToast } from './toast.js';

// ----------------------
// Vocab Card Rendering
// ----------------------

/**
 * Render vocabulary cards. Merges English data with optional translated data.
 * @param {Array} vocabArray   - [{term, def, syn, context}]
 * @param {object} elements    - key DOM element references
 * @param {Array|null} translated - [{term, translatedDef, translatedContext, culturalNote, mirrorWord}]
 * @param {string} langName    - display name of target language (e.g. "Spanish")
 */
export function renderResults(vocabArray, elements, translated = null, langName = '') {
  const { resultsBox, wordCountBadge, startQuizBtn, generateStoryBtn, storyContainer, saveBtn } = elements;
  if (!vocabArray || vocabArray.length === 0) return;

  // Build a lookup map for translated data
  const translatedMap = {};
  if (translated) {
    translated.forEach(t => { translatedMap[t.term.toLowerCase()] = t; });
  }

  resultsBox.innerHTML = vocabArray.map((item, i) => {
    const t = translatedMap[item.term.toLowerCase()] || null;
    const hasTranslation = !!t;
    const hasCulturalNote = hasTranslation && t.culturalNote && t.culturalNote.trim();
    const hasMirrorWord = hasTranslation && t.mirrorWord && t.mirrorWord.nativeWord;

    return `
    <div class="vocab-card" style="animation-delay:${i * 0.05}s">
      <!-- Header row -->
      <div class="vocab-card-header">
        <div class="flex items-center gap-2">
          <span class="vocab-term">${item.term}</span>
          ${hasMirrorWord ? `<span class="mirror-badge" title="${t.mirrorWord.alert}">🪞 Mirror Word</span>` : ''}
        </div>
        <div class="flex items-center gap-2">
          <button class="speak-btn" data-word="${item.term}" title="Pronounce '${item.term}'" aria-label="Speak ${item.term}">🔊</button>
          ${hasTranslation ? `
          <button class="lang-toggle-btn" data-index="${i}" title="Toggle translation">
            <span class="lang-toggle-en active-lang">EN</span>
            <span class="lang-toggle-sep">|</span>
            <span class="lang-toggle-tr">${langName.slice(0,3).toUpperCase()}</span>
          </button>` : ''}
        </div>
      </div>

      <!-- English panel (always visible by default) -->
      <div class="vocab-panel vocab-panel-en" id="panel-en-${i}">
        <p class="vocab-def">${item.def}</p>
        <p class="vocab-syn"><span class="syn-label">Syn:</span> ${item.syn}</p>
        <p class="vocab-context">${item.context}</p>
      </div>

      <!-- Translated panel (hidden until toggled) -->
      ${hasTranslation ? `
      <div class="vocab-panel vocab-panel-tr hidden" id="panel-tr-${i}">
        <p class="vocab-def">${t.translatedDef}</p>
        <p class="vocab-context translated-context">${t.translatedContext}</p>
        ${hasCulturalNote ? `
        <button class="cultural-toggle" data-target="cultural-${i}">
          🌍 Cultural Note <span class="chevron">▾</span>
        </button>
        <div class="cultural-note hidden" id="cultural-${i}">${t.culturalNote}</div>
        ` : ''}
        ${hasMirrorWord ? `
        <div class="mirror-alert">
          <span class="mirror-icon">🪞</span>
          <div>
            <p class="mirror-title">Watch Out — Mirror Word!</p>
            <p class="mirror-body">${t.mirrorWord.alert}</p>
          </div>
        </div>` : ''}
      </div>` : ''}
    </div>`;
  }).join('');

  wordCountBadge.textContent = `(${vocabArray.length})`;
  startQuizBtn.disabled = false;
  startQuizBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  generateStoryBtn.disabled = false;
  generateStoryBtn.style.display = 'inline';
  generateStoryBtn.style.opacity = '1';
  generateStoryBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  storyContainer.style.display = 'none';
  storyContainer.innerHTML = '';
  saveBtn.style.display = 'inline';

  // Speak buttons
  resultsBox.querySelectorAll('.speak-btn').forEach(btn => {
    btn.addEventListener('click', () => speakWord(btn.dataset.word));
  });

  // EN/TR toggle buttons
  resultsBox.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.dataset.index;
      const enPanel = document.getElementById(`panel-en-${idx}`);
      const trPanel = document.getElementById(`panel-tr-${idx}`);
      const enLabel = btn.querySelector('.lang-toggle-en');
      const trLabel = btn.querySelector('.lang-toggle-tr');
      const showingEn = !enPanel.classList.contains('hidden');
      if (showingEn) {
        enPanel.classList.add('hidden'); trPanel.classList.remove('hidden');
        enLabel.classList.remove('active-lang'); trLabel.classList.add('active-lang');
      } else {
        trPanel.classList.add('hidden'); enPanel.classList.remove('hidden');
        trLabel.classList.remove('active-lang'); enLabel.classList.add('active-lang');
      }
    });
  });

  // Cultural note toggles
  resultsBox.querySelectorAll('.cultural-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const chevron = btn.querySelector('.chevron');
      target.classList.toggle('hidden');
      chevron.textContent = target.classList.contains('hidden') ? '▾' : '▴';
    });
  });
}

// ----------------------
// Speak (Web Speech API)
// ----------------------
function speakWord(word) {
  if (!('speechSynthesis' in window)) {
    showToast('Your browser does not support text-to-speech.', 'warning'); return;
  }
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'en-US'; u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ----------------------
// Library Grid
// ----------------------

export function renderLibraryLoading(libraryGrid) {
  libraryGrid.innerHTML = `<div class="lib-placeholder">Loading your library...</div>`;
}

export function renderLibraryGrid(libraryGrid, history, onSessionClick) {
  if (history.length === 0) {
    libraryGrid.innerHTML = `<div class="lib-placeholder lib-empty">Your library is empty. Analyze and save a session to get started.</div>`;
    return;
  }
  libraryGrid.innerHTML = history.map(item => `
    <div class="lib-card" data-session-id="${item.id}" role="button" tabindex="0" aria-label="Load session from ${item.date}">
      <div class="lib-card-meta">
        <span class="lib-date">${item.date}</span>
        <span class="lib-count">${item.words.length} words</span>
      </div>
      <p class="lib-snippet">${item.snippet}</p>
      <div class="lib-card-footer">Load Session →</div>
    </div>
  `).join('');

  libraryGrid.querySelectorAll('[data-session-id]').forEach(card => {
    const handler = () => onSessionClick(card.dataset.sessionId);
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });
}

export function renderLibraryError(libraryGrid, message) {
  libraryGrid.innerHTML = `<div class="lib-placeholder lib-error">${message}</div>`;
}

export function renderLibraryLoggedOut(libraryGrid) {
  libraryGrid.innerHTML = `<div class="lib-placeholder">Please log in to view your saved sessions.</div>`;
}

// ----------------------
// Story Panel
// ----------------------
export function renderStory(storyContainer, storyText) {
  storyContainer.innerHTML = `
    <div class="story-header">
      <span class="story-label">📖 AI Generated Story</span>
      <button id="copyStoryBtn" class="story-copy-btn">Copy</button>
    </div>
    <p class="story-body">${storyText}</p>
  `;
  storyContainer.style.display = 'block';
  storyContainer.querySelector('#copyStoryBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(storyText)
      .then(() => showToast('Story copied!', 'success', 2000))
      .catch(() => showToast('Could not copy. Please select manually.', 'error'));
  });
}
