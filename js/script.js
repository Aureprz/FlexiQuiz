
(function () {
  let totalTime = 0;
  const paramsDiv = document.getElementById("sessionParams");
  let paramsCompact = false; // true = compact ribbon


// --- Save / resume session (localStorage) ---
const SAVE_KEY = "flexiquiz_state_v1";
const SAVE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // optional: expires after 7 days

  function saveSessionState() {
  try {
    const payload = {
      savedAt: Date.now(),
        sessionActive: !!sessionActive,
        sessionQuestions: sessionQuestions, // array of question objects (serializable)
        sessionIndex: sessionIndex,
        userAnswers: userAnswers,
        mode: mode,
        totalTime: totalTime,
        timeLeft: timeLeft
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Save failed:", err);
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.savedAt && (Date.now() - parsed.savedAt) > SAVE_TTL_MS) {
      // too old -> ignore
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn("Load failed:", err);
    return null;
  }
}

function clearSavedSession() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

function resumeSessionFromState(saved) {
  if (!saved || !saved.sessionQuestions || saved.sessionQuestions.length === 0) return false;

  sessionQuestions = saved.sessionQuestions;
  sessionIndex = saved.sessionIndex || 0;
  userAnswers = saved.userAnswers || [];
  mode = saved.mode || "review";
  totalTime = saved.totalTime || 0;
  timeLeft = (typeof saved.timeLeft === "number") ? saved.timeLeft : totalTime;
  sessionActive = !!saved.sessionActive;

  // Update UI to reflect resumed state
  document.getElementById("numQuestions").value = sessionQuestions.length;
  document.getElementById("sessionTime").value = totalTime;
  document.getElementById("modeSelect").value = mode;
  document.getElementById("freeTraining").checked = (totalTime === 0);

  document.getElementById("startSessionBtn").disabled = false;
  document.getElementById("nextBtn").style.display = "block";
  document.getElementById("result").style.display = "block";
  updateProgressBar();
  // restart timer if needed
  if (totalTime > 0) {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (--timeLeft <= 0) { endSession(); }
      else { updateTimer(); saveSessionState(); }
    }, 1000);
  } else {
    updateTimer();
    if (timer) { clearInterval(timer); timer = null; }
  }

  loadSessionQuestion();
  return true;
}

  let savedTheme = localStorage.getItem("theme");
  if (!savedTheme) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    savedTheme = prefersDark ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", savedTheme);

  // We intentionally avoid HTML injection by always inserting JSON strings
  // with textContent instead of innerHTML.

  function updateInstantScore() {
    let correct = 0;
    for (let i = 0; i < userAnswers.length; i++) {
      if (checkAnswer(sessionQuestions[i], userAnswers[i])) correct++;
    }
    const scoreBox = document.getElementById("scoreBox");
    if (scoreBox) {
      scoreBox.textContent = `Score: ${correct}/${sessionQuestions.length}`;
      scoreBox.classList.remove("hidden");
    }
  }

  function isAnswerValid(q, userValue) {
    if (!q) return false;
    if (q.type === "text") return !!userValue;
    if (q.type === "number") return userValue !== "";
    if (q.type === "ucq") return userValue !== null && userValue !== undefined;
    if (q.type === "mcq") return Array.isArray(userValue) && userValue.length > 0;
    return false;
  }

  function processAnswer(q, userValue, immediate = false) {
    if (!isAnswerValid(q, userValue)) {
      let msg = "⚠️ Please answer!";
      if (q && q.type === "text") msg = "⚠️ Enter an answer!";
      else if (q && q.type === "number") msg = "⚠️ Enter a number!";
      else if (q && q.type === "ucq") msg = "⚠️ Select an answer!";
      else if (q && q.type === "mcq") msg = "⚠️ Select at least one!";
      const resultEl = document.getElementById("result"); if (resultEl) resultEl.textContent = msg;

      // small shake animation for clarity
      const box = document.querySelector(".quiz-box");
      if (box) {
        box.classList.add("shake");
        setTimeout(() => box.classList.remove("shake"), 400);
      }

      return false;
    }

    userAnswers[sessionIndex] = userValue;
    saveSessionState();

    // disable inputs after answering
    document.querySelectorAll("input[name='option']").forEach(input => { input.disabled = true; });
    const textInput = document.getElementById("textAnswer");
    if (textInput) textInput.disabled = true;
    const numberInput = document.getElementById("numberAnswer");
    if (numberInput) numberInput.disabled = true;

    if (immediate) {
      const isCorrect = checkAnswer(q, userValue);
      const submitBtn = document.getElementById("submitBtn"); if (submitBtn) submitBtn.disabled = true;
      let explanation = q && q.explanation ? q.explanation : "";
      let correctDisplay = formatAnswer(q, q.answer);
      const resultEl = document.getElementById("result");
      if (resultEl) {
        // Show literal text from JSON without executing HTML
        if (isCorrect) {
          resultEl.textContent = `✅ Correct!${explanation ? "\n" + explanation : ""}`;
        } else {
          resultEl.textContent = `❌ Wrong! Correct: ${correctDisplay}${explanation ? "\n" + explanation : ""}`;
        }
        resultEl.style.whiteSpace = 'pre-line';
      }
      if (mode === "instant") updateInstantScore();
    }
    return true;
  }

  function formatAnswer(q, answer) {
    if (!q) return "";
    if (!isAnswerValid(q, answer)) return "Not answered";
    if (q.type === "ucq") return q.options[answer];
    if (q.type === "mcq") return answer.map(x => q.options[x]).join(", ");
    return String(answer);
  }

  function getUserAnswer(q) {
    if (!q) return null;
    if (q.type === "text") return document.getElementById("textAnswer")?.value || "";
    if (q.type === "number") return document.getElementById("numberAnswer")?.value || "";
    if (q.type === "ucq") {
      const selected = document.querySelector("input[name='option']:checked");
      return selected ? Number(selected.value) : null;
    }
    if (q.type === "mcq")
      return [...document.querySelectorAll("input[name='option']:checked")].map(cb => Number(cb.value));
    return null;
  }

  function checkAnswer(q, userValue) {
    if (!q) return false;
    if (q.type === "text") return isPermissiveMatch(userValue, q.answer);
    if (q.type === "number") return Number(userValue) === Number(q.answer);
    if (q.type === "ucq") return userValue === q.answer;
    if (q.type === "mcq")
      return Array.isArray(userValue) &&
        JSON.stringify([...userValue].sort()) === JSON.stringify([...q.answer].sort());
    return false;
  }

  function renderOptionsInto(q, container) {
    if (!container) return;
    while (container.firstChild) container.removeChild(container.firstChild);

    if (q.type === "text") {
      const label = document.createElement('label');
      label.setAttribute('for', 'textAnswer');
      label.textContent = 'Your answer:';
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'textAnswer';
      input.className = 'input input--wide mb';
      label.appendChild(input);
      container.appendChild(label);
      return;
    }

    if (q.type === "number") {
      const label = document.createElement('label');
      label.setAttribute('for', 'numberAnswer');
      label.textContent = 'Your answer:';
      const input = document.createElement('input');
      input.type = 'number';
      input.id = 'numberAnswer';
      input.className = 'input input--medium mb';
      label.appendChild(input);
      container.appendChild(label);
      return;
    }

    if (q.type === "ucq" || q.type === "mcq") {
      (q.options || []).forEach((opt, i) => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = q.type === 'ucq' ? 'radio' : 'checkbox';
        input.id = `${q.type}${i}`;
        input.name = 'option';
        input.value = String(i);
        label.setAttribute('for', `${q.type}${i}`);
        label.appendChild(input);
        label.appendChild(document.createTextNode(' '));
        const span = document.createElement('span');
        span.textContent = opt; // literal display
        label.appendChild(span);
        container.appendChild(label);
      });
      return;
    }
  }

