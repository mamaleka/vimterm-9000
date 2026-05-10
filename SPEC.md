# SPEC.md — Implementation Specifications

Each spec is a self-contained unit of work for one agent.
Claim a `TODO` spec, implement it with red-green-refactor TDD, and flag it for review.

**Statuses:** `TODO` · `IN PROGRESS` · `REVIEW` · `DONE`

---

## How to Read a Spec

- **Depends on:** List of SPEC IDs that must be DONE before this spec can start.
- **Files:** Files to create or modify.
- **Tests:** Minimum test cases required (write these as the RED phase).
- **Acceptance criteria:** What must be true for the spec to pass review.

---

## Phase 0 — Project Bootstrap

### SPEC-001 — Vite + React + TypeScript Scaffold
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** nothing
**Branch:** `feat/SPEC-001-vite-scaffold`

**Files to create:**
- `package.json` · `vite.config.ts` · `tsconfig.json` · `tsconfig.node.json`
- `src/main.tsx` · `src/App.tsx` · `index.html`

**Tests:**
- `src/App.test.tsx`: renders without crashing
- TypeScript strict mode compiles with zero errors (`npm run typecheck`)

**Acceptance criteria:**
- `npm run dev` starts a dev server without errors
- `npm run build` produces a dist folder
- TypeScript strict mode is on (`"strict": true` in tsconfig)
- React 18, TypeScript 5, Vite 5 versions confirmed in package.json

---

### SPEC-002 — Tailwind CSS + CRT Theme
**Status:** `DONE`
**Started:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-001
**Branch:** `feat/SPEC-002-tailwind-crt-theme`

**Files to create/modify:**
- `tailwind.config.ts` — extend theme with CRT palette + Google Fonts
- `postcss.config.js`
- `src/index.css` — Tailwind directives + all `--color-*` CSS variables + CRT base styles

**Tests:**
- `src/index.css.test.ts`: verify all 9 CRT color variables are defined (parse CSS file)
- Visual: dev server shows green-on-black background at root

**Acceptance criteria:**
- All 9 CRT color variables present in `src/index.css`
- Tailwind config extends colors with `crt-bg`, `crt-text`, `crt-amber`, `crt-red`, `crt-border`, `crt-dim`, `crt-bright`, `crt-cursor`, `crt-surface`
- Google Fonts VT323, Share Tech Mono, Press Start 2P loaded via `@import`
- `npm run build` succeeds

---

### SPEC-003 — TerminalWindow and Scanlines Components
**Status:** `DONE`
**Merged:** 2026-05-09
**Depends on:** SPEC-002
**Branch:** `feat/SPEC-003-terminal-window`

**Files to create:**
- `src/components/ui/TerminalWindow.tsx`
- `src/components/ui/TerminalWindow.test.tsx`
- `src/components/ui/Scanlines.tsx`
- `src/components/ui/Scanlines.test.tsx`

**Tests:**
- `TerminalWindow` renders children inside a styled container
- `TerminalWindow` applies CRT border and background classes
- `Scanlines` renders a pseudo-element overlay div
- Snapshot tests for both components

**Acceptance criteria:**
- `TerminalWindow` accepts `children` and optional `className` prop
- `Scanlines` is a presentational component with no props
- Both components render with zero TypeScript errors
- Tests pass

---

### SPEC-004 — Zustand Store Skeleton + localStorage Persist
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-001
**Branch:** `feat/SPEC-004-zustand-store`

**Files to create:**
- `src/store/index.ts` — root store with persist middleware
- `src/store/playerSlice.ts`
- `src/store/progressSlice.ts`
- `src/store/challengeSlice.ts`
- `src/store/settingsSlice.ts`
- `src/store/index.test.ts`

**Tests:**
- Store initializes with correct default state for each slice
- `playerSlice` default: `{ xp: 0, level: 1, displayName: 'PLAYER_ONE', streak: { current: 0, longest: 0, lastActivityDate: '', graceUsed: false } }`
- `settingsSlice` default includes all settings sub-objects
- Persist middleware writes to key `vimterm_save_v1`

**Acceptance criteria:**
- All four slices export typed state and actions
- Root store is composed from all slices via Zustand `create`
- Persist middleware configured with `vimterm_save_v1` key
- `version: 1` included in persisted state for future migrations
- Tests pass, zero TypeScript errors

---

### SPEC-005 — Static HomeScreen
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-003, SPEC-004
**Branch:** `feat/SPEC-005-home-screen`

**Files to create:**
- `src/screens/HomeScreen.tsx`
- `src/screens/HomeScreen.test.tsx`

**Files to modify:**
- `src/App.tsx` — render HomeScreen

**Tests:**
- HomeScreen renders inside TerminalWindow
- Displays ASCII title "VIMTERM-9000"
- Renders a player name display (default "PLAYER_ONE")
- Renders an XP bar element (value 0 initially)
- Renders a streak counter (value 0 initially)

**Acceptance criteria:**
- HomeScreen is visible in browser at `npm run dev`
- No interactive elements yet (static render only)
- Reads player state from Zustand store
- Tests pass, zero TypeScript errors

---

## Phase 1 — Vim Engine Core

### SPEC-006 — Core Vim Types
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-001
**Branch:** `feat/SPEC-006-vim-types`

**Files to create:**
- `src/types/vim.ts` — `VimState`, `Position`, `Action`, `VimMode`
- `src/types/challenge.ts` — `ChallengeType`, `ChallengeDefinition`, `SuccessCondition`
- `src/types/player.ts` — `PlayerState`, `StreakState`
- `src/types/curriculum.ts` — `Zone`, `Lesson`, `ChallengeRef`

**Tests:**
- TypeScript compilation is the test: all types must compile with zero errors
- Write a `src/types/vim.test.ts` that constructs a valid `VimState` object and asserts its shape

