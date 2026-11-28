# Kaizen Atelier

The website for Kaizen Atelier, an IT and data consultancy. It is styled as an interactive desktop: a menu bar,
desktop icons and draggable windows. On phones it becomes a home-screen grid. Each window has its own URL
(`/services`, `/pricing`, …) that is prerendered as static HTML and indexable.

Design: `docs/superpowers/specs/2026-11-23-desktop-redesign-design.md`

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit + component tests (Vitest)
npm run test:e2e   # browser tests (Playwright; builds the static export and serves it with Wrangler on :3100)
npm run preview    # serve the built out/ locally with Wrangler, as Cloudflare does
npm run lint
```

First-time e2e setup: `npx playwright install chromium`.

`npm run build` (and so `npm run test:e2e`) reads the Substack feed, falling back to the committed snapshot if it can't.
`npm run dev` works offline, with an empty blog.

## Deploy

The site is a static export (`out/`) served as a Cloudflare Worker's static assets (`wrangler.jsonc`). Redirects live in
`public/_redirects`.

`.github/workflows/deploy.yml` lints, tests, builds and runs `wrangler deploy` on every push to `main`, daily at
20:00 UTC (to pick up new Substack posts), and on demand from the Actions tab. It needs two repo secrets:
`CLOUDFLARE_API_TOKEN` (token from the "Edit Cloudflare Workers" template) and `CLOUDFLARE_ACCOUNT_ID`.

Substack blocks some build-server IPs with HTTP 403, so the build falls back to `lib/feed-snapshot.json` (a committed
copy of the feed) when the live fetch fails, and logs `using lib/feed-snapshot.json`. If you see that line, the live fetch
was blocked and the blog is showing the snapshot. Refresh it from your own machine with `npm run snapshot` (needs Node 22.18 or later) and commit the
result, ideally whenever you publish a post. The build only fails if the live fetch fails and the snapshot has no usable posts. Watch for failure
emails, and note that GitHub disables scheduled workflows after 60 days without repo activity: re-enable it from the
Actions tab if the blog stops updating.

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