function setQuizTitle(data, fallbackName) {
  const title = data?.title || fallbackName || "Untitled Quiz";
  const el = document.getElementById("quizTitle");
  if (el) el.textContent = title;
}

  let quizzes = [];  // will contain multiple quizzes
  let currentQuizIndex = -1; // selected quiz index

// Unified import handler
  // Unified import handler
  function handleImport(files) {
  if (!files || files.length === 0) return;

  const jsonFiles = Array.from(files).filter(f => f && /\.json$/i.test(f.name));
  if (jsonFiles.length === 0) {
    console.warn('No JSON files found.');
    const res = document.getElementById('result'); if (res) res.textContent = 'No JSON files found.';
    return;
  }

  let loaded = 0;
  let failed = 0;

  jsonFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        quizzes.push({ name: file.name.replace(/\.json$/i, ""), data: data });
        loaded++;
        updateQuizSelect();
        document.getElementById('startSessionBtn').disabled = false;
      } catch (err) {
  failed++;
  console.warn('Parsing failed', file.name, err);
      }
      if (loaded + failed === jsonFiles.length) {
        if (loaded > 0) console.log(`${loaded} quiz imported.${failed ? ` ${failed} failed.` : ''}`);
        else console.warn('No valid JSON files imported.');
      }
    };
    reader.onerror = function() {
      failed++;
      if (loaded + failed === jsonFiles.length) {
        if (loaded > 0) console.log(`${loaded} quiz imported. ${failed} failed.`);
        else console.warn('No valid JSON files imported.');
      }
    };
    reader.readAsText(file);
  });
}

  // Hook up input elements
  const importBtn = document.getElementById('importBtn');
  const importQuizFile = document.getElementById('importQuizFile');
  const importQuizFolder = document.getElementById('importQuizFolder');

  if (importQuizFile) importQuizFile.addEventListener('change', e => handleImport(e.target.files));
  if (importQuizFolder) importQuizFolder.addEventListener('change', e => handleImport(e.target.files));

