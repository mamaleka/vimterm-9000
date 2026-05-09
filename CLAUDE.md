# CLAUDE.md — Agent Instructions for VIMTERM-9000

This document is the authoritative guide for every agent working on this project.
Read it completely before writing a single line of code.

---

## Project Overview

VIMTERM-9000 is a gamified Vim motions learning app built with:
- **React 18 + TypeScript 5 (strict)** via Vite 5
- **Tailwind CSS 3** with custom CRT color palette
- **Zustand 4 + immer** for state management with localStorage persist
- **Framer Motion** for animations
- **Vitest + React Testing Library** for all tests

See [PLAN.md](./PLAN.md) for the full design document.
See [SPEC.md](./SPEC.md) for the task breakdown — claim your spec from there.

---

## Mandatory: Red-Green-Refactor TDD

Every feature must follow strict red-green-refactor. No exceptions.

### The Cycle

1. **RED** — Write a failing test first. Run it and confirm it fails with the expected error. Commit the failing test.
2. **GREEN** — Write the minimum code to make the test pass. No extra logic. Run tests and confirm they pass. Commit.
3. **REFACTOR** — Clean up without changing behavior. Tests must still pass after. Commit.

### Rules

- Never write implementation code before a failing test exists.
- Never skip the red phase — if a test passes before you write code, the test is wrong.
- One red-green-refactor cycle per logical unit (function, component, behavior).
- Commit at each phase: `test(SPEC-NNN): red — <what fails>`, `feat(SPEC-NNN): green — <what passes>`, `refactor(SPEC-NNN): clean up <what>`.

### What to Test

| Layer | Tool | What to Cover |
|-------|------|---------------|
| Pure engine functions | Vitest | Every motion, every edge case, every error path |
| React components | Vitest + RTL | Render, user interaction, state changes |
| Challenge validation | Vitest | Every success condition variant |
| Store slices | Vitest | State transitions and side effects |

Test files live alongside source: `vimEngine.ts` → `vimEngine.test.ts` in the same directory.

---

## Git Workflow

### Branch Naming

```
feat/SPEC-NNN-short-description
```

Examples:
- `feat/SPEC-007-hjkl-motions`
- `feat/SPEC-025-challenge-validator`
- `feat/SPEC-016-editor-buffer`

### Worktrees for Parallel Work

Each agent working on an independent spec uses a separate git worktree so they
don't block each other. The worktree path convention:

```
c:\Users\mosima.mamaleka\Desktop\learn\vim-practice-worktrees\SPEC-NNN\
```

Create a worktree:
```powershell
git worktree add ..\vim-practice-worktrees\SPEC-NNN feat/SPEC-NNN-short-description
```

Remove after merge:
```powershell
git worktree remove ..\vim-practice-worktrees\SPEC-NNN
```

List active worktrees:
```powershell
git worktree list
```

### Commit Message Format

```
type(SPEC-NNN): short description

Body if needed.
```

Types: `test` · `feat` · `refactor` · `fix` · `docs` · `chore`

### Merge Protocol

1. All tests pass on the feature branch.
2. Open a PR (or flag for review) — a **different agent** must review before merge.
3. The review agent runs tests, checks TDD compliance, checks spec acceptance criteria.
4. Merge only after review approval. Use `git merge --no-ff` to preserve branch history.

---

## Review Agent Protocol

When you are the **review agent** for a branch:

1. Check out the branch (or its worktree).
2. Run `npm test` — all tests must pass.
3. Verify red-green-refactor: check git log for the three commit phases.
4. Read the spec (SPEC-NNN in SPEC.md) and verify every acceptance criterion is met.
5. Check that no code exists without a corresponding test.
6. Check TypeScript: `npm run typecheck` must pass with zero errors.
7. Report PASS or FAIL with specific findings. Do not merge a FAIL.

---

## Claiming a Spec

Before starting work:
1. Open SPEC.md and find a spec with status `TODO`.
2. Update its status to `IN PROGRESS` and add your start timestamp.
3. Create your branch and worktree.
4. Begin the red-green-refactor cycle.

When done:
1. Update spec status to `REVIEW`.
2. Notify the orchestrator that the spec is ready for review.

---

## Tech Stack Quick Reference

```
src/
  engine/         ← Pure TypeScript, zero React. Unit-test everything here.
  components/     ← React components. RTL tests.
  screens/        ← Screen-level components. RTL integration tests.
  store/          ← Zustand slices. Vitest unit tests.
  data/           ← Static typed data. Compile-time validated.
  hooks/          ← React hooks. RTL tests via components.
  utils/          ← Pure functions. Vitest unit tests.
  types/          ← TypeScript interfaces only. No tests needed.
```

Key invariant: `src/engine/` has **zero React imports**. It is a pure state machine.
All functions in `src/engine/` are pure: `f(state, input) → state`.

---

## Code Standards

- TypeScript strict mode. No `any`. No `@ts-ignore`.
- No comments unless the WHY is non-obvious.
- No console.log in production code.
- Tailwind classes only — no inline styles.
- Component files: PascalCase. Utility files: camelCase.
- Exports: named exports only (no default exports except for React components at screen level).
- CRT color palette variables defined in `src/index.css` — never hardcode hex values in components.

---

## CRT Color Palette (reference)

```css
--color-bg:           #0a0f0a
--color-surface:      #0d1a0d
--color-border:       #1a3a1a
--color-text-dim:     #2d5c2d
--color-text:         #4dff4d
--color-text-bright:  #80ff80
--color-amber:        #ffb000
--color-red:          #ff3030
--color-cursor:       #4dff4d
```

---

## Running the Project

```powershell
npm install          # install deps
npm run dev          # start dev server
npm test             # run Vitest in watch mode
npm run typecheck    # tsc --noEmit
npm run build        # production build
```