**`VimState` must include:**
```typescript
{
  mode: 'normal' | 'insert' | 'visual' | 'command';
  buffer: string[];
  cursor: { row: number; col: number };
  register: string;
  pendingOperator: string | null;
  pendingCount: number | null;
  pendingMotion: string[];
  jumpList: Array<{ row: number; col: number }>;
  jumpIndex: number;
  marks: Record<string, { row: number; col: number }>;
  lastFindChar: string | null;
  lastFindDirection: 'forward' | 'backward' | null;
  lastFindTill: boolean;
  searchPattern: string | null;
  lastAction: Action | null;
}
```

**Acceptance criteria:**
- All four type files exist and compile
- `VimState` matches the spec exactly
- `SuccessCondition` is a discriminated union with all 5 variants from PLAN.md
- Tests pass, zero TypeScript errors

---

### SPEC-007 — HJKL Motions
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-006
**Branch:** `feat/SPEC-007-hjkl-motions`

**Files to create:**
- `src/engine/vimEngine.ts` — `processKey(state, key) → VimState` + `createInitialState(buffer) → VimState`
- `src/engine/vimEngine.test.ts`

**Tests (write these first — RED phase):**
- `h` moves cursor left, stops at column 0
- `l` moves cursor right, stops at last char of current line
- `j` moves cursor down, stops at last row
- `k` moves cursor up, stops at row 0
- `l` on empty line does not move
- `j` preserves column (or clamps to shorter line length)
- All four motions on a 3×3 buffer grid (9 test cases minimum)
- Edge: single-line buffer, `j`/`k` do nothing

**Acceptance criteria:**
- `processKey` is a pure function: same input always produces same output
- Zero React imports in `vimEngine.ts`
- All test cases pass
- TypeScript strict, zero errors

---

### SPEC-008 — Word Motions (w b e)
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-007
**Branch:** `feat/SPEC-008-word-motions`

**Files to modify:**
- `src/engine/vimEngine.ts` — add `w`, `b`, `e` handling
- `src/engine/vimEngine.test.ts` — add tests

**Tests:**
- `w` moves to start of next word; stops at end of buffer
- `b` moves to start of current/previous word; stops at start of buffer
- `e` moves to end of current/next word
- All three on multi-word lines: `"hello world foo"` (cursor at each position)
- Punctuation handling: `"foo.bar"` — `w` jumps over `.`
- `w` at last word moves to start of first word on next line
- `b` at first word moves to last word on previous line
- Empty line handling

**Acceptance criteria:**
- All test cases pass
- No regressions in SPEC-007 tests
- Zero TypeScript errors

---

### SPEC-009 — Line and File Motions (0 ^ $ gg G)
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-007
**Branch:** `feat/SPEC-009-line-file-motions`

**Files to modify:**
- `src/engine/vimEngine.ts`
- `src/engine/vimEngine.test.ts`

**Tests:**
- `0` moves to column 0
- `^` moves to first non-whitespace character
- `$` moves to last character on the line
- `gg` moves to row 0, col 0
- `G` moves to last row, col 0
- `^` on a line with leading spaces: `"   hello"` → cursor at col 3
- `$` on empty line: cursor stays at col 0
- `G` on single-line buffer: stays at row 0

**Acceptance criteria:**
- All test cases pass
- No regressions in prior tests
- Zero TypeScript errors

---

### SPEC-010 — Count Modifiers
**Status:** `DONE`
**Merged:** 2026-05-09
**Depends on:** SPEC-007, SPEC-008, SPEC-009
**Branch:** `feat/SPEC-010-count-modifiers`

**Files to modify:**
- `src/engine/vimEngine.ts` — accumulate digits into `pendingCount`, apply to next motion
- `src/engine/vimEngine.test.ts`

**Tests:**
- `3l` moves right 3 columns (or to line end, whichever comes first)
- `5j` moves down 5 rows (or to buffer end)
- `2w` moves forward 2 words
- `10G` moves to row 10 (or last row if fewer)
- `0` when pendingCount is in progress: `10` → count is 10, not zero-motion
- Single digit `1l` works same as `l`
- Count resets after each motion
- Multi-digit counts: `12`, `100` accumulate correctly

**Acceptance criteria:**
- All test cases pass
- `pendingCount` is cleared after each completed motion
- No regressions
- Zero TypeScript errors

---

### SPEC-011 — Find Motions (f F t T ; ,)
**Status:** `DONE`
**Merged:** 2026-05-09
**Depends on:** SPEC-007
**Branch:** `feat/SPEC-011-find-motions`

**Files to modify:**
- `src/engine/vimEngine.ts`
- `src/engine/vimEngine.test.ts`

**Tests:**
- `fx` moves cursor to next `x` on the line; no match → no move
- `Fx` moves cursor to previous `x`; no match → no move
- `tx` moves cursor to one before next `x`
- `Tx` moves cursor to one after previous `x`
- `;` repeats last find in same direction
- `,` repeats last find in opposite direction
- `lastFindChar`, `lastFindDirection`, `lastFindTill` stored in state correctly
- Find after `;` with no lastFind → no move
- Count: `2fx` jumps to second occurrence of `x`

**Acceptance criteria:**
- All test cases pass
- State fields `lastFindChar`, `lastFindDirection`, `lastFindTill` updated correctly
- Zero TypeScript errors

---

### SPEC-012 — Search Motions (/ ? n N)
**Status:** `DONE`
**Merged:** 2026-05-09
**Depends on:** SPEC-007
**Branch:** `feat/SPEC-012-search-motions`

**Files to modify:**
- `src/engine/vimEngine.ts`
- `src/engine/vimEngine.test.ts`

**Tests:**
- `/pattern` sets `searchPattern` and moves cursor to first match after current position
- `?pattern` moves to first match before current position
- `n` repeats search in same direction
- `N` repeats search in opposite direction
- Search wraps around buffer (end → beginning for `/`)
- No match: cursor does not move, `searchPattern` still set
- `searchPattern: null` → `n`/`N` do nothing

