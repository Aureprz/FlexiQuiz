# FlexiQuiz — JavaScript

File: `js/script.js`


JSON (minimal example)

```json
{ "title": "Quiz", "questions": [ { "id": "q1", "type": "ucq", "question": "...", "options": ["A","B"], "answer": 0 } ] }
```

Types: `ucq`, `mcq`, `text`, `number`.

Key runtime state

- `quiz` — loaded quiz object
- `sessionQuestions` — array used for the session (may be shuffled/trimmed)
- `sessionIndex` — current index (number)
- `userAnswers` — [{ qid, value, correct, time }]
- `mode` — 'review' | 'instant'
- `timer`, `timeLeft` — numeric when session is timed

Main functions

- `startSession(options)`
  - Inputs: { mode, time?, limit?, shuffle? }
  - Build `sessionQuestions`, reset state, start timer, render first question

- `loadSessionQuestion()`
  - Read `sessionQuestions[sessionIndex]` and call `renderOptions(question)`

- `renderOptions(question)`
  - Create DOM inputs for the question; add `data-qid` and `data-idx` attributes

- `getUserAnswer(question)`
  - Read DOM inputs and return normalized value(s)

- `isAnswerValid(question, value)`
  - Basic validation (required, numeric parsing)

- `processAnswer(question, value, immediate=false)`
  - Save entry in `userAnswers`; if `immediate`, call `checkAnswer` and update score/UI

- `checkAnswer(question, value)`
  - Return { correct, score } — use `normalize` for tolerant text matching

- `nextQuestion()` / `endSession()`
  - Advance index or finalize and show review

Utilities

- `shuffle(array)` — in-place Fisher–Yates
- `normalize(text)` — remove diacritics, collapse whitespace, lowercase

Data shapes (TypeScript-like)

```ts
type Question = {
  id: string;
  type: 'ucq'|'mcq'|'text'|'number';
  question: string;
  options?: string[];
  answer: number|number[]|string|number;
}

type UserAnswer = { qid: string; value: any; correct: boolean; timeMs?: number }
```

Credits
-------

- Live demo: https://aureprz.github.io/FlexiQuiz/
- Author / repo: https://github.com/Aureprz/FlexiQuiz
