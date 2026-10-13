/* ===================================================
   FIELDWORK – Landform Label Lab
   Application Logic
   =================================================== */

// ── Question Data ──
const QUESTIONS = {
  q1: {
    id: 'q1',
    number: '01',
    title: 'Coastal Erosion',
    image: 'coastal_erosion.jpg',
    alt: 'Coastal erosion diagram showing the process of erosion creating various landforms',
    labels: [
      { id: 'l1', text: 'Headland' },
      { id: 'l2', text: 'Crack' },
      { id: 'l3', text: 'Blow hole' },
      { id: 'l4', text: 'Sea cave' },
      { id: 'l5', text: 'Arch' },
      { id: 'l6', text: 'Sea stack' },
      { id: 'l7', text: 'Stump' },
    ],
    // Target positions are percentages relative to image dimensions
    targets: [
      { id: 't1', number: 1, x: 12, y: 50, correctLabel: 'l1' },   // Headland / Crack
      { id: 't2', number: 2, x: 28, y: 70, correctLabel: 'l4' },   // Sea cave
      { id: 't3', number: 3, x: 28, y: 32, correctLabel: 'l3' },   // Blow hole
      { id: 't4', number: 4, x: 44, y: 60, correctLabel: 'l5' },   // Arch
      { id: 't5', number: 5, x: 57, y: 58, correctLabel: 'l6' },   // Sea stack
      { id: 't6', number: 6, x: 72, y: 78, correctLabel: 'l7' },   // Stump
      { id: 't7', number: 7, x: 65, y: 40, correctLabel: 'l2' },   // Crack / second stack
    ],
    answerMap: {
      t1: 'l1', // 1 → Headland
      t2: 'l4', // 2 → Sea cave
      t3: 'l3', // 3 → Blow hole
      t4: 'l5', // 4 → Arch
      t5: 'l6', // 5 → Sea stack
      t6: 'l7', // 6 → Stump
      t7: 'l2', // 7 → Crack
    }
  },
  q2: {
    id: 'q2',
    number: '02',
    title: 'Cave Interior',
    image: 'cave_interior.jpg',
    alt: 'Cave interior diagram showing stalactites, stalagmites, and columns',
    labels: [
      { id: 'l1', text: 'Stalactite' },
      { id: 'l2', text: 'Stalagmite' },
      { id: 'l3', text: 'Column' },
    ],
    targets: [
      { id: 't1', number: 1, x: 32, y: 32, correctLabel: 'l1' },   // Stalactite
      { id: 't2', number: 2, x: 32, y: 76, correctLabel: 'l2' },   // Stalagmite
      { id: 't3', number: 3, x: 58, y: 54, correctLabel: 'l3' },   // Column
    ],
    answerMap: {
      t1: 'l1', // 1 → Stalactite
      t2: 'l2', // 2 → Stalagmite
      t3: 'l3', // 3 → Column
    }
  },
  q3: {
    id: 'q3',
    number: '03',
    title: 'U-shaped Valley',
    image: 'u_shaped_valley.jpg',
    alt: 'U-shaped glacial valley diagram showing corries, arêtes, ribbon lakes and truncated spurs',
    labels: [
      { id: 'l1', text: 'Corrie' },
      { id: 'l2', text: 'Arête' },
      { id: 'l3', text: 'Truncated spur' },
      { id: 'l4', text: 'Ribbon lake' },
    ],
    targets: [
      { id: 't1', number: 1, x: 42, y: 18, correctLabel: 'l1' },   // Corrie
      { id: 't2', number: 2, x: 58, y: 24, correctLabel: 'l2' },   // Arête
      { id: 't3', number: 3, x: 28, y: 52, correctLabel: 'l3' },   // Truncated spur
      { id: 't4', number: 4, x: 42, y: 78, correctLabel: 'l4' },   // Ribbon lake
    ],
    answerMap: {
      t1: 'l1', // 1 → Corrie
      t2: 'l2', // 2 → Arête
      t3: 'l3', // 3 → Truncated spur
      t4: 'l4', // 4 → Ribbon lake
    }
  }
};

// ── App State ──
let currentQuestion = null;
let placements = {};        // { targetId: labelId }
let checkedState = null;     // null | { results: { targetId: boolean } }
let selectedLabel = null;    // for touch fallback
let draggedLabelId = null;

