# Quiz App README

## How to Create a Quiz File

1. **File Format:**
   - The quiz file must be in JSON format.
   - Each quiz is an array of question objects.

2. **Question Object Structure:**
   ```json
   [
     {
       "q": "Your question text here?",
       "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
       "answer": 0, // Index of the correct option (0-based)
       "explanation": "Explanation for the correct answer."
     },
     // ... more questions
   ]
   ```
   - `q`: The question text.
   - `options`: Array of possible answers.
   - `answer`: The index of the correct answer in the `options` array.
   - `explanation`: (Optional) Explanation shown after answering.

3. **Naming the File:**
   - Name your quiz file with a descriptive name, e.g. `network_protocols.json`.
   - The app will display the file name (without `.json`) as the quiz title.
   - Avoid spaces or special characters in the file name for best compatibility.

## How to Use the Quiz App

1. Open the app in your browser.
2. Click "Import Quiz File" and select your quiz JSON file.
3. The quiz title will update to match your file name.
4. Start the session and answer the questions!

## Example Quiz File

```
[
  {
    "q": "What does OSI stand for?",
    "options": ["Open System Interconnection", "Operating System Interface", "Optical Signal Integration", "Online Service Infrastructure"],
    "answer": 0,
    "explanation": "OSI stands for Open System Interconnection."
  }
]
```

## Tips
- Always validate your JSON before importing.
- Use clear, concise question and option text.
- Save your file with the `.json` extension.
