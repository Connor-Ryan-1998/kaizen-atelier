# Kaizen Atelier

The website for Kaizen Atelier, an IT and data consultancy. It is styled as an interactive desktop: a menu bar,
desktop icons and draggable windows. On phones it becomes a home-screen grid. Each window has its own URL
(`/services`, `/pricing`, …) that is server-rendered and indexable.

Design: `docs/superpowers/specs/2026-11-23-desktop-redesign-design.md`

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit + component tests (Vitest)
npm run test:e2e   # browser tests (Playwright; builds and serves production on :3100)
npm run lint
```

First-time e2e setup: `npx playwright install chromium`.

## How it fits together

- `lib/windows.ts`: the window registry (id, title, route, icon side, egg, size, meta description) and the menus.
- `lib/windowState.ts`: a pure reducer for open, close, focus, maximise and move, plus `clampPosition`.
- `components/desktop/`: `<Desktop>` (lives in the root layout, so it never remounts), the window frame,
  icons, menu bar and phone layout.
- `components/windows/`: one component per window. All copy lives here.
- `app/[slug]/page.tsx`: renders nothing visible. It only provides static params and per-window metadata.
- `lib/site.ts`: booking link, email, LinkedIn, demo video id, spaghetti photo credit.

## Common edits

- **Add a window:** add an entry to `WINDOWS` in `lib/windows.ts`, create a component in
  `components/windows/`, and add a line to `components/desktop/windowContent.tsx`.
- **Add a case study:** append to `CASE_STUDIES` in `components/windows/WorkWindow.tsx`.
- **Publish a note:** append to `NOTES` in `components/windows/NotesWindow.tsx`.
- **Add the demo video:** set `DEMO_VIDEO_ID` in `lib/site.ts` to the YouTube video id.
- **Add your CV:** put the PDF in `public/` and link it from `components/windows/CvWindow.tsx`.