// ── DOM Elements ──
const homeScreen = document.getElementById('home-screen');
const activityScreen = document.getElementById('activity-screen');
const diagramCanvas = document.getElementById('diagram-canvas');
const diagramImage = document.getElementById('diagram-image');
const labelBank = document.getElementById('label-bank');
const progressText = document.getElementById('progress-text');
const progressDots = document.getElementById('progress-dots');
const btnCheck = document.getElementById('btn-check');
const btnReset = document.getElementById('btn-reset');
const feedbackBanner = document.getElementById('feedback-banner');
const feedbackIcon = document.getElementById('feedback-icon');
const feedbackMessage = document.getElementById('feedback-message');
const answerReview = document.getElementById('answer-review');
const answerList = document.getElementById('answer-list');
const postCheckBar = document.getElementById('post-check-bar');
const actionBar = document.getElementById('action-bar');
const activityBadge = document.getElementById('activity-badge');
const activityTitle = document.getElementById('activity-title');

// ── Navigation ──
function showHome() {
  homeScreen.classList.remove('hidden');
  activityScreen.classList.remove('active');
  homeScreen.style.display = '';
  document.getElementById('nav-home').classList.add('active');
  document.getElementById('nav-practice').textContent = 'Practice';
  document.getElementById('nav-practice').classList.remove('active');
  selectedLabel = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startQuestion(qId) {
  currentQuestion = QUESTIONS[qId];
  placements = {};
  checkedState = null;
  selectedLabel = null;

  // Load saved state from localStorage
  loadState(qId);

  // Update UI
  homeScreen.classList.add('hidden');
  homeScreen.style.display = 'none';
  activityScreen.classList.add('active');

  activityBadge.textContent = `Question ${currentQuestion.number}`;
  activityTitle.textContent = currentQuestion.title;

  document.getElementById('nav-home').classList.remove('active');
  document.getElementById('nav-practice').textContent = `Practice / ${currentQuestion.title}`;
  document.getElementById('nav-practice').classList.add('active');

  // Highlight active question nav
  ['q1', 'q2', 'q3'].forEach(id => {
    const el = document.getElementById(`nav-${id}`);
    if (id === qId) {
      el.style.color = 'var(--deep-field-ink)';
      el.style.fontWeight = '600';
    } else {
      el.style.color = '';
      el.style.fontWeight = '';
    }
  });

  renderDiagram();
  renderLabelBank();
  renderDropTargets();
  updateProgress();
  resetFeedback();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Rendering ──
function renderDiagram() {
  diagramImage.src = currentQuestion.image;
  diagramImage.alt = currentQuestion.alt;
}

function renderDropTargets() {
  // Remove existing targets
  diagramCanvas.querySelectorAll('.drop-target').forEach(el => el.remove());

  currentQuestion.targets.forEach(target => {
    const el = document.createElement('div');
    el.className = 'drop-target';
    el.id = `target-${target.id}`;
    el.dataset.targetId = target.id;
    el.style.left = `${target.x}%`;
    el.style.top = `${target.y}%`;

    const placedLabelId = placements[target.id];
    if (placedLabelId) {
      const label = currentQuestion.labels.find(l => l.id === placedLabelId);
      el.classList.add('occupied');
      el.innerHTML = `${target.number}<span class="placed-label">${label.text}</span>`;

      // Apply check state if exists
      if (checkedState) {
        if (checkedState.results[target.id]) {
          el.classList.add('correct');
        } else {
          el.classList.add('incorrect');
        }
      }
    } else {
      el.textContent = target.number;
    }

    // Drag events
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('drop', handleDrop);

    // Touch/click target (for touch fallback)
    el.addEventListener('click', (e) => handleTargetClick(target.id, e));

    diagramCanvas.appendChild(el);
  });
}

function renderLabelBank() {
  labelBank.innerHTML = '';

  // Shuffle labels for each fresh render (but not if loaded from state)
  const labels = [...currentQuestion.labels];
  if (Object.keys(placements).length === 0) {
    shuffleArray(labels);
  }

  labels.forEach(label => {
    const chip = document.createElement('div');
    chip.className = 'label-chip';
    chip.id = `label-${label.id}`;
    chip.dataset.labelId = label.id;
    chip.textContent = label.text;
    chip.draggable = true;

    // Check if this label is placed
    const isPlaced = Object.values(placements).includes(label.id);
    if (isPlaced) {
      chip.classList.add('placed');
      chip.draggable = false;
    }

    // Apply check state styling
    if (checkedState && isPlaced) {
      const targetId = Object.keys(placements).find(tid => placements[tid] === label.id);
      if (checkedState.results[targetId]) {
        chip.classList.add('correct-chip');
        chip.draggable = false;
      } else {
        chip.classList.add('incorrect-chip');
        chip.classList.remove('placed');
        chip.draggable = true;
      }
    }

    // Drag events
    chip.addEventListener('dragstart', handleDragStart);
    chip.addEventListener('dragend', handleDragEnd);

    // Touch/click label (for touch fallback)
    chip.addEventListener('click', (e) => handleLabelClick(label.id, e));

    labelBank.appendChild(chip);
  });
}

function updateProgress() {
  const total = currentQuestion.targets.length;
  const placed = Object.keys(placements).length;

  progressText.textContent = `${placed} of ${total} placed`;

  // Render dots
  progressDots.innerHTML = '';
  currentQuestion.targets.forEach(target => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (placements[target.id]) {
      dot.classList.add('filled');

      if (checkedState) {
        dot.classList.remove('filled');
        dot.classList.add(checkedState.results[target.id] ? 'correct' : 'incorrect');
      }
    }
    progressDots.appendChild(dot);
  });

  // Enable/disable check button
  btnCheck.disabled = placed < total || checkedState !== null;
}

function resetFeedback() {
  feedbackBanner.classList.remove('visible', 'all-correct', 'has-errors');
  answerReview.classList.remove('visible');
  postCheckBar.style.display = 'none';
  actionBar.style.display = '';
}

// ── Drag & Drop (mouse) ──
function handleDragStart(e) {
  const labelId = e.target.dataset.labelId;
  if (!labelId) return;

  draggedLabelId = labelId;
  e.target.classList.add('dragging');
  labelBank.classList.add('drag-active');

  // Custom drag image
  const ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
  ghost.textContent = e.target.textContent;
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
  setTimeout(() => ghost.remove(), 0);

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', labelId);
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  labelBank.classList.remove('drag-active');
  draggedLabelId = null;

  // Remove drag-over from all targets
  diagramCanvas.querySelectorAll('.drop-target').forEach(t => {
    t.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (target.classList.contains('correct')) return; // don't allow re-drop on correct
  target.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  const targetEl = e.currentTarget;
  targetEl.classList.remove('drag-over');

  const targetId = targetEl.dataset.targetId;
  const labelId = e.dataTransfer.getData('text/plain') || draggedLabelId;
  if (!labelId || !targetId) return;

  // Don't allow drops on correct targets after checking
  if (checkedState && checkedState.results[targetId]) return;

  placeLabel(targetId, labelId);
}

// ── Touch / Click Fallback ──
function handleLabelClick(labelId, e) {
  e.stopPropagation();

  // If label is placed and correct, do nothing
  if (checkedState) {
    const targetId = Object.keys(placements).find(tid => placements[tid] === labelId);
    if (targetId && checkedState.results[targetId]) return;
  }

  // If already placed, unplace it
  const existingTarget = Object.keys(placements).find(tid => placements[tid] === labelId);
  if (existingTarget && !checkedState) {
    delete placements[existingTarget];
    saveState();
    renderLabelBank();
    renderDropTargets();
    updateProgress();
    return;
  }

  // Select/deselect label
  if (selectedLabel === labelId) {
    selectedLabel = null;
  } else {
    selectedLabel = labelId;
  }

  // Update visual selection
  labelBank.querySelectorAll('.label-chip').forEach(chip => {
    chip.classList.toggle('selected', chip.dataset.labelId === selectedLabel);
  });
}

function handleTargetClick(targetId, e) {
  e.stopPropagation();

  // Don't allow clicks on correct targets after checking
  if (checkedState && checkedState.results[targetId]) return;

  // If a label is selected, place it
  if (selectedLabel) {
    placeLabel(targetId, selectedLabel);
    selectedLabel = null;
    labelBank.querySelectorAll('.label-chip').forEach(chip => {
      chip.classList.remove('selected');
    });
    return;
  }

  // If target has a label, unplace it
  if (placements[targetId] && !checkedState) {
    delete placements[targetId];
    saveState();
    renderLabelBank();
    renderDropTargets();
    updateProgress();
  }
}

// ── Placement Logic ──
function placeLabel(targetId, labelId) {
  // If this label is already placed elsewhere, remove it from there
  const existingTarget = Object.keys(placements).find(tid => placements[tid] === labelId);
  if (existingTarget) {
    delete placements[existingTarget];
  }

  // If this target already has a label, return it to bank
  if (placements[targetId]) {
    // In retry mode, if label was incorrect, allow swap
    // The old label goes back to bank automatically through rendering
  }

  // Place
  placements[targetId] = labelId;
  saveState();

  // Re-render
  renderLabelBank();
  renderDropTargets();
  updateProgress();

  // Quick haptic-like feedback (flash)
  const targetEl = document.getElementById(`target-${targetId}`);
  if (targetEl) {
    targetEl.style.transition = 'none';
    targetEl.style.transform = 'translate(-50%, -50%) scale(1.2)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targetEl.style.transition = 'transform 0.2s ease';
        targetEl.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    });
  }
}

// ── Check Answers ──
function checkAnswers() {
  if (!currentQuestion || checkedState) return;

  const results = {};
  let correctCount = 0;
  const total = currentQuestion.targets.length;

  currentQuestion.targets.forEach(target => {
    const placedLabelId = placements[target.id];
    const isCorrect = placedLabelId === currentQuestion.answerMap[target.id];
    results[target.id] = isCorrect;
    if (isCorrect) correctCount++;
  });

  checkedState = { results };

  // Show feedback
  feedbackBanner.classList.add('visible');
  if (correctCount === total) {
    feedbackBanner.classList.add('all-correct');
    feedbackIcon.textContent = '✓';
    feedbackMessage.innerHTML = `<strong>All correct!</strong> You matched all ${total} landform features perfectly.`;
  } else {
    feedbackBanner.classList.add('has-errors');
    feedbackIcon.textContent = '✕';
    feedbackMessage.innerHTML = `<strong>${correctCount} of ${total} correct.</strong> Incorrect matches are highlighted in red. Try again to fix them.`;
  }

  // Show answer review
  answerReview.classList.add('visible');
  renderAnswerReview(results);

  // Show post-check actions
  postCheckBar.style.display = '';
  actionBar.style.display = 'none';

  // Re-render with check state
  renderLabelBank();
  renderDropTargets();
  updateProgress();
  saveState();
}

function renderAnswerReview(results) {
  answerList.innerHTML = '';

  currentQuestion.targets.forEach(target => {
    const item = document.createElement('div');
    const isCorrect = results[target.id];
    item.className = `answer-item ${isCorrect ? 'correct' : 'incorrect'}`;

    const placedLabel = currentQuestion.labels.find(l => l.id === placements[target.id]);
    const correctLabel = currentQuestion.labels.find(l => l.id === currentQuestion.answerMap[target.id]);

    let inner = `<div class="marker">${target.number}</div>`;
    inner += `<span>${placedLabel ? placedLabel.text : '—'}</span>`;
    if (!isCorrect) {
      inner += `<span class="correct-answer">→ ${correctLabel.text}</span>`;
    }

    item.innerHTML = inner;
    answerList.appendChild(item);
  });
}

// ── Retry / Reset ──
function retryQuestion() {
  if (!currentQuestion || !checkedState) return;

  // Keep correct placements, remove incorrect ones
  const newPlacements = {};
  Object.keys(placements).forEach(targetId => {
    if (checkedState.results[targetId]) {
      newPlacements[targetId] = placements[targetId];
    }
  });

  placements = newPlacements;
  checkedState = null;
  resetFeedback();
  saveState();

  renderLabelBank();
  renderDropTargets();
  updateProgress();
}

function resetQuestion() {
  if (!currentQuestion) return;

  placements = {};
  checkedState = null;
  selectedLabel = null;
  resetFeedback();
  saveState();

  renderLabelBank();
  renderDropTargets();
  updateProgress();
}

// ── Local Storage ──
function saveState() {
  if (!currentQuestion) return;
  const state = {
    placements,
    checkedState,
    timestamp: Date.now()
  };
  try {
    localStorage.setItem(`fieldwork_${currentQuestion.id}`, JSON.stringify(state));
  } catch (e) {
    // localStorage unavailable — fail silently
  }
}

function loadState(qId) {
  try {
    const raw = localStorage.getItem(`fieldwork_${qId}`);
    if (raw) {
      const state = JSON.parse(raw);
      placements = state.placements || {};
      checkedState = state.checkedState || null;
    }
  } catch (e) {
    placements = {};
    checkedState = null;
  }
}

// ── Utilities ──
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ── Keyboard Accessibility ──
document.addEventListener('keydown', (e) => {
  // Enter/Space on question cards
  if (e.key === 'Enter' || e.key === ' ') {
    const card = document.activeElement;
    if (card && card.classList.contains('question-card')) {
      e.preventDefault();
      card.click();
    }
  }

  // Escape to deselect or go home
  if (e.key === 'Escape') {
    if (selectedLabel) {
      selectedLabel = null;
      labelBank.querySelectorAll('.label-chip').forEach(chip => {
        chip.classList.remove('selected');
      });
    }
  }
});

// Tab through labels and targets for keyboard matching
labelBank?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const chip = e.target;
    if (chip.classList.contains('label-chip')) {
      e.preventDefault();
      handleLabelClick(chip.dataset.labelId, e);
    }
  }
});

