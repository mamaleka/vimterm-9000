# VIMTERM-9000

> *"Press ESC. Then learn to escape."*

A gamified Vim motions learning app with a retro CRT terminal aesthetic. Learn Vim through boss fights, challenges, and an unlockable skill tree — from absolute beginner to Vim Sage.

![CI](https://github.com/mamaleka/vimterm-9000/actions/workflows/ci.yml/badge.svg)

---

## Features

- **5 learning phases** — from basic navigation (`hjkl`) to text objects and marks
- **Boss fights** — defeat enemies by executing the right Vim motions under pressure
- **Skill tree** — unlock new zones as you master each phase
- **CRT terminal aesthetic** — phosphor green glow, scanlines, the works
- **Persistent progress** — state saved to localStorage via Zustand

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 4 + Immer |
| Animation | Framer Motion |
| Testing | Vitest + React Testing Library |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Local development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### Run tests

```bash
npm test            # single run
npm run test:watch  # watch mode
npm run typecheck   # TypeScript strict check
```

### Production build

```bash
npm run build
# output in dist/
```

---

## Docker

### Run production build locally

```bash
docker compose up app
# → http://localhost:8080
```

### Run dev server in Docker

```bash
docker compose up dev
# → http://localhost:5173
```

### Build image manually

```bash
docker build -t vimterm-9000 .
docker run -p 8080:80 vimterm-9000
```

---

## Project Structure

```
src/
  engine/       # Pure TS state machine — vim motion parser & validator
  components/   # React UI components
  screens/      # Screen-level page components
  store/        # Zustand slices
  data/         # Static typed curriculum and boss data
  hooks/        # React hooks
  utils/        # Pure utility functions
  types/        # TypeScript interfaces
```

The `engine/` directory has zero React imports and is fully unit-tested. All functions follow `f(state, input) → state`.

---

## Contributing

This project follows strict **red-green-refactor TDD**. See [CLAUDE.md](./CLAUDE.md) for the full agent workflow and coding standards, and [SPEC.md](./SPEC.md) for the task breakdown.

1. Claim a spec from `SPEC.md` (status `TODO`)
2. Create a branch: `feat/SPEC-NNN-short-description`
3. Write failing test → make it pass → refactor → repeat
4. Open a PR — another agent reviews before merge

---

## License

MIT
