# VIMTERM-9000 — Gamified Vim Motions App

> *"Press ESC. Then learn to escape."*

A retro CRT terminal web app that teaches Vim motions through gamified challenges, boss fights, and an unlockable skill tree — from absolute beginner to Vim Sage.

---

## Table of Contents

1. [Learning Curriculum](#1-learning-curriculum)
2. [Gamification System](#2-gamification-system)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Challenge Types](#5-challenge-types)
6. [UI/UX Theme](#6-uiux-theme)
7. [Persistence Schema](#7-persistence-schema)
8. [Screen Flow](#8-screen-flow)
9. [Implementation Phases](#9-implementation-phases)

---

## 1. Learning Curriculum

### Philosophy: One Mental Model Per Phase

Every phase introduces a single new mental model. Each unlocks something the previous phase couldn't do, creating intrinsic pull to continue.

| Phase | Mental Model | Motions Taught |
|-------|-------------|----------------|
| 1 | Position as coordinate | `h j k l` · `w b e` · `0 ^ $` · `gg G` · count modifiers |
| 2 | Position as target/destination | `f F t T ; ,` · `/ ? n N` · `Ctrl-o Ctrl-i` |
| 3 | Verb + Noun = Command | `d c y p` · `.` (dot repeat) · `> <` |
| 4 | Noun as semantic region | `iw aw` · `i" i'` · `i( i[ i{` · `ip ap` |
| 5 | Position as named location | `m' \`` marks · `%` · `{ }` · `* #` |

### Zone Map

```
ZONE 1 — Tutorial Bunker       Boss: "The Arrow Key Phantom"
  [HJKL Barracks] → [Word Waypoints] → [Line Ledge] → [Count Cavern]

ZONE 2 — Navigator's Canyon    Boss: "The Grep Golem"
  [Find Falls] → [Search Sanctum] → [Jump Junction]

ZONE 3 — Operator's Forge      Boss: "The Syntax Serpent"
  [Delete Dungeon] → [Change Chamber] → [Yank Yard] → [Dot Dojo]

ZONE 4 — Linguist's Library    Boss: "The JSON Jormungandr"
  [Word Vault] → [Quote Quarry] → [Bracket Bastion]

ZONE 5 — Master's Summit       Boss: "The Vim Wraith"
  [Mark Mountain] → [Match Meadow] → [Paragraph Peak]
```

### Detailed Phase Breakdown

**Phase 1 — Survival Navigation**
- Teach `h`/`l` before `j`/`k` (horizontal feels more natural first)
- `w b e` as "word is the natural unit of thought"
- Line extremes `0 ^ $` + file extremes `gg G` as macro navigation
- Count modifiers (`3w`, `5j`) last — no new keys, just multiplier mental model

**Phase 2 — Find & Jump**
- `f F t T` — in-line targeting; `;` and `,` to repeat/reverse
- `/` and `?` — buffer-wide search, introduces "pattern as motion"
- `Ctrl-o Ctrl-i` — taught last, after students feel the pain of losing their place

**Phase 3 — The Grammar**
- Core insight: `operator + motion = command` is the grammar of Vim
- `d` → `c` (same grammar, different result: drops to insert) → `y p`
- `.` dot repeat saved for after operators exist to repeat — feels magical
- `> <` reinforces the grammar with a simple, visual operator

**Phase 4 — Text Objects**
- Core insight: text objects name *semantic regions*, not positions
- `iw` vs `aw` contrast: ciw vs caw — demonstrate the difference with real code
- Bracket objects shown with nested code; quote objects with string editing
- Paragraph objects for prose

**Phase 5 — Named Positions**
- Marks as "place bookmarks in your text"
- `%` — matching bracket jump (simple but extremely useful)
- `{ }` / `( )` for paragraph/sentence navigation
- `*` / `#` — search word under cursor (ties back to Phase 2 search mental model)

---

## 2. Gamification System

### XP and Levels

**XP Sources (per challenge):**
- Base XP: 10–500 (scales with difficulty/phase)
- Speed bonus: +25% if completed under par time
- Accuracy bonus: +15% if zero wrong keystrokes
- First completion: 2× multiplier on first clear
- Streak multiplier: +5% per streak day, capped at +50%

**Level Thresholds:**
```
Lv 1  (     0 XP)  Lost in Normal Mode
Lv 2  (   100 XP)  Reading the Map
Lv 3  (   250 XP)  Motion Apprentice
Lv 4  (   500 XP)  Navigator
Lv 5  (   900 XP)  Tactician
Lv 6  ( 1,400 XP)  Operator
Lv 7  ( 2,000 XP)  Grammar Scholar
Lv 8  ( 2,800 XP)  Text Object Sage
Lv 9  ( 3,800 XP)  Virtuoso
Lv 10 ( 5,000 XP)  Vim Ascendant
Lv 11+          +1,500 XP per level
```

### Streak System

- A streak day = at least 1 challenge completed per calendar day
- **Grace period:** 1 missed day allowed per 7-day streak (so streaks aren't destroyed by life)
- **Milestones:** days 3, 7, 14, 30 grant bonus XP + unique badge
- **Visual:** the terminal cursor glows brighter at higher streaks; shown as persistent HUD element

### Boss Fights

Each zone's boss is a multi-stage challenge (3–5 stages) with:

| Element | Detail |
|---------|--------|
| Player health | 3 hearts; lost when wrong keystrokes exceed threshold per stage |
| Boss health | Chunky blocks, decreases per stage cleared |
| Timer | Countdown per stage; turns red below 30%; boss "attacks" on timeout (scrambles text) |
| Dialogue | Boss taunts on wrong keystrokes |
| Finishing move | Final stage requires a specific complex combo |
| Win | XP shower + ASCII victory art + next zone unlocks |
| Lose | Retry screen; progress on completed stages preserved |

**Boss Examples:**
- *The Arrow Key Phantom (Zone 1):* Navigate a maze using only hjkl; arrow keys detected and blocked
- *The Syntax Serpent (Zone 3):* Delete trailing markers with `d$`, rename with `ciw`, use `.` to fix 6 identical errors
- *The JSON Jormungandr (Zone 4):* Restructure nested JSON using only text objects — no character-by-character navigation

### Achievements

**Navigation**
- "Hjklonomicon" — complete all h/j/k/l challenges
- "Word Wizard" — use w/b/e 100 times in practice
- "Line Lord" — use gg/G 50 times
- "Counter Culture" — use a count prefix 50 times

**Combat**
- "First Blood" — complete first delete challenge
- "Clean Cut" — dw challenge with zero wasted keystrokes
- "Repeat Offender" — use dot repeat 25 times in one session
- "Grammar Purist" — 10 operator+motion combos without any insert mode

**Speed**
- "Speed Demon" — beat par time on 10 challenges
- "No Time to Think" — complete any challenge under 2 seconds

**Secret**
- "HJKL Addict" — press arrow keys (blocked) 50 times across all challenges
- "Late Night Hacker" — complete a challenge between 2–4am local time
- "Perfectionist" — 100% accuracy on 20 consecutive challenges

---

## 3. Tech Stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | React 18 + TypeScript 5 (strict) | Type safety critical for Vim engine |
| Build | Vite 5 | Fast HMR, simple config |
| Styling | Tailwind CSS 3 (custom CRT palette) | Utility-first, easy theming |
| State | Zustand 4 + immer | No boilerplate, built-in persist middleware |
| Persistence | localStorage via Zustand persist | No backend; deployable as static site |
| Animation | Framer Motion (light usage) | Typewriter effects, screen transitions |
| Testing | Vitest + React Testing Library | Vite-native, fast |
| Fonts | VT323 · Share Tech Mono · Press Start 2P | Free Google Fonts, authentic CRT aesthetic |
| Router | None — Zustand `currentScreen` state | 10 screens, simple nav — no library needed |

**Dependencies:**
```
react react-dom
zustand immer
framer-motion

devDeps:
typescript vite @vitejs/plugin-react
tailwindcss postcss autoprefixer
vitest @testing-library/react @testing-library/user-event
```

---

## 4. Architecture

### Directory Structure

```
vim-practice/
  src/
    engine/
      vimEngine.ts            ← CORE: pure state machine (zero React deps)
      motionParser.ts         ← keystroke buffer → Motion intent
      challengeValidator.ts   ← judge: did player solve the challenge?
      keyMap.ts               ← key definitions and categories
    components/
      editor/
        VimEditor.tsx         ← compose all editor sub-components
        EditorBuffer.tsx      ← render text grid as character cells
        CursorOverlay.tsx     ← block cursor + blink
        LineNumbers.tsx
        StatusBar.tsx         ← classic Vim bottom bar
      ui/
        TerminalWindow.tsx    ← shared CRT frame for all screens
        Scanlines.tsx         ← CSS CRT scanline overlay
        HUD.tsx               ← persistent XP/streak display
        XPBar.tsx
        HealthBar.tsx         ← boss fight health display
        AsciiArt.tsx          ← render ASCII art strings
      challenge/
        ChallengeRenderer.tsx ← route to correct challenge type
        ReachTarget.tsx
        SpeedRun.tsx
        DeleteEnemies.tsx
        TransformChallenge.tsx
        BossStage.tsx
    screens/
      HomeScreen.tsx
      WorldMapScreen.tsx
      SkillTreeScreen.tsx
      LessonScreen.tsx
      PracticeScreen.tsx
      BossFightScreen.tsx
      ProfileScreen.tsx
      SettingsScreen.tsx
      ChallengeCompleteScreen.tsx
    store/
      index.ts                ← root Zustand store + persist
      playerSlice.ts
      progressSlice.ts
      challengeSlice.ts
      settingsSlice.ts
    data/
      curriculum.ts           ← all zones, lessons, challenges (type-checked at compile time)
      achievements.ts
      bossData.ts
    hooks/
      useVimEngine.ts         ← bridges pure engine to React
      useKeyCapture.ts        ← global keyboard event capture
      useChallenge.ts         ← challenge lifecycle
      useAchievements.ts      ← achievement condition checking
      useStreak.ts
    utils/
      xp.ts                   ← XP/level calculations
      time.ts                 ← date/streak utilities
      ascii.ts                ← ASCII rendering helpers
    types/
      vim.ts
      challenge.ts
      player.ts
      curriculum.ts
    App.tsx
    main.tsx
    index.css                 ← Tailwind directives + CRT CSS variables
```

### Key Architectural Decisions

**1. Pure Vim Engine**
`vimEngine.ts` has zero React imports. All functions are pure:
`processKey(state, key) → state`. This enables 100% unit test coverage via Vitest without mounting any component. The engine's correctness is the app's entire value proposition.

**2. TypeScript challenge data (not JSON)**
Challenge definitions in `curriculum.ts` are validated at compile time. You cannot accidentally define a challenge with an invalid `successCondition` or broken motion reference.

**3. Zustand over Redux**
Less boilerplate, better TypeScript inference, built-in persist middleware. State is not complex enough to need Redux patterns.

**4. Custom router over React Router**
`currentScreen: Screen` in Zustand + a switch in `App.tsx`. 10 screens with simple navigation doesn't need URL routing.

### Core Types

```typescript
interface VimState {
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
  lastAction: Action | null;  // for dot repeat
}

type SuccessCondition =
  | { type: 'cursorAt'; position: Position }
  | { type: 'bufferEquals'; expected: string[] }
  | { type: 'allTargetsReached'; targets: Position[]; inOrder: boolean }
  | { type: 'allEnemiesDeleted' }
  | { type: 'motionUsed'; motionType: string; count: number };

interface ChallengeDefinition {
  id: string;
  type: ChallengeType;
  initialBuffer: string[];
  initialCursor: Position;
  successCondition: SuccessCondition;
  allowedMotions: string[];     // motions considered "legal" for this challenge
  parTime: number;              // seconds for speed bonus
  maxKeystrokes?: number;
  hint?: string;
}
```

---

## 5. Challenge Types

| Type | Description | Used For |
|------|-------------|----------|
| **Reach Target** | Move cursor to a glowing highlighted cell | Phases 1 & 2 motions |
| **Speed Run** | Hit sequential waypoints as fast as possible | Post-lesson reinforcement |
| **Delete Enemies** | Remove ASCII "enemy" tokens (`[X]`, `>><<`, `"VIRUS"`, `{BOSS}`) from buffer | Phase 3 operators + Phase 4 text objects |
| **Transform** | Fix "broken" code/text to match a reference state using `c` + `.` + `y p` | Phase 3 change/yank/dot |
| **Boss Stage** | One stage within a boss fight (any type above, wrapped in boss UI) | Zone bosses |
| **Flashcard Drill** | "What key jumps to end of word?" — type the answer | Pre-boss review |
| **Free Practice** | Open sandbox, no pass/fail, stats recorded | Post-lesson optional |

### Challenge Scoring

```
Stars:
  ★★★  Complete under par time AND ≥95% accuracy
  ★★☆  Complete under 2× par time OR ≥85% accuracy
  ★☆☆  Complete (any time, any accuracy)

XP = baseXP
   × (speed bonus if applicable)
   × (accuracy bonus if applicable)
   × (2 if first completion)
   × (1 + streak_days * 0.05, capped at 1.5)
```

---

## 6. UI/UX Theme

### "VIMTERM-9000" — Phosphor CRT Terminal

**Color Palette:**
```css
--color-bg:           #0a0f0a   /* near-black, green-tinted */
--color-surface:      #0d1a0d
--color-border:       #1a3a1a
--color-text-dim:     #2d5c2d
--color-text:         #4dff4d   /* phosphor green */
--color-text-bright:  #80ff80
--color-amber:        #ffb000   /* target highlight */
--color-red:          #ff3030   /* enemy / danger / boss health */
--color-cursor:       #4dff4d
```

**Typography:**
- Editor/body: **VT323** — pixel terminal font
- Descriptions: **Share Tech Mono** — slightly more readable
- Titles/boss names: **Press Start 2P** — chunky retro impact

**CRT Effects (pure CSS, no canvas):**

| Effect | Implementation |
|--------|----------------|
| Scanlines | `repeating-linear-gradient` pseudo-element, 2px repeat |
| Vignette | Radial gradient darkening corners |
| Phosphor glow | `text-shadow: 0 0 4px currentColor, 0 0 8px currentColor` |
| Flicker | Opacity animation at random 8–12s intervals (barely perceptible) |
| CRT curvature | CSS `perspective` transform on terminal window |
| Chromatic aberration | 1px red/blue `text-shadow` offset on title text only |

**ASCII Art on every major screen:**

```
Zone cleared:
  [[ ZONE CLEARED ]]
  +250 XP EARNED
  ACHIEVEMENT UNLOCKED: "OPERATOR'S MARK"
  PRESS [ENTER] TO CONTINUE

Boss intro:
  /\___/\
 (  o o  )
 =( Y )=       BOSS: THE SYNTAX SERPENT
   )   (        ZONE III GUARDIAN
  (_)-(_)       [HEALTH: ████████████] 100%
```

**Animation Principles:**
- Typewriter effect: narrative text types in at ~40ms per character
- Cursor blink: 530ms on/off (standard terminal rate)
- Screen transitions: fast horizontal scanline wipe (80ms)
- XP bar fill: smooth 600ms animation on challenge complete
- Level up: full-screen flash + ASCII art explosion (1.5s, skippable)
- Achievement unlock: slides in from bottom-right, 3-second display

**Audio (off by default):**
- Keypress: subtle mechanical click (5% volume)
- Correct motion: ascending chime
- Wrong keystroke: low buzz
- Challenge complete: 3-note victory jingle
- Boss defeated: full 8-bit fanfare

---

## 7. Persistence Schema

Single localStorage key: `vimterm_save_v1`

```typescript
interface SaveData {
  version: number;        // schema version for migrations
  savedAt: string;        // ISO timestamp

  player: {
    id: string;           // UUID on first launch
    displayName: string;  // "PLAYER_ONE" default
    xp: number;
    level: number;        // cached, derived from xp
    streak: {
      current: number;
      longest: number;
      lastActivityDate: string;  // YYYY-MM-DD
      graceUsed: boolean;
    };
    achievements: Record<string, { unlockedAt: string; progress?: number }>;
    title: string;
  };

  progress: {
    unlockedZones: string[];
    completedLessons: Record<string, {
      stars: 1 | 2 | 3;
      bestTime: number;
      completedAt: string;
    }>;
    completedChallenges: Record<string, {
      attempts: number;
      bestTime: number;
      bestAccuracy: number;
      stars: 1 | 2 | 3;
      xpEarned: number;
    }>;
    bossDefeats: Record<string, {
      defeatedAt: string;
      heartsRemaining: number;
    }>;
    currentZone: string;
    currentLesson: string | null;
  };

  statistics: {
    totalTimeSpent: number;          // seconds
    totalKeystrokesRecorded: number;
    motionUseCounts: Record<string, number>;   // { "w": 847, "dw": 203 }
    dailyActivity: Record<string, number>;     // YYYY-MM-DD → challenges
    arrowKeyPresses: number;
    sessionHistory: Array<{
      date: string;
      duration: number;
      xpEarned: number;
    }>;
  };

  settings: {
    theme: {
      phosphorColor: 'green' | 'amber' | 'white';
      scanlines: boolean;
      crtCurvature: boolean;
      flickerEffect: boolean;
      fontSize: 'sm' | 'md' | 'lg';
    };
    audio: {
      enabled: boolean;
      volume: number;      // 0.0 to 1.0
    };
    gameplay: {
      showHints: boolean;
      arrowKeyWarning: boolean;
      autoAdvance: boolean;
    };
    accessibility: {
      reducedMotion: boolean;
      highContrast: boolean;
    };
  };
}
```

**Migration strategy:** `version` field + `Record<number, (data: any) => any>` migrations applied sequentially on load.

**Export/import:** Player can copy/paste a JSON blob for save sharing — no backend needed.

---

## 8. Screen Flow

```
HomeScreen ──────────────────────────────────────┐
  │                                               │
  ├── WorldMapScreen                              │
  │     └── LessonScreen                         │
  │           └── PracticeScreen (×N)            │
  │                 └── ChallengeCompleteScreen   │
  │                       └── (loop or next)     │
  │                                               │
  │         (all zone lessons done)               │
  │           └── BossFightScreen                 │
  │                 ├── Win → BossDefeatedScreen  │
  │                 │         └── zone unlocked   │
  │                 └── Lose → retry              │
  │                                               │
  ├── SkillTreeScreen (alternative view)          │
  ├── ProfileScreen (stats / achievements)        │
  └── SettingsScreen                              │
```

### Screen Summary

| Screen | Purpose |
|--------|---------|
| **HomeScreen** | Entry: player card, XP bar, streak, quick continue |
| **WorldMapScreen** | Full ASCII zone map, visual progress, locked zones dimmed |
| **SkillTreeScreen** | Circuit-board motion dependency graph; click node for stats |
| **LessonScreen** | Theory panel → guided cursor demo → 3–5 scaffolded challenges |
| **PracticeScreen** | Core gameplay: editor + challenge + hints + key history |
| **BossFightScreen** | Multi-stage with health bars, timer, boss dialogue |
| **ChallengeCompleteScreen** | Score breakdown, XP earned, stars, achievement popups |
| **ProfileScreen** | Player card, stats, 30-day streak heatmap, achievement gallery |
| **SettingsScreen** | Theme, audio, gameplay, accessibility, export/import save |

---

## 9. Implementation Phases

### Phase 0 — Project Bootstrap
**Goal:** Something on screen. No gameplay.
- `npm create vite@latest . -- --template react-ts`
- Install all dependencies
- Tailwind configured with CRT color palette + Google Fonts
- `TerminalWindow.tsx` + `Scanlines.tsx` + CRT CSS (scanlines, vignette, glow)
- Static `HomeScreen` with ASCII title
- Root Zustand store skeleton (all slices empty)
- `localStorage.ts` + Zustand persist wired up

**Deliverable:** CRT-themed homepage renders. Nothing interactive.

---

### Phase 1 — Vim Engine Core
**Goal:** Engine works. No UI.
- All types in `src/types/vim.ts`
- `vimEngine.ts`: `h j k l` · `w b e` · `0 ^ $` · `gg G` · count modifiers · `f F t T ; ,` · `/ ? n N`
- `motionParser.ts`
- `useKeyCapture.ts` + `useVimEngine.ts` hooks
- Vitest unit tests for every motion

**Deliverable:** 100% unit-tested Vim engine. No visual output.

---

### Phase 2 — Editor Component
**Goal:** Visual editor responds to keystrokes.
- `EditorBuffer.tsx` (character-cell grid with data attributes per cell)
- `CursorOverlay.tsx` (block cursor, 530ms blink)
- `LineNumbers.tsx` + `StatusBar.tsx` (mode, file, row:col)
- `VimEditor.tsx` (compose all)
- Highlight system: target cells, enemy markers, visual selection
- `HintPanel.tsx` + `KeyHistoryDisplay.tsx`
- Sandbox screen for manual testing

**Deliverable:** Functional fake Vim editor in browser. Press `hjkl`, cursor moves.

---

### Phase 3 — Challenge System (Zone 1 end-to-end)
**Goal:** Full gameplay loop, one zone.
- `curriculum.ts` schema + Zone 1 data (10+ challenges)
- `challengeValidator.ts`
- `ReachTarget.tsx` challenge type
- `PracticeScreen.tsx` + `ChallengeCompleteScreen.tsx` with XP animation
- XP system + level calculation
- Zustand persist → localStorage wired

**Deliverable:** Zone 1 fully playable. Progress saves between browser sessions.

---

### Phase 4 — World Map and Navigation
**Goal:** Multi-zone navigation, streak.
- `WorldMapScreen.tsx` (full-screen ASCII map, panning, zone tooltips)
- Zone unlock logic in progressSlice
- `LessonScreen.tsx` (theory panel + guided demo + challenge series)
- `StreakBadge.tsx` + streak logic in `utils/time.ts`
- Custom router (Zustand `currentScreen`)
- Framer Motion screen transition animations

**Deliverable:** Zones 1–2 navigable. Streak tracking live. World map shows progress.

---

### Phase 5 — Full Curriculum
**Goal:** All 5 phases of content exist.
- Engine extended: `d c y p .` · text objects · marks · `%` · paragraph motions
- All Zone 2–5 challenge data (50+ total challenges)
- `DeleteEnemies.tsx` + `TransformChallenge.tsx` + `SpeedRun.tsx`

**Deliverable:** All 5 zones playable end-to-end.

---

### Phase 6 — Gamification Layer
**Goal:** Achievements, skill tree, streak rewards.
- Full achievement system + `useAchievements.ts` (runs on every state change)
- `AchievementUnlockScreen.tsx` overlay (slide-in from bottom-right)
- `SkillTreeScreen.tsx` (circuit board with motion dependency graph)
- `ProfileScreen.tsx` (stats, 30-day streak heatmap, achievement gallery)
- Streak milestone bonuses + XP multiplier system

**Deliverable:** Full gamification loop. Achievements unlock. Skill tree shows mastery.

---

### Phase 7 — Boss Fights
**Goal:** All zone bosses playable.
- `BossFightScreen.tsx` + `BossIntro.tsx` (ASCII art + typewriter dialogue)
- Boss state machine (stages, hearts, countdown timer, boss attacks)
- Health bar components for player + boss
- Boss data for all 5 zones
- `BossVictory.tsx` + `BossDefeat.tsx`

**Deliverable:** All 5 bosses playable. Boss defeat unlocks next zone.

---

### Phase 8 — Polish
**Goal:** Production-ready.
- `SettingsScreen.tsx` fully wired (theme, audio, gameplay, accessibility)
- Web Audio API sound system (off by default)
- All CRT effects: flicker, curvature, chromatic aberration
- Free practice sandbox + flashcard drill
- Export/import save as JSON blob
- Arrow key detection + warning flash
- Accessibility: reduced motion, high contrast modes

**Deliverable:** All screens polished. Settings fully functional.

---

### Phase 9 — Testing & Deploy
**Goal:** Ship it.
- Full Vitest engine unit test suite
- React Testing Library integration tests (challenge validation flows)
- Manual QA: full playthrough zones 1–5
- Performance: < 8ms key event response (no jank)
- Vite build + deploy to Vercel or Netlify (static export)

**Deliverable:** Live app at a public URL.

---

## Critical Files (Implementation Priority)

| # | File | Why |
|---|------|-----|
| 1 | `src/engine/vimEngine.ts` | Pure state machine; all gameplay correctness depends on this |
| 2 | `src/engine/challengeValidator.ts` | The judge for all gameplay |
| 3 | `src/components/editor/VimEditor.tsx` | Everything the player sees and touches |
| 4 | `src/data/curriculum.ts` | All challenge/lesson definitions; drives all content |
| 5 | `src/store/index.ts` | Root Zustand store + persistence; ties everything together |

---

## End-to-End Verification (Phase 3 Milestone)

1. Open app in browser
2. Complete Zone 1 Lesson 1 (10 challenges using `h j k l`)
3. See XP accumulate and level threshold advance on XP bar
4. Refresh page — progress restored from localStorage
5. Return next calendar day — streak increments to 2
6. Complete boss fight — Zone 2 unlocks on world map