// ── Touch Event Support (for mobile drag) ──
let touchDragLabel = null;
let touchGhost = null;

document.addEventListener('touchstart', (e) => {
  const chip = e.target.closest('.label-chip');
  if (!chip || chip.classList.contains('placed') || chip.classList.contains('correct-chip')) return;

  touchDragLabel = chip.dataset.labelId;
  chip.classList.add('dragging');

  // Create ghost
  touchGhost = document.createElement('div');
  touchGhost.className = 'drag-ghost';
  touchGhost.textContent = chip.textContent;
  document.body.appendChild(touchGhost);

  const touch = e.touches[0];
  touchGhost.style.left = `${touch.clientX}px`;
  touchGhost.style.top = `${touch.clientY}px`;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!touchDragLabel || !touchGhost) return;

  const touch = e.touches[0];
  touchGhost.style.left = `${touch.clientX}px`;
  touchGhost.style.top = `${touch.clientY}px`;

  // Highlight nearby targets
  diagramCanvas.querySelectorAll('.drop-target').forEach(t => {
    const rect = t.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(touch.clientX - cx, touch.clientY - cy);
    t.classList.toggle('drag-over', dist < 40);
  });
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!touchDragLabel) return;

  // Find if over a target
  const touch = e.changedTouches[0];
  let droppedTarget = null;

  diagramCanvas.querySelectorAll('.drop-target').forEach(t => {
    const rect = t.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(touch.clientX - cx, touch.clientY - cy);
    if (dist < 40) droppedTarget = t;
    t.classList.remove('drag-over');
  });

  if (droppedTarget) {
    const targetId = droppedTarget.dataset.targetId;
    if (!(checkedState && checkedState.results[targetId])) {
      placeLabel(targetId, touchDragLabel);
    }
  }

  // Cleanup
  if (touchGhost) {
    touchGhost.remove();
    touchGhost = null;
  }

  labelBank.querySelectorAll('.label-chip.dragging').forEach(c => c.classList.remove('dragging'));
  touchDragLabel = null;
});

// ── Click outside to deselect ──
document.addEventListener('click', (e) => {
  if (selectedLabel && !e.target.closest('.label-chip') && !e.target.closest('.drop-target')) {
    selectedLabel = null;
    labelBank.querySelectorAll('.label-chip').forEach(chip => {
      chip.classList.remove('selected');
    });
  }
});

// ── Hash Routing ──
function updateHash(qId) {
  if (qId) {
    history.replaceState(null, '', `#${qId}`);
  } else {
    history.replaceState(null, '', window.location.pathname);
  }
}

// Patch navigation functions to update hash
const _origStartQuestion = startQuestion;
startQuestion = function(qId) {
  _origStartQuestion(qId);
  updateHash(qId);
};

const _origShowHome = showHome;
showHome = function() {
  _origShowHome();
  updateHash(null);
};

// Handle initial load with hash
function initFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash && QUESTIONS[hash]) {
    startQuestion(hash);
  }
}

// Handle browser back/forward
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && QUESTIONS[hash]) {
    startQuestion(hash);
  } else {
    showHome();
  }
});

// ── Initialize ──
initFromHash();
console.log('🏔️ Fieldwork — Landform Label Lab loaded');