// Main button
if (importBtn) {
  // use a custom modal rather than confirm()
  const modal = document.getElementById('confirmModal');
  const okBtn = document.getElementById('okBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  // focus the primary button for accessibility
    okBtn?.focus();
  // prevent body scrolling
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    importBtn.focus();
  }

  importBtn.addEventListener('click', () => openModal());

  // choose file
  okBtn?.addEventListener('click', () => {
    closeModal();
    importQuizFile?.click();
  });

  // choose folder
  cancelBtn?.addEventListener('click', () => {
    closeModal();
    importQuizFolder?.click();
  });

  // close modal with ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeModal();
  });

  // close when clicking outside the modal
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

  let quiz = [];
  fetch('../quiz/exemple_quiz.json')
    .then(response => response.json())
    .then(data => {
      quiz = data;
      // add example quiz to quizzes list so it's selectable by default
      quizzes.push({ name: data.title || 'example_quiz', data });
      updateQuizSelect();
      const startBtn = document.getElementById('startSessionBtn'); if (startBtn) startBtn.disabled = false;
      setQuizTitle(data);
      // Add resume session if a saved state exists
      const saved = loadSavedState();
      if (saved && saved.sessionActive) {
        // simple prompt: you can replace with a nicer UI if desired
        if (confirm("A previous session exists. Do you want to resume where you left off?")) {
          resumeSessionFromState(saved);
        } else {
          clearSavedSession();
        }
      }
    })
    .catch(() => {
      console.error('Could not load quiz data.');
      const res = document.getElementById('result'); if (res) res.textContent = 'Could not load quiz data.';
    });

