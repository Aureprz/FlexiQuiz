## FlexiQuiz — quiz JSON format

This document describes the JSON format used by FlexiQuiz for quiz files located in the `quiz/` directory (for example `exemple_quiz.json`). Each quiz file is a JSON array of question objects. The quiz player reads this array and renders each question based on its `type`.

### Top level structure

- The file must contain a JSON array. Each element of the array is an object representing a single question.

Example (short):

```json
[
	{ "q": "Question text", "type": "ucq", "options": ["A","B"], "answer": 0 }
]
```

### Question object fields

Common fields (per-question):

- `q` (string) — The question text shown to the user.
- `type` (string) — The question type. Allowed values seen in the examples:
	- `ucq` — Single-correct choice (only one option is correct). The answer is a single index (integer).
	- `mcq` — Multiple-correct choices. The answer is an array of integer indices.
	- `text` — Free-text answer. The answer is a string.
	- `number` — Numeric answer. The answer is a number (integer or float).
- `explanation` (string, optional) — An explanation or feedback displayed after the question is answered.

Choice-question-only fields:

- `options` (array of strings) — Required for `ucq` and `mcq` types. The list of choices presented to the user.

Answer field details (format depends on `type`):

- For `ucq` (single choice): `answer` is a single integer, representing the index (0-based) of the correct option inside `options`.
	Example: `"answer": 2` means the 3rd option is correct.
- For `mcq` (multiple choice): `answer` is an array of integers. Each integer is a 0-based index into `options`.
	Example: `"answer": [0,2]` means the 1st and 3rd options are correct.
- For `text`: `answer` is a string with the expected correct text. Matching may be exact in the player implementation.
- For `number`: `answer` is a numeric value.

Important notes about indices and types:

- Indices in `answer` for `ucq` and `mcq` are zero-based. If your options array is `["A","B","C"]`, index `0` refers to "A".
- Ensure `answer` indices are within the bounds of the `options` array.
- The quiz player will ignore fields it doesn't recognize, so adding extra metadata is usually safe (but not guaranteed to be used).

### Examples from repo

- `exemple_quiz.json` — A variety of question types about planets (shows `ucq`, `mcq`, `text`, and `number` usage). Useful as a reference for mixing question types.
- `quiz_test.json` — A longer quiz about networking and the OSI model. Mostly `ucq` and a few `number`/`text` questions.

### Validation tips

- Validate your JSON (use an online linter or `jq`) to ensure it's valid and an array at top level.
- For choice questions, verify `options` exists and `answer` indices point to valid entries.
- Avoid trailing commas and ensure strings are properly quoted.


### Minimal working question examples

Single-choice (ucq):

```json
{
	"q": "Which planet is known as the Red Planet?",
	"type": "ucq",
	"options": ["Earth", "Mars", "Jupiter"],
	"answer": 1,
	"explanation": "Mars is called the Red Planet due to the iron oxide on its surface."
}
```

Multiple-choice (mcq):

```json
{
	"q": "Which planets are gas giants?",
	"type": "mcq",
	"options": ["Mercury","Saturn","Uranus","Venus","Jupiter"],
	"answer": [1,2,4]
}
```

Text answer:

```json
{
	"q": "What is the name of our galaxy?",
	"type": "text",
	"answer": "Milky Way"
}
```

Number answer:

```json
{
	"q": "How many layers are in the OSI model?",
	"type": "number",
	"answer": 7
}
```

### Practical tips

- Keep question text brief and clear.
- For `text` answers, consider normalizing case and trimming whitespace in the player if you want to allow flexible matching.
- When adding `mcq` answers, ensure the `answer` array contains unique indices.
- If you change the JSON format used by the player, include a version note or migrate existing quizzes.

Credits
-------

- Live demo: https://aureprz.github.io/FlexiQuiz/
- Author / repo: https://github.com/Aureprz/FlexiQuiz
