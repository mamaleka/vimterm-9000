# QA Report — VIMTERM-9000

**Date:** 2026-05-11  
**Tested on:** VS Code built-in browser (Simple Browser)  
**Flow tested:** Home → World Map → Zone 1 → Lesson → Practice → Challenge Complete → Back navigation → Settings → Profile → Skill Tree → State persistence

---

## Summary

The core happy-path flow works end-to-end. The CRT aesthetic is visually cohesive and the gamification loop (lesson → practice → XP reward) functions correctly. State persists across page reloads via localStorage.

---

## Issues Found

### 1. Skill Tree — Motion usage counter not tracking (Medium)

**Steps:** Complete a practice challenge using `j` and `l` motions → Navigate to Skill Tree → Click on `j` or `l`.

**Expected:** Usage count reflects motions used during practice (e.g., `j uses: 2`).

**Actual:** Shows `j uses: 0` and `l uses: 0` despite both being used in the completed challenge.

**Impact:** Players can't see their motion usage stats, reducing the value of the Skill Tree as a progress tracker.

---

### 2. World Map — No visual progress indicator for completed lessons (Low)

**Steps:** Complete the first challenge in Zone 1 (HJKL Barracks) → Return to World Map.

**Expected:** Some visual indicator (checkmark, star, color change) on Zone 1 showing partial progress.

**Actual:** Zone 1 card looks identical before and after completing a challenge. No progress bar, no completion markers on individual lessons.

**Impact:** Players have to click into a zone to see where they left off. The world map doesn't communicate progress at a glance.

---

### 3. Lesson Screen — No completion indicator on individual challenges (Low)

**Steps:** Complete challenge 1 of 3 in HJKL Barracks → Return to the lesson screen.

**Expected:** The lesson screen shows which challenges are done (e.g., `[✓] Challenge 1` or star ratings).

**Actual:** Shows "Challenge 1 of 3" as a counter but no visual distinction between completed and uncompleted challenges. No star rating displayed for the completed challenge.

---

### 4. Practice Screen — Cursor not visually visible on the grid (Low)

**Steps:** Start a practice challenge → Observe the editor buffer.

**Expected:** The cursor position (1:1) is highlighted on the grid with a distinct visual indicator (block cursor, highlight, etc.).

**Actual:** The status bar shows `1:1` but the grid itself has no obvious cursor highlight at the starting position. The cursor position is only apparent from the status bar. (Note: may be a rendering issue specific to the Simple Browser.)

---

### 5. "COMPLETE CHALLENGE" button — Bypass without practice (Low)

**Steps:** After completing challenge 1, return to the lesson screen.

**Expected:** Only "START PRACTICE" is available, or "COMPLETE CHALLENGE" requires actual completion.

**Actual:** A "COMPLETE CHALLENGE" button appears alongside "START PRACTICE", potentially allowing users to mark challenges as done without practicing. Not verified if it actually skips — but the button presence is unexpected.

---

### 6. Home Screen — Streak stays at 0 after completing a challenge (Low)

**Steps:** Complete a challenge → Return to Home screen.

**Expected:** Streak increments to 1 (or at least acknowledges today's activity).

**Actual:** `STREAK: 0` is displayed. The 30-day activity heatmap on the Profile screen correctly shows 1 challenge for today, but the streak counter doesn't update.

**Note:** This may be by design if "streak" means consecutive calendar days and requires a prior day's activity. Worth clarifying the intended behavior.

---

## What Works Well

- **CRT theme** — Consistent green-on-black aesthetic with monospace fonts. Looks great.
- **Navigation flow** — All screen transitions (Home ↔ World Map ↔ Lesson ↔ Practice ↔ Complete) work smoothly.
- **Vim motion input** — Pressing `h/j/k/l` keys in the practice screen correctly moves the cursor and updates the status bar position in real-time.
- **Challenge validation** — Reaching the target position (T) correctly triggers the MISSION COMPLETE screen.
- **XP system** — XP is awarded on completion (230 XP for the first challenge) and displayed on both the completion screen and home screen.
- **Star rating** — 1/3 stars awarded for slow completion (37.95s vs 10s par time) — rating system works.
- **State persistence** — XP, challenge progress, and navigation state survive a full page reload.
- **Settings screen** — Full settings panel with theme, audio, gameplay, and accessibility options. Export/import JSON save data feature present.
- **Profile screen** — Shows total stats (keystrokes, time spent), 30-day activity heatmap, and locked achievements.
- **Skill Tree** — Displays all 5 phases of Vim motions with correct locked/unlocked states (only Phase 1 is interactive).
- **Locked zones** — Zones 2–5 correctly show as `[LOCKED]` and are disabled.
