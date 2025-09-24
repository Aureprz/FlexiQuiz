# 🎨 CSS Styles — FlexiQuiz

Credits
-------

- FlexiQuiz project — original design and functionality
- Author / Contributor: Aureprz

---

## 🌍 Global variables (:root)
These variables keep colors, spacing and font sizes consistent across the app.

- `--spacing-sm` — small spacing (e.g. 10px)
- `--spacing-lg` — large spacing (e.g. 15px)
- `--primary` — primary color (buttons, links)
- `--primary-hover` — hover color for interactive elements
- `--danger` — alert color (timer)
- `--review-explanation` — explanation text color for review mode
- `--text-lg` / `--text-xl` — reusable text sizes
- `--font-bold` — bold font weight

Optional review theme variables (activated with `data-theme="review"` on `:root`):
- `--review-correct` — color for correct answers
- `--review-wrong` — color for incorrect answers

---

## 📦 Main components

- `body`: default font (Arial or system font), light background and global padding.
- `.quiz-box`: white card container, subtle border and shadow, max-width (e.g. 750px), centered.
- `.question`: larger, bold text for question content.
- `.options label`: each option displayed as a clickable block with spacing.
- `button`: standard button style (background: `--primary`, rounded corners, hover behavior).
- `.result` / `.score-box`: result and score displays, centered and prominent.

---

## ⚡ Utility classes

- `.hidden`: hide an element (`display: none !important`).
- `.m-sm` / `.m-lg` / `.ml-lg`: margin utilities for quick spacing.
- `.centered`: center text.
- `.text-lg` / `.text-xl` / `.font-bold`: typography utilities.

Add additional utilities here as needed for reusability.

---

## 📖 Review mode (feedback)

Used when reviewing answers after quiz submission:
- `.review-list`: list layout, typically without bullets.
- `.review-item`: spacing between review entries.
- `.correct`: mark correct answers (green + bold).
- `.wrong`: mark incorrect answers (red).
- `.explanation`: secondary text for explanations.

Tip: apply `data-theme="review"` to `:root` to switch color variables for review mode.

---

## ⏱ Timer

`.timer`: countdown display (color: `--danger`, right-aligned, readable size).

---

## 📊 Progress bars

Question progress: `.progress-container` (rounded gray background) and `.progress-bar` (colored fill with smooth transition).

Time progress: `.time-container` and `.time-bar` to visually show remaining time.

---

## 📌 Footer

Simple footer styles: `.footer` (centered gray text), `.footer-link` (blue link), `.footer-hr` (separator spacing).

---

## ✅ Where to edit

Edit `css/style.css` to change visuals. Keep this README updated when variables or common classes change.

## Quick examples

- Hide an element: add `.hidden`.
- Mark a correct answer in review: add `.correct` to the element.

---

If you want, I can:

- generate a `css/variables.md` file listing all CSS variables with their current values (auto-generated), or
- implement an optional dark theme and document how to enable it.

Tell me which option you prefer.
