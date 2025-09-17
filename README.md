
# FlexiQuiz v1.1

## Project Overview

**FlexiQuiz** is a web application for creating, importing, and taking interactive quizzes. It supports multiple question types and offers two correction modes to suit your learning needs.

---

## Version & Features

**Version: 1.1**

- **Instant Answer Mode**: Validate each question with Submit, then Next to move on.
- **Review at End Mode**: Get feedback for all questions at the end of the quiz.
- **Automatic hiding** of Next buttons and feedback during review.
- **Keyboard shortcuts**: Quickly select options (1-9), validate (Space/Enter).

---

## Question Types

### 1. `ucq` (Unique Choice Question)
- **JSON Structure:**
  ```json
  {
    "type": "ucq",
    "question": "What is the capital of France?",
    "options": ["Paris", "Lyon", "Marseille"],
    "answer": 0
  }
  ```

### 2. `mcq` (Multiple Choice Question)
- **JSON Structure:**
  ```json
  {
    "type": "mcq",
    "question": "Which are programming languages?",
    "options": ["Python", "HTML", "JavaScript", "CSS"],
    "answer": [0, 2]
  }
  ```

### 3. `text`
- **JSON Structure:**
  ```json
  {
    "type": "text",
    "question": "Name an ocean.",
    "answer": "Pacific"
  }
  ```

### 4. `number`
- **JSON Structure:**
  ```json
  {
    "type": "number",
    "question": "What is 7 x 8?",
    "answer": 56
  }
  ```

---

## How to Create a Quiz File

- **Format**: JSON
- **File name**: `myquiz.json` (avoid spaces and special characters)
- **Structure:**
  ```json
  {
    "title": "Quiz Title",
    "questions": [
      { /* question 1 */ },
      { /* question 2 */ }
    ]
  }
  ```
- Each question object must follow the structure for its type.

---

## How to Use the App

1. **Import the quiz file** (JSON format).
2. **Choose the mode**: Instant Answer or Review at End.
3. **Start the session**.
4. **Answer the questions** (use keyboard shortcuts).
5. **View the review** at the end to see your results.

---

## Keyboard Shortcuts

- **1-9**: Select an option.
- **Space / Enter**:
  - In Instant Answer mode: Validate the answer.
  - In Review at End mode: Go to the next question.

---

## Complete JSON Example

```json
{
  "title": "Quiz Example",
  "questions": [
    {
      "type": "ucq",
      "question": "What is the capital of Italy?",
      "options": ["Rome", "Milan", "Venice"],
      "answer": 0
    },
    {
      "type": "mcq",
      "question": "Select the fruits.",
      "options": ["Apple", "Carrot", "Banana", "Broccoli"],
      "answer": [0, 2]
    },
    {
      "type": "text",
      "question": "What is the largest desert in the world?",
      "answer": "Sahara"
    },
    {
      "type": "number",
      "question": "What is 12 + 15?",
      "answer": 27
    }
  ]
}
```

---

## Generate a Quiz from a PDF

**Example ChatGPT prompt:**

You are a FlexiQuiz JSON generator. Instructions:

1. Make questions from the PDF (`ucq`, `mcq`, `text`, `number`).
2. Before generating, ask the user if they want a theme, a question limit, or special requirements.
3. Do not include a `title` field; use the file name as the quiz title.
4. Each question object:
   - `type`: `ucq`, `mcq`, `text`, or `number`
   - `q`: question text
   - `options`: array (for `ucq`/`mcq` only)
   - `answer`: index, array, string, or number
   - `explanation`: optional
5. Output only a JSON array of questions.

Example:
```json
[
  {"q": "What is a protocol?", "type": "ucq", "options": ["File", "Rules", "Device"], "answer": 1},
  {"q": "How many OSI layers?", "type": "number", "answer": 7},
  {"q": "Protocol for email?", "type": "text", "answer": "SMTP"}
]
```
No title field, no extra metadata. The file name is the quiz title.

---

## Usage Tips

- **Validate your JSON** before importing (use [jsonlint.com](https://jsonlint.com)).
- **Name your files** without spaces or special characters.
- **Write clear and precise questions.**
- **Try both modes** to vary your learning.
- **Use keyboard shortcuts** to save time.

---

**FlexiQuiz v1.1 — Learn, test, improve!**

---

Made by [Aureprz](https://github.com/Aureprz)