// Note: single-file import handled by the unified handler above. If you still want a single-file
// immediate-import behaviour (replace current quiz), implement a separate control/button.

  let sessionActive = false, sessionQuestions = [], sessionIndex = 0;
  let score = 0, userAnswers = [], timer = null, timeLeft = 0, mode = "review";

  function updateProgressBar() {
    const progress = (sessionQuestions.length > 0) ? ((sessionIndex) / sessionQuestions.length) * 100 : 0;
    const bar = document.getElementById("progressBar"); if (bar) bar.style.width = progress + "%";
  }

  function startSession() {
  if (currentQuizIndex === -1 || !quizzes[currentQuizIndex]) {
    console.warn("Please select a quiz!");
    const res = document.getElementById('result'); if (res) res.textContent = 'Please select a quiz.';
    return;
  }

  const quizData = quizzes[currentQuizIndex].data; // full quiz (JSON object)

  // Hide export buttons on start
    const exportDiv = document.getElementById("exportBtns");
    if (exportDiv) exportDiv.style.display = "none";

    clearSavedSession(); // clear saved state
    const timerEl = document.getElementById("timer"); if (timerEl) timerEl.style.display = "block";
    const progContainer = document.querySelector(".progress-container"); if (progContainer) progContainer.style.display = "block";
    const timeContainer = document.querySelector(".time-container"); if (timeContainer) timeContainer.style.display = "block";
    const submitBtn = document.getElementById("submitBtn"); if (submitBtn) submitBtn.style.display = "none";
    const progressBar = document.getElementById("progressBar"); if (progressBar) progressBar.style.width = "0%";
  document.getElementById("timeBar").style.width = "0%";
    const n = parseInt(document.getElementById("numQuestions").value, 10);
    const customTime = parseInt(document.getElementById("sessionTime").value, 10);
    mode = document.getElementById("modeSelect").value;
    const isFreeTraining = document.getElementById("freeTraining").checked;
  if (isNaN(n) || n < 1 || n > quizData.length) {
    console.warn('Invalid number of questions.');
    const res = document.getElementById('result'); if (res) res.textContent = 'Invalid number of questions.';
    return;
  }
  if (!isFreeTraining && (isNaN(customTime) || customTime < 1)) {
    console.warn('Invalid timer value.');
    const res = document.getElementById('result'); if (res) res.textContent = 'Invalid timer value.';
    return;
  }
    sessionActive = true; score = 0; sessionIndex = 0; userAnswers = [];
    const nextBtn = document.getElementById("nextBtn"); if (nextBtn) nextBtn.style.display = "block"; // display block (centered via CSS)
    const resultEl = document.getElementById("result"); if (resultEl) resultEl.style.display = "block";
    sessionQuestions = shuffle(quizData).slice(0, n);
    if (paramsDiv) paramsDiv.classList.add("compact");
    paramsCompact = true;
    if (nextBtn) nextBtn.disabled = false;
    if (resultEl) resultEl.textContent = "";
    const scoreBox = document.getElementById("scoreBox"); if (scoreBox) scoreBox.classList.add("hidden");
    if (isFreeTraining) {
      timeLeft = 0; totalTime = 0;
      updateTimer();
      if (timer) clearInterval(timer);
      timer = null;
    } else {
      timeLeft = customTime; totalTime = customTime;
      updateTimer();
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (--timeLeft <= 0) endSession();
        else {
          updateTimer();
          saveSessionState();
        }
      }, 1000);
    }
    loadSessionQuestion();
    saveSessionState();
  }

  function updateTimer() {
    const isFreeTraining = document.getElementById("freeTraining")?.checked;
    const timeBar = document.getElementById("timeBar");
    const timeContainer = document.querySelector(".time-container");

    const timerEl = document.getElementById("timer");
    if (isFreeTraining || totalTime === 0) {
      if (timerEl) timerEl.textContent = "";
      if (timeBar) timeBar.style.width = "0%";
      if (timeContainer) timeContainer.style.display = "none";
    } else {
      if (timerEl) timerEl.textContent = sessionActive ? `⏰ Time left: ${timeLeft}s` : "";
      const progress = ((totalTime - timeLeft) / totalTime) * 100;
      if (timeBar) timeBar.style.width = progress + "%";
      if (timeContainer) timeContainer.style.display = "block";
    }
  }

  function endSession() {
    sessionActive = false;
    const timerEl = document.getElementById("timer"); if (timerEl) timerEl.textContent = "";
    const nextBtn = document.getElementById("nextBtn"); if (nextBtn) nextBtn.disabled = true;
    if (timer) clearInterval(timer);
    const scoreBox = document.getElementById("scoreBox"); if (scoreBox) scoreBox.classList.remove("hidden");
    const exportDiv = document.getElementById("exportBtns"); if (exportDiv) exportDiv.style.display = "block";
    showReview();
    if (paramsDiv) paramsDiv.classList.remove("compact");
    paramsCompact = false;
  }

  function showReview() {
    document.body.classList.add("review-mode");
    updateProgressBar();
    const scoreBox = document.getElementById("scoreBox"); if (scoreBox) scoreBox.classList.add("hidden");
    let correctCount = 0;
    const questionEl = document.getElementById("question"); if (questionEl) questionEl.textContent = "Session complete!";
    const optionsEl = document.getElementById("options"); if (optionsEl) {
      while (optionsEl.firstChild) optionsEl.removeChild(optionsEl.firstChild);
      const h2 = document.createElement('h2');
      h2.textContent = '📖 Review';
      optionsEl.appendChild(h2);
      const ul = document.createElement('ul');
      ul.className = 'review-list';
      sessionQuestions.forEach((q, i) => {
        const userAns = userAnswers[i];
        const correctAnsText = formatAnswer(q, q.answer);
        const userAnsText = formatAnswer(q, userAns);
        const isCorrect = checkAnswer(q, userAns);
        if (isCorrect) correctCount++;

        const li = document.createElement('li');
        li.className = 'review-item';

        const qLine = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = `Q${i+1}:`;
        qLine.appendChild(strong);
        qLine.appendChild(document.createTextNode(' ' + q.q));
        li.appendChild(qLine);

        const correctLine = document.createElement('div');
        const correctLabel = document.createTextNode('✅ Correct: ');
        const correctSpan = document.createElement('span');
        correctSpan.className = 'review-correct';
        correctSpan.textContent = correctAnsText;
        correctLine.appendChild(correctLabel);
        correctLine.appendChild(correctSpan);
        li.appendChild(correctLine);

        const yourLine = document.createElement('div');
        const yourLabel = document.createTextNode('📝 Your answer: ');
        const yourSpan = document.createElement('span');
        yourSpan.className = isCorrect ? 'review-correct' : 'review-wrong';
        yourSpan.textContent = userAnsText;
        yourLine.appendChild(yourLabel);
        yourLine.appendChild(yourSpan);
        li.appendChild(yourLine);

        const expl = document.createElement('div');
        expl.className = 'explanation';
        expl.textContent = q.explanation || '';
        li.appendChild(expl);

        ul.appendChild(li);
      });
      optionsEl.appendChild(ul);
      const scoreDiv = document.createElement('div');
      scoreDiv.className = 'score-box';
      scoreDiv.textContent = `Final Score: ${correctCount}/${sessionQuestions.length}`;
      optionsEl.appendChild(scoreDiv);
    }
    const nextBtn = document.getElementById("nextBtn"); if (nextBtn) nextBtn.style.display = "none";
    const resultEl = document.getElementById("result"); if (resultEl) resultEl.style.display = "none";
    const timerEl = document.getElementById("timer"); if (timerEl) timerEl.style.display = "none";
    const progContainer = document.querySelector(".progress-container"); if (progContainer) progContainer.style.display = "none";
    const timeContainer = document.querySelector(".time-container"); if (timeContainer) timeContainer.style.display = "none";
  }

  function loadSessionQuestion() {
    const resultEl = document.getElementById("result"); if (resultEl) resultEl.textContent = "";
    if (!sessionActive || sessionIndex >= sessionQuestions.length) return endSession();
  const q = sessionQuestions[sessionIndex];
  const questionEl = document.getElementById("question"); if (questionEl) questionEl.textContent = `Q${sessionIndex+1}: ${q.q}`;
  const optionsEl = document.getElementById("options"); if (optionsEl) renderOptionsInto(q, optionsEl);
    const submitBtn = document.getElementById("submitBtn"); const nextBtn = document.getElementById("nextBtn");
    if (mode === "instant") {
      if (submitBtn) submitBtn.style.display = "inline-block";
      if (nextBtn) nextBtn.style.display = "none";
    } else {
      if (submitBtn) submitBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "block";
    }
    if (submitBtn) submitBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
  }

  function nextQuestion() {
    if (!sessionActive) return;
    const resultEl = document.getElementById("result");
    if (mode === 'instant') {
      if (userAnswers[sessionIndex] === undefined) {
        if (resultEl) resultEl.textContent = "⚠️ Please answer!";
        return;
      }
    } else {
      const q = sessionQuestions[sessionIndex];
      const userValue = getUserAnswer(q);
      if (!processAnswer(q, userValue, false)) return;
    }
    sessionIndex++;
    updateProgressBar();
    saveSessionState();
    if (sessionIndex < sessionQuestions.length) loadSessionQuestion();
    else endSession();
  }

  function normalize(str) {
    return str?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]/gi, "") || "";
  }
  function isPermissiveMatch(user, correct) { return normalize(user) === normalize(correct); }

  function submitInstant() {
    if (!sessionActive) return;
    if (userAnswers[sessionIndex] !== undefined) return;
    const q = sessionQuestions[sessionIndex];
    const userValue = getUserAnswer(q);
    if (!isAnswerValid(q, userValue)) {
      const resultEl = document.getElementById("result"); if (resultEl) resultEl.textContent = "⚠️ Please enter an answer!";
      return;
    }
    processAnswer(q, userValue, true);
    saveSessionState();
    const submitBtn = document.getElementById("submitBtn"); if (submitBtn) submitBtn.style.display = "none";
    const nextBtn = document.getElementById("nextBtn"); if (nextBtn) nextBtn.style.display = "block";
  }