**Note:** In the engine, `/` enters a pending search state. Model this as the engine
accumulating characters until `Enter` is pressed. `processKey` with `Enter` in pending
search resolves the pattern.

**Acceptance criteria:**
- All test cases pass
- `searchPattern` stored in VimState
- Zero TypeScript errors

---

### SPEC-013 — Motion Parser
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-006
**Branch:** `feat/SPEC-013-motion-parser`

**Files to create:**
- `src/engine/motionParser.ts` — `parseMotion(buffer: string[]) → MotionIntent | null`
- `src/engine/motionParser.test.ts`

**What it does:** Takes the pending keystroke buffer (`string[]`) and returns a structured
`MotionIntent` (count + motion + operator) or `null` if incomplete.

**Tests:**
- `['h']` → `{ count: 1, motion: 'h', operator: null }`
- `['3', 'w']` → `{ count: 3, motion: 'w', operator: null }`
- `['d', 'w']` → `{ count: 1, motion: 'w', operator: 'd' }`
- `['2', 'd', '3', 'w']` → `{ count: 6, motion: 'w', operator: 'd' }` (2×3)
- `['f', 'x']` → `{ count: 1, motion: 'f', char: 'x', operator: null }`
- Incomplete: `['d']` → `null` (waiting for motion)
- Incomplete: `['3']` → `null` (waiting for motion)
- Unknown key: `['z']` → `null`

**Acceptance criteria:**
- Pure function, zero React imports
- All test cases pass
- Zero TypeScript errors

---

### SPEC-014 — useKeyCapture Hook
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-006, SPEC-002
**Branch:** `feat/SPEC-014-key-capture-hook`

**Files to create:**
- `src/hooks/useKeyCapture.ts`
- `src/hooks/useKeyCapture.test.tsx`

**What it does:** Attaches a global `keydown` listener, filters out modifier keys,
and calls `onKey(key: string)` callback. Detects arrow key presses and calls
`onArrowKey()` separately.

**Tests:**
- Calls `onKey` with correct key string on keydown
- Does not call `onKey` for Ctrl/Alt/Meta modified keys (except Ctrl-o, Ctrl-i)
- Calls `onArrowKey` for ArrowUp, ArrowDown, ArrowLeft, ArrowRight
- Listener removed on component unmount
- Ctrl-o produces key `'<C-o>'`, Ctrl-i produces `'<C-i>'`

**Acceptance criteria:**
- Hook returns `void`, accepts `{ onKey, onArrowKey }` callbacks
- Event listener cleanup on unmount confirmed by test
- Tests pass, zero TypeScript errors

---

### SPEC-015 — useVimEngine Hook
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011, SPEC-012, SPEC-013, SPEC-014
**Branch:** `feat/SPEC-015-use-vim-engine-hook`

**Files to create:**
- `src/hooks/useVimEngine.ts`
- `src/hooks/useVimEngine.test.tsx`

**What it does:** Bridges the pure `vimEngine` to React. Holds `VimState` in `useState`,
wires `useKeyCapture` to `processKey`, exposes state and a `reset(buffer)` function.

**Tests:**
- Initial state reflects given buffer
- Pressing `h` updates cursor col
- Pressing `l` at line end does not exceed bounds
- `reset(newBuffer)` reinitializes state with new buffer
- Arrow key presses tracked (arrow key count increments)

**Acceptance criteria:**
- Returns `{ vimState, arrowKeyCount, reset }`
- All state updates are synchronous React state updates
- Tests pass, zero TypeScript errors

---

## Phase 2 — Editor Component

### SPEC-016 — EditorBuffer Component
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-10
**Depends on:** SPEC-015
**Branch:** `feat/SPEC-016-editor-buffer`

**Files to create:**
- `src/components/editor/EditorBuffer.tsx`
- `src/components/editor/EditorBuffer.test.tsx`

**What it does:** Renders the text buffer as a grid of character `<span>` elements.
Each cell has `data-row` and `data-col` attributes. Target cells get `data-target="true"`.
Enemy marker cells get `data-enemy="true"`.

**Tests:**
- Renders correct number of rows and characters
- Each span has correct `data-row` and `data-col`
- Target cell at given position has `data-target="true"` and amber CSS class
- Enemy cell at given position has `data-enemy="true"` and red CSS class
- Empty buffer renders without crashing

**Props:**
```typescript
{
  buffer: string[];
  targets?: Position[];
  enemies?: Position[];
  visualSelection?: { start: Position; end: Position } | null;
}
```

**Acceptance criteria:**
- All test cases pass
- Uses `--color-amber` for targets, `--color-red` for enemies via Tailwind classes
- Zero TypeScript errors

---

### SPEC-017 — CursorOverlay Component
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-016
**Branch:** `feat/SPEC-017-cursor-overlay`

**Files to create:**
- `src/components/editor/CursorOverlay.tsx`
- `src/components/editor/CursorOverlay.test.tsx`

**What it does:** Renders a block cursor at the given position. Blinks at 530ms interval.
Uses absolute positioning over the EditorBuffer grid.

**Tests:**
- Renders at correct row/col position
- Applies blink class that toggles on/off at ~530ms
- Does not render if `cursor` is null
- Snapshot test for cursor element

**Props:** `{ cursor: Position | null; mode: VimMode }`

**Acceptance criteria:**
- Cursor visible in browser
- Blink rate is 530ms (test the interval value, not wall time)
- Zero TypeScript errors

---

### SPEC-018 — LineNumbers and StatusBar Components
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-10
**Depends on:** SPEC-006, SPEC-002
**Branch:** `feat/SPEC-018-line-numbers-status-bar`

**Files to create:**
- `src/components/editor/LineNumbers.tsx`
- `src/components/editor/LineNumbers.test.tsx`
- `src/components/editor/StatusBar.tsx`
- `src/components/editor/StatusBar.test.tsx`

