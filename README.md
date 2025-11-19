# Mandarin Flashcards

A minimal Mandarin flashcard trainer that pairs a light SM-2 based SRS with tone-aware pinyin entry and helper UI affordances.

## Quickstart

```bash
npm install            # install deps
npm run dev            # start the Vite dev server
```

Helpful scripts:

- `npm run build` – production bundle
- `npm run preview` – serve the production build locally
- `npm run lint` – eslint across the project

### Tests?

There is a placeholder suite at `src/util/test/pinyin.test.js`, but no test runner is wired up in `package.json`, so `npm test` (or similar) will fail. To use those specs, add a runner such as Vitest or Jest and point it at the file.

## Architecture (brief)

- `src/components/flashcardapp.jsx` – orchestrates deck state, persistence, SRS progression, and UI layout (stats, controls, queue).
- `src/components/flashcard.jsx` – renders either the prompt or answer face and handles keyboard/tap toggling.
- `src/components/PinyinInput.jsx` – validates typed answers, converts number tones to diacritics, and surfaces tone chips.
- `src/util/pinyin.js` – normalization, comparison, and formatting helpers for pinyin strings (shared by UI + tests).
- `src/util/srs.js` – SM-2-lite logic for advancing intervals, ease, and scheduling next reviews.
- `src/data/deck.js` – seed deck that is cloned, enriched, and then persisted to `localStorage`.

Persistence lives entirely in `flashcardapp.jsx`: on load it hydrates from `localStorage`, otherwise bootstraps from the seed deck; every state change is written back so progress survives reloads. The reset button rebuilds the starter deck and clears stored progress.

## Time Spent

Roughly 1.5 hours across feature work (tone fixes, persistence reset), verification, and documentation.