// --- Export JSON ---
  function exportResultsJSON() {
    const data = {
      date: new Date().toISOString(),
      mode,
      totalQuestions: sessionQuestions.length,
      answers: sessionQuestions.map((q, i) => ({
        question: q.q,                  // 🔹 prompt
        options: q.options || null,     // 🔹 liste des choix si dispo
        userAnswer: formatAnswer(q, userAnswers[i] ?? null),
        correctAnswer: formatAnswer(q, q.answer)
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz_results.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

// --- Export CSV ---
  function exportResultsCSV() {
    let csv = "Question;Options;User Answer;Correct Answer\n";
    sessionQuestions.forEach((q, i) => {
      const question = q.q ? String(q.q).replace(/"/g, '""') : "";
      const options = Array.isArray(q.options) ? String(q.options.join(" | ")).replace(/"/g, '""') : "";
      const rawUserA = formatAnswer(q, userAnswers[i] ?? null);
      const rawCorrectA = formatAnswer(q, q.answer);
      const userA = (rawUserA === null || rawUserA === undefined) ? "" : String(rawUserA).replace(/"/g, '""');
      const correctA = (rawCorrectA === null || rawCorrectA === undefined) ? "" : String(rawCorrectA).replace(/"/g, '""');
      csv += `"${question}";"${options}";"${userA}";"${correctA}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz_results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function shuffle(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const nextBtnInit = document.getElementById("nextBtn"); if (nextBtnInit) nextBtnInit.disabled = true;

  document.addEventListener('keydown', function(e) {
  if (!sessionActive) return;
  const textInput = document.getElementById('textAnswer');
  if (e.code === 'Space' && textInput && document.activeElement === textInput) return;

  const num = parseInt(e.key);
  if (!isNaN(num) && num >= 1 && num <= 9) {
    const options = document.getElementsByName('option');
    if (num - 1 < options.length) {
      const input = options[num - 1];
      if (!input.disabled) {
        if (input.type === "checkbox") input.checked = !input.checked;
        else input.checked = true;
      }
    }
  }

  if (e.code === 'Space' || e.code === 'Enter') {
    const q = sessionQuestions[sessionIndex];
    const userValue = getUserAnswer(q);
    if (mode === 'instant') {
      if (userAnswers[sessionIndex] === undefined) {
        if (!isAnswerValid(q, userValue)) {
          document.getElementById("result").textContent = "⚠️ Please answer!";
          e.preventDefault();
          return;
        }
        submitInstant();
      } else nextQuestion();
    } else {
      if (!processAnswer(q, userValue, false)) {
        e.preventDefault();
        return;
      }
      nextQuestion();
    }
    e.preventDefault();
  }
});

  // 🌗 Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  savedTheme = localStorage.getItem("theme") || document.documentElement.getAttribute("data-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  if (themeToggle) themeToggle.textContent = savedTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    if (themeToggle) themeToggle.textContent = next === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  });

// ✅ shake animation CSS injected by JS
  const style = document.createElement("style");
  style.textContent = `
.shake { animation: shake 0.3s; }
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}`;
  document.head.appendChild(style);

  function updateQuizSelect() {
    const select = document.getElementById("quizSelect");
    if (!select) return;
    while (select.firstChild) select.removeChild(select.firstChild);
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.textContent = '-- Choose a quiz --';
    select.appendChild(placeholder);
    quizzes.forEach((quiz, index) => {
      const opt = document.createElement("option");
      opt.value = index;
      opt.textContent = quiz.data.title || quiz.name || `Quiz ${index + 1}`;
      select.appendChild(opt);
    });
  }

  function selectQuiz() {
    const select = document.getElementById("quizSelect");
    if (!select) return;
    currentQuizIndex = parseInt(select.value, 10);
    if (!isNaN(currentQuizIndex) && quizzes[currentQuizIndex]) {
      const quizObj = quizzes[currentQuizIndex];
      console.log("Quiz selected: " + (quizObj.data?.title || quizObj.name));

      // ✅ Mise à jour du <h1>
      setQuizTitle(quizObj.data, quizObj.name);

      const startBtn = document.getElementById('startSessionBtn');
      if (startBtn) startBtn.disabled = false;
    }
  }

  if (paramsDiv) paramsDiv.addEventListener("click", () => {
    // Do not toggle if the session is not active
    if (!sessionActive) return;

    if (paramsCompact) {
      // open
      paramsDiv.classList.remove("compact");
      paramsCompact = false;
    } else {
      // close
      paramsDiv.classList.add("compact");
      paramsCompact = true;
    }
  });

  // Expose public functions used by HTML
  window.startSession = startSession;
  window.nextQuestion = nextQuestion;
  window.submitInstant = submitInstant;
  window.exportResultsJSON = exportResultsJSON;
  window.exportResultsCSV = exportResultsCSV;
  window.selectQuiz = selectQuiz;

})();