**LineNumbers tests:**
- Renders correct count of line number elements
- Line numbers are 1-indexed
- Current line highlighted differently

**StatusBar tests:**
- Displays mode string: `-- INSERT --`, `NORMAL`, `VISUAL`, `COMMAND`
- Displays `row:col` from cursor position (1-indexed for display)
- Displays file name if provided

**Props:**
- `LineNumbers`: `{ lineCount: number; currentLine: number }`
- `StatusBar`: `{ mode: VimMode; cursor: Position; fileName?: string }`

**Acceptance criteria:**
- Both components render correctly in all mode variants
- All tests pass, zero TypeScript errors

---

### SPEC-019 — VimEditor Compose Component
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-016, SPEC-017, SPEC-018, SPEC-015
**Branch:** `feat/SPEC-019-vim-editor`

**Files to create:**
- `src/components/editor/VimEditor.tsx`
- `src/components/editor/VimEditor.test.tsx`

**What it does:** Composes `EditorBuffer`, `CursorOverlay`, `LineNumbers`, `StatusBar`
into a single `<VimEditor>` component. Wires `useVimEngine` internally.

**Tests:**
- Renders all sub-components
- Pressing a key via `userEvent` updates cursor position displayed
- Arrow key press triggers `onArrowKey` callback prop
- `initialBuffer` prop sets up buffer correctly

**Props:**
```typescript
{
  initialBuffer: string[];
  targets?: Position[];
  enemies?: Position[];
  onStateChange?: (state: VimState) => void;
  onArrowKey?: () => void;
  fileName?: string;
}
```

**Acceptance criteria:**
- All sub-components visible
- Key presses move the cursor in the browser
- Tests pass, zero TypeScript errors

---

### SPEC-020 — HintPanel and KeyHistoryDisplay Components
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-002
**Branch:** `feat/SPEC-020-hint-panel`

**Files to create:**
- `src/components/editor/HintPanel.tsx`
- `src/components/editor/HintPanel.test.tsx`
- `src/components/editor/KeyHistoryDisplay.tsx`
- `src/components/editor/KeyHistoryDisplay.test.tsx`

**HintPanel tests:**
- Renders hint text when `hint` prop provided
- Renders nothing (or placeholder) when `hint` is null
- Applies CRT dim text style

**KeyHistoryDisplay tests:**
- Shows last N keys pressed (default: last 10)
- Most recent key is visually distinct (brighter)
- Empty history renders empty state

**Props:**
- `HintPanel`: `{ hint: string | null }`
- `KeyHistoryDisplay`: `{ keys: string[]; maxDisplay?: number }`

**Acceptance criteria:**
- Tests pass, zero TypeScript errors

---

## Phase 3 — Challenge System (Zone 1)

### SPEC-021 — Challenge Validator
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-006, SPEC-007, SPEC-008, SPEC-009
**Branch:** `feat/SPEC-021-challenge-validator`

**Files to create:**
- `src/engine/challengeValidator.ts` — `validateChallenge(state: VimState, condition: SuccessCondition) → boolean`
- `src/engine/challengeValidator.test.ts`

**Tests (one per SuccessCondition variant):**
- `{ type: 'cursorAt', position }` — true when cursor matches, false otherwise
- `{ type: 'bufferEquals', expected }` — true when buffer lines match exactly
- `{ type: 'allTargetsReached', targets, inOrder: false }` — true when all positions visited
- `{ type: 'allTargetsReached', targets, inOrder: true }` — true only if visited in sequence
- `{ type: 'allEnemiesDeleted' }` — true when no enemy markers remain in buffer
- `{ type: 'motionUsed', motionType, count }` — true when motion used ≥ count times

**Acceptance criteria:**
- Pure function, zero React imports
- All 5 condition types covered with at least 3 test cases each
- Zero TypeScript errors

---

### SPEC-022 — Zone 1 Curriculum Data
**Status:** `DONE`
**Started:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-006
**Branch:** `feat/SPEC-022-zone1-curriculum`

**Files to create:**
- `src/data/curriculum.ts` — Zone 1 complete (10+ challenges across 4 lessons)

**Zone 1 structure:**
```
Zone 1 — Tutorial Bunker
  Lesson 1-1: HJKL Barracks (3 challenges — reach target using only h/j/k/l)
  Lesson 1-2: Word Waypoints (3 challenges — reach target using w/b/e)
  Lesson 1-3: Line Ledge (2 challenges — 0 ^ $ gg G)
  Lesson 1-4: Count Cavern (2 challenges — count modifiers with any above motion)
```

**Each challenge must include:** `id`, `type`, `initialBuffer`, `initialCursor`,
`successCondition`, `allowedMotions`, `parTime`, optional `maxKeystrokes`, optional `hint`.

**Tests:**
- `curriculum.ts` compiles with zero TypeScript errors (compile-time validation)
- Each challenge has a unique `id`
- Every `allowedMotions` entry is a valid motion string
- `parTime` is a positive number for all challenges
- At least 10 challenges exist in Zone 1

**Acceptance criteria:**
- All 4 lessons defined with correct challenge types
- TypeScript compilation validates all fields
- Tests pass

---

### SPEC-023 — XP and Level Utilities
**Status:** `DONE`
**Started:** 2026-05-09
**Completed:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-006
**Branch:** `feat/SPEC-023-xp-utils`

**Files to create:**
- `src/utils/xp.ts`
- `src/utils/xp.test.ts`

**Functions to implement:**
- `calculateXP(base, speedBonus, accuracyBonus, firstCompletion, streakDays) → number`
- `xpToLevel(xp: number) → number` — returns level 1–11+ from XP thresholds
- `levelToXPThreshold(level: number) → number` — XP needed for given level

