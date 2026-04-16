# prep.dev — Coding Interview Flashcard App

Build confidence for coding interviews through pattern recognition, verbal practice, and guided-to-interview confidence modes.

## Quick start

### Prerequisites
- Node.js ≥ 18 — [download](https://nodejs.org)
- npm ≥ 9 (ships with Node 18)

### Mac
```bash
git clone git@github.com:leodawglu/stage3-interview-prep.git
cd stage3-interview-prep
cp .env.example .env
npm install
npm run dev
# Open http://localhost:5173
```

### Windows (PowerShell)
```powershell
git clone git@github.com:leodawglu/stage3-interview-prep.git
cd stage3-interview-prep
copy .env.example .env
npm install
npm run dev
# Open http://localhost:5173
```

## Features

### Confidence modes
| Mode | Who it's for | What changes |
|------|-------------|--------------|
| **Guided** | Zero confidence | Concepts always expanded, keyword labels, 2 choices, scaffolded notes, model answers visible |
| **Practice** | Building confidence | Concepts collapsible, 3 choices, say-out-loud hidden until attempt |
| **Interview** | Ready to test | No scaffolding, timer, no model answers, rapid-fire modifications |

### Card flow (7 steps)
1. **Problem loads** — keywords highlighted, concept check, missing constraints
2. **Select approach** — A/B/C (easy/medium) or mix-and-match (hard)
3. **Say approach** — narrate before seeing if you're right
4. **Check answer** — correct/wrong/plausible revealed with explanations
5. **Code reveal** — annotated code (green = requirement, amber = constraint, purple = pattern)
6. **Verbal summary** — self-rate your explanation (3-point scale with criteria)
7. **Title + modifications** — problem name revealed, mastery score breakdown, optional follow-ups

### Performance tracking
- Mastery score per card (0–100, averaged over last 3 attempts)
- Practice-more queue (spaced repetition)
- Streak tracking
- Per-pattern progress

### Multi-profile
Up to 5 local profiles — each with separate progress, settings, and confidence mode.

## Project structure

```
src/
├── constants/     # Schema version, app constants, pattern metadata
├── data/          # Card JSON files (one per pattern, lazy-loaded)
├── adapters/      # Storage layer (local/cloud swappable)
├── hooks/         # useCardState, useTimer, useProgress, useSettings...
├── components/    # FlashCard, CodeReveal, NotesPad, ChoiceGrid...
├── pages/         # Home, Chapter, Card, Dashboard, Settings...
└── styles/        # CSS tokens + global styles
```

## Card content status

| Pattern | Easy | Medium | Hard |
|---------|------|--------|------|
| Arrays & sliding window | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 |
| Two pointers & fast/slow | ✅ 3/3 | ✅ 3/3 | ✅ 3/3 |
| Trees & graphs (BFS/DFS) | 🔲 stub | 🔲 stub | 🔲 stub |
| Dynamic programming | 🔲 stub | 🔲 stub | 🔲 stub |
| Linked lists | 🔲 stub | 🔲 stub | 🔲 stub |
| Binary search | 🔲 stub | 🔲 stub | 🔲 stub |
| Backtracking | 🔲 stub | 🔲 stub | 🔲 stub |
| Heap / priority queue | 🔲 stub | 🔲 stub | 🔲 stub |
| Stack & monotonic stack | 🔲 stub | 🔲 stub | 🔲 stub |
| String manipulation | 🔲 stub | 🔲 stub | 🔲 stub |

Stub patterns load the card schema with placeholder text. Full card authoring is Phase 1 Pass 2.

## Cloud hosting (Phase 3)

Set `VITE_STORAGE_MODE=cloud` in `.env` and add Supabase credentials. The storage adapter swaps automatically — no component changes needed.

## Built by
Leo Lu — [github.com/leodawglu](https://github.com/leodawglu)
