# FlexiQuiz — index.html

Live demo: https://aureprz.github.io/FlexiQuiz/

File: `docs/index.html`

This README describes only `index.html` in the `docs/` folder. There is a general repository README at the project root; this file focuses on the HTML structure and how the page connects to the JS/CSS assets.

Purpose

High-level structure

- Head
  - `../css/style.css` is included for styling.
  - Responsive viewport meta and page title.

- Body (main sections and key elements)
  - `h1#quizTitle` — page/quiz title (updated by JS).

  - Import area
    - `button#importBtn` — opens an import flow handled by the script.
    - `input#importQuizFile` — hidden file input (single `.json`) used to import a quiz file.
    - `input#importQuizFolder` — hidden file input for folder imports (multiple `.json`, webkitdirectory/mozdirectory enabled).
    - `div#confirmModal` — modal dialog used to choose import mode; inside:
      - `h3#modalTitle`, `button#okBtn` (File), `button#cancelBtn` (Folder).

  - `select#quizSelect` — select dropdown populated by the script with available quizzes. onchange calls `selectQuiz()`.

  - Theme toggle
    - `button#themeToggle` — toggles dark mode (aria-pressed toggled by JS).

  - Quiz area (`div.quiz-box` role="main") — contains the interactive quiz session UI:
    - `div#sessionParams` — session parameter controls:
      - `input#numQuestions` — number of questions to include in the session.
      - `input#sessionTime` — session timer seconds.
      - `select#modeSelect` — session mode (`review` or `instant`).
      - `input#freeTraining` (checkbox) — disables timer when checked.
      - `button#startSessionBtn` — starts the session; initially disabled until a quiz is loaded.

    - `div#timer` — numeric time left (updated by JS, aria-live polite).
    - `div#question` — current question content (rendered by JS).
    - `div#options` — container for generated answer inputs (role="group").

    - Action buttons (wired to functions in `js/script.js`):
      - `button#submitBtn` — Submit answer (calls `submitInstant()`).
      - `button#nextBtn` — Next question (calls `nextQuestion()`).

    - `div#result` — displays immediate result/feedback.

    - `div#exportBtns` — export area (hidden by default): buttons call `exportResultsJSON()` and `exportResultsCSV()`.

    - Progress and time bars
      - `div#progressBar` — progress bar element (role=progressbar).
      - `div#timeBar` — visual time remaining bar (role=progressbar).

  - `div#scoreBox` — final score/review area (aria-live polite).
  - `div#performanceGraph` — optional performance graph container.

  - Footer with links to the author and repository.

How the import flow works (HTML side)

- Clicking `#importBtn` triggers UI in `js/script.js` which opens the hidden file/folder inputs.
- The modal `#confirmModal` is used to confirm the import mode. The file inputs are hidden in the HTML; the JS triggers them and reads selected `.json` files using the FileReader API.

Where to change which quiz files are loaded by default

- The dropdown `#quizSelect` is populated by `js/script.js` at runtime. To change the default available quizzes or the initial load behavior, open `js/script.js` and search for the code that populates `quizSelect` or the initial quiz loading routine. Typically you'll find an array or fetch that points to files inside the repository's `quiz/` folder.

Key JS function hooks (called from HTML)

- `selectQuiz()` — called when the user chooses an option in `#quizSelect`.
- `startSession()` — starts a quiz session using values from the session parameter inputs.
- `submitInstant()` — submits the current answer (used in instant mode).
- `nextQuestion()` — advances to the next question.
- `exportResultsJSON()`, `exportResultsCSV()` — export user results from the session.

Accessibility and ARIA

- Several elements use `aria-live` (title, timer, question, result, score) so screen readers get updates.
- Progress bars and grouped options include ARIA attributes (`role="progressbar"`, `role="group"`).
- Modal dialog uses `role="dialog"` and `aria-modal="true"`.

How to test locally

- Open `docs/index.html` directly. If quizzes fail to load because of fetch/file restrictions, run a simple HTTP server from the repo root and open the page via http://. Example (from the repo root):

```powershell
python -m http.server 8000
```

Then open:

http://localhost:8000/docs/

Troubleshooting tips

- Check the browser console (F12) for errors about missing files, JSON parse errors, or CORS/fetch failures.
- If the Start button is disabled, confirm a quiz is selected in `#quizSelect` and that `#numQuestions` is > 0.

Notes

- There is a general README at the project root that covers repository-wide details. This file documents the HTML structure and how it ties to the JS behavior.

Credits
-------

- Live demo: https://aureprz.github.io/FlexiQuiz/
- Author / repo: https://github.com/Aureprz/FlexiQuiz