**XP thresholds from PLAN.md:**
```
Lv1: 0, Lv2: 100, Lv3: 250, Lv4: 500, Lv5: 900,
Lv6: 1400, Lv7: 2000, Lv8: 2800, Lv9: 3800, Lv10: 5000
Lv11+: +1500 per level
```

**Tests:**
- `calculateXP(100, false, false, false, 0)` → 100
- `calculateXP(100, true, false, false, 0)` → 125 (25% speed bonus)
- `calculateXP(100, false, true, false, 0)` → 115 (15% accuracy bonus)
- `calculateXP(100, false, false, true, 0)` → 200 (2× first completion)
- `calculateXP(100, false, false, false, 10)` → 150 (50% streak cap)
- `xpToLevel(0)` → 1, `xpToLevel(99)` → 1, `xpToLevel(100)` → 2
- `xpToLevel(5000)` → 10, `xpToLevel(6500)` → 11
- `levelToXPThreshold(1)` → 0, `levelToXPThreshold(10)` → 5000

**Acceptance criteria:**
- All test cases pass
- Pure functions, zero React/Zustand imports
- Zero TypeScript errors

---

### SPEC-024 — Streak Utilities
**Status:** `DONE`
**Started:** 2026-05-09
**Merged:** 2026-05-09
**Depends on:** SPEC-006
**Branch:** `feat/SPEC-024-streak-utils`

**Files to create:**
- `src/utils/time.ts`
- `src/utils/time.test.ts`

**Functions:**
- `todayString() → string` — returns `YYYY-MM-DD` for today
- `updateStreak(streak: StreakState, today: string) → StreakState` — returns new streak state
- `isStreakActive(streak: StreakState, today: string) → boolean`

**Streak rules:**
- Active if `lastActivityDate === today` or yesterday
- Grace: 1 missed day allowed per 7-day streak (if `graceUsed` is false)
- If missed by >1 day (or >1 with grace used): streak resets to 1, graceUsed resets

**Tests:**
- Same day activity: streak unchanged, still active
- Next day activity: streak +1
- 1-day gap: uses grace if not used, streak preserved
- 1-day gap with grace used: streak resets to 1
- 2-day gap: streak resets regardless
- `longest` updates when current exceeds it
- `graceUsed` resets after 7 consecutive days (7-day roll window)

**Acceptance criteria:**
- All test cases pass
- Pure functions only
- Zero TypeScript errors

---

### SPEC-025 — ReachTarget Challenge Component
**Status:** `TODO`
**Depends on:** SPEC-019, SPEC-021, SPEC-022
**Branch:** `feat/SPEC-025-reach-target`

**Files to create:**
- `src/components/challenge/ReachTarget.tsx`
- `src/components/challenge/ReachTarget.test.tsx`

**What it does:** Renders `VimEditor` with one or more target cells highlighted amber.
Calls `onSuccess(keystrokeCount, timeMs)` when `validateChallenge` returns true.
Calls `onArrowKeyPress()` when arrow key detected.

**Tests:**
- Renders VimEditor with target cells highlighted
- `onSuccess` called when cursor reaches target position
- `onSuccess` not called before target reached
- Timer starts on mount, elapsed time passed to `onSuccess`
- Keystroke count passed to `onSuccess`
- Arrow key triggers `onArrowKeyPress`

**Props:**
```typescript
{
  challenge: ChallengeDefinition;
  onSuccess: (keystrokes: number, timeMs: number) => void;
  onArrowKeyPress: () => void;
}
```

**Acceptance criteria:**
- All tests pass
- Challenge validates in real time (each key press checks condition)
- Zero TypeScript errors

---

### SPEC-026 — PracticeScreen
**Status:** `TODO`
**Depends on:** SPEC-025, SPEC-023, SPEC-024, SPEC-004
**Branch:** `feat/SPEC-026-practice-screen`

**Files to create:**
- `src/screens/PracticeScreen.tsx`
- `src/screens/PracticeScreen.test.tsx`

**What it does:** Hosts the challenge component, displays HUD (XP bar, streak badge),
shows hint panel, shows key history, handles challenge success by awarding XP and
navigating to ChallengeCompleteScreen.

**Tests:**
- Renders the correct challenge component for `challenge.type`
- On success: XP action dispatched to store with correct amount
- On success: `currentScreen` transitions to `'challengeComplete'`
- Arrow key press shows warning flash element
- Hint visible when challenge has hint

**Acceptance criteria:**
- All tests pass
- XP correctly calculated using `calculateXP` with time and accuracy inputs
- Zero TypeScript errors

---

### SPEC-027 — ChallengeCompleteScreen
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-023, SPEC-004
**Branch:** `feat/SPEC-027-challenge-complete-screen`

**Files to create:**
- `src/screens/ChallengeCompleteScreen.tsx`
- `src/screens/ChallengeCompleteScreen.test.tsx`

**What it does:** Displays XP earned, star rating (1/2/3), speed and accuracy stats.
XP bar animates from old value to new value over 600ms. "Continue" button advances.

**Tests:**
- Renders XP amount earned
- Renders correct star count (1, 2, or 3)
- XP bar animated element present in DOM
- "Continue" button calls `onContinue`
- Displays "FIRST COMPLETION" badge when `firstCompletion === true`
- Displays streak multiplier when `streakDays > 0`

**Props:**
```typescript
{
  xpEarned: number;
  stars: 1 | 2 | 3;
  keystrokes: number;
  timeMs: number;
  parTime: number;
  firstCompletion: boolean;
  streakDays: number;
  onContinue: () => void;
}
```

**Acceptance criteria:**
- All tests pass
- XP bar CSS transition duration is 600ms
- Zero TypeScript errors

---

## Phase 4 — World Map and Navigation

### SPEC-028 — Custom Router
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-004
**Branch:** `feat/SPEC-028-custom-router`

**Files to create:**
- `src/store/settingsSlice.ts` — add `currentScreen: Screen` to settings slice (update existing)
- `src/App.tsx` — switch on `currentScreen`

**Screen type:**
```typescript
type Screen = 'home' | 'worldMap' | 'skillTree' | 'lesson' | 'practice'
            | 'bossFight' | 'profile' | 'settings' | 'challengeComplete';
```

**Tests:**
- `App` renders `HomeScreen` when `currentScreen === 'home'`
- `App` renders `PracticeScreen` when `currentScreen === 'practice'`
- Screen transitions on store update
- Navigation actions exported from store: `navigateTo(screen: Screen)`

**Acceptance criteria:**
- All tests pass
- No React Router dependency
- Zero TypeScript errors

---

### SPEC-029 — WorldMapScreen
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-028, SPEC-003, SPEC-004
**Branch:** `feat/SPEC-029-world-map`

**Files to create:**
- `src/screens/WorldMapScreen.tsx`
- `src/screens/WorldMapScreen.test.tsx`

**What it does:** Renders the ASCII zone map. Locked zones are dim (`opacity-30`).
Unlocked zones are bright and clickable. Clicking an unlocked zone navigates to its first lesson.

**Tests:**
- All 5 zones rendered
- Locked zones have dim styling
- Unlocked zone click calls `navigateTo('lesson')`
- Only Zone 1 unlocked by default (initial state)
- Zone names and boss names visible

**Acceptance criteria:**
- All tests pass
- ASCII art matches zone layout from PLAN.md
- Zero TypeScript errors

---

### SPEC-030 — HUD Component (XP Bar + Streak Badge)
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-023, SPEC-024, SPEC-004
**Branch:** `feat/SPEC-030-hud`

**Files to create:**
- `src/components/ui/HUD.tsx`
- `src/components/ui/HUD.test.tsx`
- `src/components/ui/XPBar.tsx`
- `src/components/ui/XPBar.test.tsx`

**Tests (HUD):**
- Renders current XP and level
- Renders streak count
- XP bar width proportional to progress within current level
- Streak at 0: no streak badge

**Tests (XPBar):**
- Width 0% at level start XP
- Width 100% at next level threshold
- Width 50% at midpoint

**Acceptance criteria:**
- All tests pass
- HUD is a persistent overlay visible on all gameplay screens
- Zero TypeScript errors

---

## Phase 5 — Full Curriculum (Operator and Text Object Engine)

### SPEC-031 — Operator Motions (d c y p .)
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-015
**Branch:** `feat/SPEC-031-operator-motions`

**Files to modify:**
- `src/engine/vimEngine.ts`
- `src/engine/vimEngine.test.ts`

**Tests:**
- `dw` deletes from cursor to end of word
- `dd` deletes entire current line
- `d$` deletes from cursor to end of line
- `cw` deletes word and enters insert mode
- `yy` yanks current line into register
- `p` pastes register after cursor
- `P` pastes register before cursor
- `.` repeats last change operation
- `d3w` deletes 3 words
- Dot repeat after `cw` + text: repeats the change

**Acceptance criteria:**
- All tests pass
- `lastAction` in state stores correct data for dot repeat
- Insert mode: subsequent character keystrokes append to buffer at cursor
- `Escape` exits insert mode, returns to normal
- No regressions in prior tests
- Zero TypeScript errors

---

### SPEC-032 — Text Object Motions (iw aw i" i' i( i[ i{ ip ap)
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-031
**Branch:** `feat/SPEC-032-text-objects`

**Files to modify:**
- `src/engine/vimEngine.ts`
- `src/engine/vimEngine.test.ts`

**Tests (each text object with `d` operator):**
- `diw` deletes inner word (no surrounding spaces)
- `daw` deletes word + surrounding space
- `di"` deletes content inside double quotes
- `di'` deletes content inside single quotes
- `di(` deletes content inside parentheses (handles nesting)
- `di[` deletes content inside brackets
- `di{` deletes content inside braces
- `dip` deletes inner paragraph
- `dap` deletes paragraph + blank lines
- `ci"` deletes inside quotes and enters insert mode
- Cursor outside any text object: no-op

**Acceptance criteria:**
- All test cases pass
- No regressions
- Zero TypeScript errors

---

### SPEC-033 — Mark and Jump Motions (m ' ` % { } * #)
**Status:** `TODO`
**Depends on:** SPEC-031
**Branch:** `feat/SPEC-033-marks-jumps`

**Files to modify:**
- `src/engine/vimEngine.ts`
- `src/engine/vimEngine.test.ts`

**Tests:**
- `ma` sets mark `a` at current cursor position
- `'a` jumps to line of mark `a` (col 0)
- `` `a `` jumps to exact position of mark `a`
- `%` on `(` jumps to matching `)`; on `)` jumps to matching `(`
- `%` on `[`, `]`, `{`, `}` jumps to matching counterpart
- `{` moves to start of previous paragraph
- `}` moves to start of next paragraph
- `*` searches for word under cursor forward
- `#` searches for word under cursor backward
- `Ctrl-o` moves back in jump list
- `Ctrl-i` moves forward in jump list

**Acceptance criteria:**
- All tests pass
- `marks` and `jumpList` updated correctly in state
- Zero TypeScript errors

---

### SPEC-034 — Zone 2–5 Curriculum Data
**Status:** `TODO`
**Depends on:** SPEC-022, SPEC-031, SPEC-032, SPEC-033
**Branch:** `feat/SPEC-034-zones-2-5-curriculum`

**Files to modify:**
- `src/data/curriculum.ts` — add Zones 2, 3, 4, 5

**Minimum challenge counts:**
- Zone 2 (Find & Jump): 8 challenges
- Zone 3 (Operators): 10 challenges
- Zone 4 (Text Objects): 10 challenges
- Zone 5 (Named Positions): 8 challenges

**Tests:**
- Total challenge count ≥ 46
- Each zone has at least one challenge of each type used in that zone
- All challenge IDs unique across all zones
- All `allowedMotions` are valid motion strings
- Compile-time TypeScript validation

**Acceptance criteria:**
- Tests pass, zero TypeScript errors

---

### SPEC-035 — DeleteEnemies and Transform Challenge Components
**Status:** `TODO`
**Depends on:** SPEC-019, SPEC-021, SPEC-031, SPEC-032
**Branch:** `feat/SPEC-035-delete-enemies-transform`

**Files to create:**
- `src/components/challenge/DeleteEnemies.tsx`
- `src/components/challenge/DeleteEnemies.test.tsx`
- `src/components/challenge/TransformChallenge.tsx`
- `src/components/challenge/TransformChallenge.test.tsx`

**DeleteEnemies tests:**
- Enemy tokens rendered in red (`[X]`, `>><<`, etc.)
- `onSuccess` called when all enemy tokens deleted from buffer
- Enemy count display updates as enemies deleted

**TransformChallenge tests:**
- Shows "before" buffer and "after" reference side-by-side
- `onSuccess` called when buffer matches expected state exactly
- Shows diff indicator (how many lines differ)

**Acceptance criteria:**
- All tests pass
- Both components follow same props pattern as ReachTarget
- Zero TypeScript errors

---

### SPEC-036 — SpeedRun Challenge Component
**Status:** `TODO`
**Depends on:** SPEC-025
**Branch:** `feat/SPEC-036-speed-run`

**Files to create:**
- `src/components/challenge/SpeedRun.tsx`
- `src/components/challenge/SpeedRun.test.tsx`

**What it does:** Shows sequential waypoints (1 at a time). Each reached waypoint reveals
the next. All reached → `onSuccess`.

**Tests:**
- First waypoint shown initially
- Reaching first waypoint shows second
- Reaching all waypoints calls `onSuccess`
- Waypoint counter displayed (`2/5`)
- Elapsed time displayed, turns red when >2× parTime

**Acceptance criteria:**
- All tests pass
- Zero TypeScript errors

---

## Phase 6 — Gamification Layer

### SPEC-037 — Achievement Definitions and useAchievements Hook
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-004, SPEC-023
**Branch:** `feat/SPEC-037-achievements`

**Files to create:**
- `src/data/achievements.ts` — all achievement definitions
- `src/hooks/useAchievements.ts`
- `src/hooks/useAchievements.test.tsx`

**Achievement definition type:**
```typescript
interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  checkCondition: (stats: StatisticsState, progress: ProgressState) => boolean;
}
```

**Tests:**
- "Hjklonomicon": returns true when all HJKL challenges completed
- "Word Wizard": true when `motionUseCounts['w'] + ['b'] + ['e'] >= 100`
- "Repeat Offender": true when `.` used 25 times in a session
- "Speed Demon": true when `speedChallengesUnderPar >= 10`
- "HJKL Addict": true when `arrowKeyPresses >= 50`
- `useAchievements` dispatches unlock action for newly met conditions
- Already unlocked achievements not dispatched again

**Acceptance criteria:**
- All 12 achievements from PLAN.md defined
- Hook runs after every relevant state change
- Tests pass, zero TypeScript errors

---

### SPEC-038 — SkillTreeScreen
**Status:** `TODO`
**Depends on:** SPEC-028, SPEC-037, SPEC-003
**Branch:** `feat/SPEC-038-skill-tree`

**Files to create:**
- `src/screens/SkillTreeScreen.tsx`
- `src/screens/SkillTreeScreen.test.tsx`

**What it does:** Displays a circuit-board-style dependency graph of motions.
Unlocked motions glow bright. Locked motions dim. Click a node to see usage count.

**Tests:**
- All 5 phase motion groups rendered
- Unlocked motions have bright class; locked have dim class
- Click on motion node shows usage stats tooltip
- Back button navigates to world map

**Acceptance criteria:**
- Tests pass
- Motion dependency edges rendered (lines between related motions)
- Zero TypeScript errors

---

### SPEC-039 — ProfileScreen
**Status:** `TODO`
**Depends on:** SPEC-028, SPEC-037, SPEC-004
**Branch:** `feat/SPEC-039-profile-screen`

**Files to create:**
- `src/screens/ProfileScreen.tsx`
- `src/screens/ProfileScreen.test.tsx`

**What it does:** Player card, total stats, 30-day streak heatmap, achievement gallery.

**Tests:**
- Displays player name and level
- Total keystrokes and time spent visible
- 30-day heatmap renders 30 cells
- Heatmap cell opacity proportional to daily activity count
- Achievement gallery shows unlocked achievements with dates
- Locked achievements shown as `???`

**Acceptance criteria:**
- Tests pass, zero TypeScript errors

---

## Phase 7 — Boss Fights

### SPEC-040 — Boss Data
**Status:** `DONE`
**Started:** 2026-05-10
**Completed:** 2026-05-10
**Merged:** 2026-05-10
**Depends on:** SPEC-006
**Branch:** `feat/SPEC-040-boss-data`

**Files to create:**
- `src/data/bossData.ts`

**Each boss requires:** `id`, `name`, `zone`, `asciiArt` (multiline string),
`stages` (array of `ChallengeDefinition` with boss-specific success conditions),
`dialogue` (taunts indexed by event: `wrongKey`, `timeout`, `stageCleared`, `defeat`).

**All 5 bosses from PLAN.md:**
1. The Arrow Key Phantom (Zone 1)
2. The Grep Golem (Zone 2)
3. The Syntax Serpent (Zone 3)
4. The JSON Jormungandr (Zone 4)
5. The Vim Wraith (Zone 5)

**Tests:**
- All 5 bosses exist
- Each boss has 3–5 stages
- Each boss has all 4 dialogue event types
- ASCII art strings are non-empty
- TypeScript compilation validates all fields

**Acceptance criteria:**
- Tests pass, zero TypeScript errors

---

### SPEC-041 — BossFightScreen
**Status:** `TODO`
**Depends on:** SPEC-028, SPEC-040, SPEC-025, SPEC-035
**Branch:** `feat/SPEC-041-boss-fight-screen`

**Files to create:**
- `src/screens/BossFightScreen.tsx`
- `src/screens/BossFightScreen.test.tsx`
- `src/components/ui/HealthBar.tsx`
- `src/components/ui/HealthBar.test.tsx`
- `src/components/challenge/BossStage.tsx`
- `src/components/challenge/BossStage.test.tsx`

**Tests:**
- Boss ASCII art and name rendered
- Player health (3 hearts) displayed
- Boss health bar displayed
- Timer counts down per stage
- Timer turns red below 30%
- Wrong keystroke threshold triggers heart loss
- Stage cleared advances to next stage
- All stages cleared → victory
- Hearts reach 0 → defeat screen

**Acceptance criteria:**
- All tests pass
- Zero TypeScript errors

---

## Phase 8 — Polish

### SPEC-042 — SettingsScreen
**Status:** `IN PROGRESS`
**Started:** 2026-05-10
**Depends on:** SPEC-028, SPEC-004
**Branch:** `feat/SPEC-042-settings-screen`

**Files to create:**
- `src/screens/SettingsScreen.tsx`
- `src/screens/SettingsScreen.test.tsx`

**Tests:**
- Theme section: phosphor color toggle changes `--color-text` CSS variable
- Scanlines toggle adds/removes scanlines overlay
- Font size toggle applies correct Tailwind text size class
- Audio toggle enables/disables audio system
- Save/export renders a JSON blob in a textarea
- Import: pasting valid JSON updates store

**Acceptance criteria:**
- All settings from the schema (theme, audio, gameplay, accessibility) represented
- Export produces valid JSON parseable as `SaveData`
- Import validates schema version before applying
- Tests pass, zero TypeScript errors

---

### SPEC-043 — LessonScreen
**Status:** `TODO`
**Depends on:** SPEC-028, SPEC-022, SPEC-019
**Branch:** `feat/SPEC-043-lesson-screen`

**Files to create:**
- `src/screens/LessonScreen.tsx`
- `src/screens/LessonScreen.test.tsx`

**What it does:** Shows theory text (typewriter effect), then a guided cursor demo,
then launches 3–5 scaffolded challenges from the lesson's challenge list.

**Tests:**
- Theory text rendered (typewriter complete on mount for test env)
- "Start Practice" button navigates to first challenge in lesson
- Challenge progress shown (`Challenge 2 of 5`)
- Last challenge complete → navigates to `challengeComplete` or boss if zone done

**Acceptance criteria:**
- Tests pass, zero TypeScript errors

---

## Spec Status Summary

| Spec | Title | Status | Phase |
|------|-------|--------|-------|
| SPEC-001 | Vite Scaffold | DONE | 0 |
| SPEC-002 | Tailwind CRT Theme | DONE | 0 |
| SPEC-003 | TerminalWindow + Scanlines | DONE | 0 |
| SPEC-004 | Zustand Store Skeleton | DONE | 0 |
| SPEC-005 | Static HomeScreen | DONE | 0 |
| SPEC-006 | Core Vim Types | DONE | 1 |
| SPEC-007 | HJKL Motions | DONE | 1 |
| SPEC-008 | Word Motions | DONE | 1 |
| SPEC-009 | Line/File Motions | DONE | 1 |
| SPEC-010 | Count Modifiers | DONE | 1 |
| SPEC-011 | Find Motions | DONE | 1 |
| SPEC-012 | Search Motions | DONE | 1 |
| SPEC-013 | Motion Parser | DONE | 1 |
| SPEC-014 | useKeyCapture Hook | DONE | 1 |
| SPEC-015 | useVimEngine Hook | DONE | 1 |
| SPEC-016 | EditorBuffer Component | DONE | 2 |
| SPEC-017 | CursorOverlay Component | DONE | 2 |
| SPEC-018 | LineNumbers + StatusBar | DONE | 2 |
| SPEC-019 | VimEditor Compose | DONE | 2 |
| SPEC-020 | HintPanel + KeyHistory | DONE | 2 |
| SPEC-021 | Challenge Validator | DONE | 3 |
| SPEC-022 | Zone 1 Curriculum Data | DONE | 3 |
| SPEC-023 | XP + Level Utils | DONE | 3 |
| SPEC-024 | Streak Utils | DONE | 3 |
| SPEC-025 | ReachTarget Challenge | TODO | 3 |
| SPEC-026 | PracticeScreen | TODO | 3 |
| SPEC-027 | ChallengeCompleteScreen | DONE | 3 |
| SPEC-028 | Custom Router | DONE | 4 |
| SPEC-029 | WorldMapScreen | DONE | 4 |
| SPEC-030 | HUD + XPBar | DONE | 4 |
| SPEC-031 | Operator Motions | DONE | 5 |
| SPEC-032 | Text Object Motions | DONE | 5 |
| SPEC-033 | Marks + Jump Motions | TODO | 5 |
| SPEC-034 | Zones 2–5 Curriculum | TODO | 5 |
| SPEC-035 | DeleteEnemies + Transform | TODO | 5 |
| SPEC-036 | SpeedRun Challenge | TODO | 5 |
| SPEC-037 | Achievements | DONE | 6 |
| SPEC-038 | SkillTreeScreen | TODO | 6 |
| SPEC-039 | ProfileScreen | TODO | 6 |
| SPEC-040 | Boss Data | DONE | 7 |
| SPEC-041 | BossFightScreen | TODO | 7 |
| SPEC-042 | SettingsScreen | IN PROGRESS | 8 |
| SPEC-043 | LessonScreen | TODO | 8 |
