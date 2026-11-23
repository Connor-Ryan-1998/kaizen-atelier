# Kaizen Atelier Desktop Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current scrolling landing page with an interactive "desktop" site (menu bar, left/right icons, draggable windows, one URL per window, phone home-screen grid) in the washi/vermilion/indigo theme, with the copy rewritten in the new voice.

**Architecture:** A single client `<Desktop>` lives in the root layout, so it never remounts between routes. Route pages (`/`, `/[slug]`) render nothing visible and only supply metadata and static params. The Desktop works out its initial open window from `usePathname()`, so the window content appears in the server-rendered HTML. Window state (open set, z-order, positions, maximised) is a pure reducer. Focus changes call `window.history.pushState`, which Next syncs with `usePathname`. Back and forward re-focus the matching window through a pathname effect.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4 (`@theme` tokens in `globals.css`), framer-motion (drag + open/close), lucide-react (only where a stock glyph fits), `next/font` IBM Plex Sans/Mono. Dev-only additions: Vitest + Testing Library + jsdom (unit/component), Playwright (e2e).

**Spec:** `docs/superpowers/specs/2026-11-23-desktop-redesign-design.md`. Read it alongside this plan. Its Appendix A is the source of all copy.

## Global Constraints

- No new runtime UI/state libraries. Test tooling is dev-only.
- Palette tokens (exact): `paper #F2EBDD`, `surface #FBF7EF`, `ink #1E1B18`, `muted #6E655A`, `vermilion #D9472B`, `indigo #2C3E63`, `note #FFF3A8`; dot grid `rgba(44,62,99,.06)` at 18px.
- Borders 1.5px `ink`. Hard offset shadows: 3px small, 6px windows. No blur, no gradients, no glassmorphism.
- Fonts: IBM Plex Sans (UI/body) + IBM Plex Mono (filenames/labels). Remove the `font-family: Arial` override.
- Desktop mode at ≥ 768px (`md:`). Phone home-grid below that.
- Booking (new tab): `https://calendar.app.google/5HCocotfMXvcyh3V8`.
- Booking embed (verified framable, no X-Frame-Options on the final page): `https://calendar.google.com/calendar/appointments/schedules/AcZssZ1xJtJlFBuVaMJcjXlr9vv1zb-Jw9JLxB1GkOm5p60sC2ARjusKMzs0YQ6uLzsbfmceswANIbvo?gv=true`
- Email `hq2831@gmail.com`. LinkedIn `https://www.linkedin.com/in/connormartinryan/`.
- Copy: use spec Appendix A verbatim. A `[bracketed]` item must never appear on the page. Apply the "until supplied" fallback the appendix gives for it.
- No Nintendo or PostHog characters, names, sprites or illustrations.
- Title pattern `{Window title} — Kaizen Atelier`. Home: `Kaizen Atelier — IT & data consulting`. Default description: "Data, automation and infrastructure built around how your business actually works."
- Easter-egg routes get `robots: { index: false }`.
- Respect `prefers-reduced-motion` (no scale animation; instant open/close).

## Review Focus

1. **Unknown URL** (`/foo`): the desktop shows a `404.txt` window with a "back to desktop" link and Next returns 404. It must not be blank or crash. Tested in Task 4.
2. **Direct load or crawler** (`/services` with no JS): the HTML already contains the window content and the right `<title>`. Tested in Task 4 and Task 10.
3. **Back/forward after opening several windows:** focus follows the URL. Closing the focused window moves the URL to the next top window, or `/` if none are left. Tested in Task 3 (reducer) and Task 4 (e2e).
4. **Re-opening an already-open window** (icon double-click, menu item, back button): it focuses and is never duplicated. Tested in Task 3.
5. **Small laptop viewport** (1024×600) or a window dragged off-screen: the title bar stays reachable and the window body scrolls internally. Tested in Task 3 (`clampPosition`) and Task 6 (e2e).

---

## File Structure

```
lib/site.ts                 constants (URLs, email, demo video id, image attribution)
lib/windows.ts              window registry (pure data) + path helpers
lib/windowState.ts          reducer, initial state, clampPosition, cascade
lib/*.test.ts               unit tests
components/desktop/
  Desktop.tsx               client root: provider, URL sync, layout of icons/windows
  WindowFrame.tsx           window chrome, drag, close/maximise, Esc, focus mgmt
  DesktopIcon.tsx           icon button (desktop column + phone grid tile)
  MenuBar.tsx               logo, dropdown menus, clock, Book a call
  Clock.tsx                 client clock, renders after mount
  StickyNote.tsx            first-view hint on `/`
  MobileHero.tsx            compact welcome card for phones
  useIsDesktop.ts           matchMedia('(min-width: 768px)'), false on server
  windowContent.tsx         WindowId -> content component map
components/icons/
  Glyphs.tsx                SVG icon set keyed by IconName
  WorkshopLogo.tsx          workshop mark (menu bar)
components/windows/         one file per window (Welcome, Services, Work, Process,
                            About, Pricing, Contact, Cv, Notes, Homelab, Pipelines,
                            Demo, Trash, NotFound)
app/layout.tsx              fonts, metadata defaults, <Desktop/>
app/page.tsx                returns null
app/[slug]/page.tsx         generateStaticParams, generateMetadata, returns null
app/not-found.tsx           returns null (Desktop renders 404 window)
app/icon.svg                favicon (workshop mark)
app/globals.css             tokens, base styles
e2e/desktop.spec.ts, e2e/mobile.spec.ts
vitest.config.ts, vitest.setup.ts, playwright.config.ts
```

Deleted: `components/Hero.tsx`, `components/NavBar.tsx`, `components/ScrollSection.tsx`, `components/Services.tsx`, `app/favicon.ico`, `public/{file,globe,next,vercel,window}.svg`.

---

### Task 1: Tooling, theme tokens, fonts, site constants

**Files:**
- Modify: `package.json` (scripts + devDeps), `app/globals.css`, `app/layout.tsx`, `.gitignore`
- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `lib/site.ts`, `lib/site.test.ts`
- Delete: `tailwind.config.ts` (Tailwind 4 uses `@theme` in CSS. The file is unused v3-style config.)

**Interfaces:**
- Produces: `lib/site.ts` exports `BOOKING_URL`, `BOOKING_EMBED_URL`, `EMAIL`, `MAILTO` (`mailto:hq2831@gmail.com?subject=Project%20Request`), `LINKEDIN_URL`, `DEMO_VIDEO_ID: string | null` (= `null`), `SPAGHETTI: { src: string; alt: string; credit: string; license: string; sourceUrl: string }` (filled in Task 9; stub values now). Tailwind colour utilities `bg-paper`, `bg-surface`, `text-ink`, `text-muted`, `bg-vermilion`, `text-indigo`, `bg-note`; font utilities `font-sans` (Plex Sans), `font-mono` (Plex Mono); shadow utilities `shadow-hard` (3px 3px 0 ink), `shadow-hard-lg` (6px 6px 0 ink).

- [ ] **Step 1: Install deps.** `npm install` then `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test` and `npx playwright install chromium`. Add scripts `"test": "vitest run"`, `"test:e2e": "playwright test"`. Add `.superpowers/`, `/test-results`, `/playwright-report` to `.gitignore`.
- [ ] **Step 2: Configure.** `vitest.config.ts`: jsdom env, react plugin, `@` alias to repo root, `setupFiles: ['vitest.setup.ts']` (imports `@testing-library/jest-dom/vitest`), `exclude: ['e2e/**', 'node_modules/**']`. `playwright.config.ts`: `testDir: 'e2e'`, `webServer: { command: 'npx next dev -p 3100', url: 'http://localhost:3100', reuseExistingServer: true }`, `use.baseURL` same, projects `desktop` (1440×900) and `mobile` (`devices['Pixel 7']`). The mobile project only runs `mobile.spec.ts` and the desktop project only runs `desktop.spec.ts`.
- [ ] **Step 3: Write failing test** `lib/site.test.ts`:
```ts
import * as site from './site';
test('site constants', () => {
  expect(site.BOOKING_URL).toBe('https://calendar.app.google/5HCocotfMXvcyh3V8');
  expect(site.BOOKING_EMBED_URL).toMatch(/^https:\/\/calendar\.google\.com\/calendar\/appointments\/schedules\/.+\?gv=true$/);
  expect(site.LINKEDIN_URL).toBe('https://www.linkedin.com/in/connormartinryan/');
  expect(site.MAILTO).toBe('mailto:hq2831@gmail.com?subject=Project%20Request');
  expect(site.DEMO_VIDEO_ID).toBeNull();
});
```
- [ ] **Step 4: Run** `npm test`. Expected: FAIL (module not found).
- [ ] **Step 5: Implement `lib/site.ts`** with the constants from Global Constraints.
- [ ] **Step 6: Theme.** In `globals.css`, keep `@import "tailwindcss"`. Add an `@theme` block with the palette tokens, `--font-sans: var(--font-plex-sans)`, `--font-mono: var(--font-plex-mono)`, `--shadow-hard`, `--shadow-hard-lg`. Set the body background to `paper` with the dot grid, text `ink`, `font-sans`. Remove the dark-mode block and Arial. Add a global `@media (prefers-reduced-motion: reduce)` rule that sets transition and animation durations to ~0. In `layout.tsx`, replace Geist with `IBM_Plex_Sans` (weights 400/600/700) and `IBM_Plex_Mono` (400/600) as variables `--font-plex-sans` / `--font-plex-mono`. Metadata default title `Kaizen Atelier — IT & data consulting`, `title.template: '%s — Kaizen Atelier'`, description as in Global Constraints. Leave the existing page in place for now.
- [ ] **Step 7: Verify.** `npm test` passes. `npm run build` succeeds.
- [ ] **Step 8: Commit** `chore: test tooling, washi theme tokens, Plex fonts, site constants`.

---

### Task 2: Window registry

**Files:**
- Create: `lib/windows.ts`, `lib/windows.test.ts`

**Interfaces:**
- Produces:
```ts
export type WindowId = 'welcome'|'services'|'work'|'process'|'about'|'pricing'|'contact'|'cv'|'notes'|'homelab'|'pipelines'|'demo'|'trash'|'notFound';
export type IconName = WindowId; // one glyph per window
export interface WindowDef {
  id: WindowId; title: string;            // window title bar text
  iconLabel: string;                      // label under desktop icon
  route: string;                          // '/' | '/services' ...
  side: 'left'|'right'|'none';            // desktop column; 'none' = no icon
  egg: boolean; indexed: boolean;
  description: string;                    // meta description
  size: { w: number; h: number };         // default desktop size, px
}
export const WINDOWS: readonly WindowDef[];
export function getWindow(id: WindowId): WindowDef;
export function windowForPath(pathname: string): WindowId;   // unknown -> 'notFound'
export function slugs(): string[];                            // routes minus '/', excl. notFound
export const LEGACY_HASHES: Record<string, WindowId>;         // about, process, services, contact
export const MENUS: { label: string; items: { label: string; id: WindowId; hash?: string }[] }[];
```
- Registry order/values (from spec §6.1/§6.3):
  - **Left:** services `/services` "Services"; work `/work` "Case studies"; process `/process` "How I work"; about `/about` "About me"; pricing `/pricing` "Pricing".
  - **Right:** contact `/contact` "Contact.exe"; cv `/cv` "CV.pdf"; notes `/notes` "Notes"; homelab `/homelab` "homelab_infra/" (egg); pipelines `/pipelines` "data_pipelines.exe" (egg); demo `/demo` "live_demo.mp4" (egg); trash `/trash` "Trash" (egg).
  - **No icon (`side: 'none'`):** welcome `/` (title `welcome.md`); notFound `/404` (title `404.txt`, not indexed).
  - Eggs have `indexed: false`.
  - **`MENUS`:**
    - Services ▾ = Automation & modernisation `#automation`, Data pipelines `#pipelines`, Analytics `#analytics`, Infrastructure `#infrastructure` (all id `services`).
    - Work ▾ = work, process, pricing.
    - About = about (single item, rendered as a plain button).
    - More ▾ = contact, cv, notes, trash, demo.

- [ ] **Step 1: Write failing tests** in `lib/windows.test.ts`:
  - `windowForPath('/')==='welcome'`, `('/services')==='services'`, `('/services/')==='services'` (trailing slash tolerated), `('/nope')==='notFound'`.
  - `slugs()` has length 12 and contains `'trash'` but not `'404'` or `''`.
  - The left-column ids in order equal `['services','work','process','about','pricing']`. The right-column ids in order equal `['contact','cv','notes','homelab','pipelines','demo','trash']`.
  - Every `egg` has `indexed===false`.
  - Every route is unique.
  - `LEGACY_HASHES` equals `{about:'about',process:'process',services:'services',contact:'contact'}`.
  - Every `MENUS` item id exists in `WINDOWS`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement** `lib/windows.ts`. Meta descriptions are one sentence each, drawn from that window's Appendix A copy.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: window registry and path helpers`.

---

### Task 3: Window state reducer

**Files:**
- Create: `lib/windowState.ts`, `lib/windowState.test.ts`

**Interfaces:**
- Consumes: `WindowId`, `getWindow` (Task 2).
- Produces:
```ts
export interface Pos { x: number; y: number }
export interface DeskState { open: WindowId[]; positions: Partial<Record<WindowId, Pos>>; maximized: WindowId[] }
export type DeskAction =
  | { type: 'open'; id: WindowId } | { type: 'close'; id: WindowId }
  | { type: 'focus'; id: WindowId } | { type: 'toggleMax'; id: WindowId }
  | { type: 'move'; id: WindowId; pos: Pos };
export function initialState(id: WindowId): DeskState;     // open=[id] with its default pos
export function reducer(s: DeskState, a: DeskAction): DeskState;
export function focused(s: DeskState): WindowId | null;     // last of open
export function cascadePos(index: number): Pos;             // welcome uses {x:140,y:32}; others {x:200+24*(index%8), y:48+24*(index%8)}
export function clampPosition(p: Pos, size: {w:number;h:number}, bounds: {w:number;h:number}): Pos;
```
- `open` order is the z-order (last = top).
- `open` on an id that is already open is the same as `focus`.
- `close` also removes the id from `maximized`.
- `cascadePos` index = current `open.length` at the moment of opening. The position is only assigned if none is stored, so a reopened window remembers where the user dragged it within the session.
- `clampPosition` keeps the title bar reachable: `x ∈ [80 - w, bounds.w - 80]`, `y ∈ [0, bounds.h - 34]`.

- [ ] **Step 1: Write failing tests** (`lib/windowState.test.ts`):
  - `initialState('services')` → `open` equals `['services']`, `focused` is `'services'`.
  - Open `about` then `services` again → `open` equals `['about','services']` with **no duplicate**. (Starting from `initialState('services')`, opening services moves it to the end.)
  - Focus moves an id to the end. Focusing a closed id is a no-op.
  - Close the focused window → `focused` is the previous one. Close the last window → `focused` is `null`.
  - `toggleMax` twice → not maximized. Close clears maximized.
  - `move` stores the position. Close then reopen keeps the stored position.
  - `clampPosition({x:-2000,y:-50},{w:500,h:400},{w:1024,h:562})` equals `{x:-420,y:0}`.
  - `clampPosition({x:5000,y:5000},…same)` equals `{x:944,y:528}`.
  - An in-range position is unchanged.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement** `lib/windowState.ts` as a pure reducer. Never mutate state.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: desktop window state reducer`.

---

### Task 4: Desktop shell, window frame, routing, URL sync

Content components are stubs here: a heading with the window title. Real content arrives in Tasks 7–9.

**Files:**
- Create:
  - `components/desktop/Desktop.tsx`, `WindowFrame.tsx`, `DesktopIcon.tsx`, `windowContent.tsx`, `useIsDesktop.ts`
  - `components/windows/*.tsx` (stubs, one per WindowId, each `export function XWindow()`)
  - `app/[slug]/page.tsx`, `app/not-found.tsx`
  - `components/desktop/WindowFrame.test.tsx`, `e2e/desktop.spec.ts`
- Modify: `app/layout.tsx` (render `<Desktop />` then `{children}` inside body), `app/page.tsx` (return `null`)

**Interfaces:**
- Consumes: Task 2, Task 3.
- Produces:
  - `useDesk(): { state: DeskState; open(id: WindowId, hash?: string): void; close(id): void; focus(id): void; toggleMax(id): void; move(id, pos): void }`. This is a React context exported from `Desktop.tsx`, used by MenuBar and window content (e.g. Welcome's buttons).
  - `<WindowFrame id={WindowId}>{children}</WindowFrame>`.
  - `<DesktopIcon id={WindowId} />`.
  - `WINDOW_CONTENT: Record<WindowId, React.ComponentType>`.
  - `useIsDesktop(): boolean`.

**Behaviour:**
- **Initial state:** `initialState(windowForPath(usePathname()))`. This makes the server-rendered HTML include that window.
- **URL sync:**
  - Whenever `focused` changes and its route ≠ the current pathname, call `history.pushState(null, '', route + (hash ?? ''))`. Use `/` when nothing is focused.
  - Whenever the pathname changes (back/forward) and ≠ the focused route, dispatch `open(windowForPath(pathname))`.
  - For `notFound`, never push `/404`. Leave the URL as is.
- **Legacy hashes:** on mount, if the pathname is `/` and `location.hash` matches `LEGACY_HASHES`, open that window and `history.replaceState` to its route.
- **WindowFrame:**
  - Absolute position from `state.positions` (clamped). z-index = index in `open` + 10. Size from the registry. Maximised fills the desk area.
  - Title bar has three dots: the first is a close button (`aria-label="Close {title}"`), the second is maximise (`aria-label="Maximise {title}"`), the third is decorative. The title is in mono.
  - Body `overflow:auto`.
  - Drag only by the title bar (framer `dragControls`, `dragListener={false}`, `dragMomentum={false}`) and only when `useIsDesktop()`. On drag end, dispatch `move` with the clamped position.
  - `onPointerDown` → focus.
  - `role="dialog"`, `aria-labelledby` the title.
  - When it becomes focused, move focus into the frame (`tabIndex={-1}`). On close, return focus to the matching icon (`data-icon={id}`) if one exists.
  - `Esc` while focus is inside → close.
  - Open/close animation: `AnimatePresence`, scale .96→1 + fade, ~180 ms. Skip the scale when `useReducedMotion()`.
- **Phone layout (CSS only, no JS branching in markup):**
  - Non-focused windows get `max-md:hidden`.
  - The focused window is `max-md:fixed max-md:inset-0`.
  - The welcome window is always `max-md:hidden`.
  - Closing on phone returns to `/`.
- **DesktopIcon:** a `<button data-icon={id}>` with glyph tile + label. A single click opens the window. Eggs get the dashed-border variant.
- **Desktop layout:** the left column renders `side==='left'` icons and the right column `side==='right'`, each in registry order. Then render all windows from `state.open`.
- **`app/[slug]/page.tsx`:** `generateStaticParams` returns `slugs()`. `export const dynamicParams = false`. `generateMetadata` returns `{ title, description, robots: indexed ? undefined : { index: false } }`. The page returns `null`.
- **`app/not-found.tsx`** returns `null`. The Desktop already shows the `notFound` window because `windowForPath` maps unknown paths to it.

- [ ] **Step 1: Write failing component tests** `WindowFrame.test.tsx`. Render `<Desktop/>` with `next/navigation`'s `usePathname` mocked to `'/services'`.
  - `getByRole('dialog', { name: 'Services' })` exists.
  - Clicking `getByRole('button', { name: 'Close Services' })` removes the dialog.
  - Pressing Escape inside the dialog removes it.
  - Clicking `getByRole('button', { name: /About me/ })` adds an `About me` dialog. Clicking the icon again leaves exactly one such dialog.
- [ ] **Step 2: Write failing e2e** `e2e/desktop.spec.ts`:
  - `GET /services` via `request` → status 200, body contains `Services — Kaizen Atelier` and `role="dialog"`.
  - `GET /definitely-not-a-page` → status 404. Visiting it shows a dialog named `404.txt`.
  - Visit `/`, click the `About me` icon → URL is `/about`. Click `Pricing` → `/pricing`. `page.goBack()` → URL `/about` and the About dialog is topmost (highest z-index). Close About → URL `/pricing`.
  - Visit `/#process` → URL becomes `/process` and the `How I work` dialog is visible.
- [ ] **Step 3: Run** `npm test` and `npm run test:e2e -- --project=desktop`. Expected: FAIL.
- [ ] **Step 4: Implement** the files above.
- [ ] **Step 5: Run** both. Expected: PASS. Also run `npm run build`: 12 static slug routes are generated and there are no hydration warnings in the browser console on `/services`.
- [ ] **Step 6: Commit** `feat: desktop shell, window manager, per-window routes`.

---

### Task 5: Menu bar, clock, workshop logo, favicon

**Files:**
- Create: `components/desktop/MenuBar.tsx`, `components/desktop/Clock.tsx`, `components/icons/WorkshopLogo.tsx`, `app/icon.svg`, `components/desktop/MenuBar.test.tsx`
- Modify: `components/desktop/Desktop.tsx` (render MenuBar above the desk area; desk area = viewport minus 38px)
- Delete: `app/favicon.ico`

**Interfaces:**
- Consumes: `useDesk()`, `MENUS`, `BOOKING_URL`.
- Produces: `<WorkshopLogo className?: string />` (inline SVG, `aria-hidden`), also used by `MobileHero` in Task 6.

**Behaviour:**
- **Layout:** the bar is 38px, `bg-surface`, bottom border ink. Left to right: logo mark + "Kaizen Atelier" (button → `open('welcome')`), menus, spacer, `<Clock/>`, **Book a call** link.
- **Menus:** groups with more than one item are disclosure buttons (`aria-expanded`) opening a list of buttons. Selecting an item calls `open(id, hash)` and closes the menu. `Esc` or an outside click also closes it. A single-item group ("About") renders as a plain button.
- **Clock:** renders an empty `<time>` on the server and `HH:MM` (locale) after mount, updating every 30 s.
- **Book a call:** `<a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">`, vermilion with a hard shadow.
- **Phone:** below `md`, hide the menus and clock, keeping logo + Book a call.
- **`WorkshopLogo`:** a small workshop/atelier building (pitched roof, door, a hanging tool or saw-tooth roofline) in 1.5px ink line, vermilion door or roof accent, indigo detail. 24×24 viewBox. It must read clearly at 20px.
- **`app/icon.svg`:** the same drawing at 32×32 on a `surface` rounded square.

- [ ] **Step 1: Write failing tests** `MenuBar.test.tsx` (inside the Desktop provider, pathname `/`):
  - Clicking `Services` (menu) then `Data pipelines` opens the Services dialog and calls `history.pushState` with `'/services#pipelines'` (spy on it).
  - `getByRole('link', { name: 'Book a call' })` has `href` equal to `BOOKING_URL` and `target="_blank"`.
  - The `Work` menu lists exactly `Case studies`, `How I work`, `Pricing`.
  - Escape closes an open menu.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Then `npm run dev` and check visually that the logo reads at menu-bar size and the favicon shows in the tab.
- [ ] **Step 5: Commit** `feat: menu bar, clock, workshop logo and favicon`.

---

### Task 6: Glyphs, sticky note, phone home-grid

**Files:**
- Create: `components/icons/Glyphs.tsx`, `components/desktop/StickyNote.tsx`, `components/desktop/MobileHero.tsx`, `e2e/mobile.spec.ts`
- Modify: `components/desktop/DesktopIcon.tsx` (use glyphs), `components/desktop/Desktop.tsx` (grid + hero on phone, sticky note), `e2e/desktop.spec.ts`

**Interfaces:**
- Consumes: `IconName`, `WINDOWS`, `useDesk()`, `WorkshopLogo`.
- Produces: `<Glyph name={IconName} className? />`.

**Behaviour:**
- **Glyphs:** one SVG per window in a consistent 1.5px ink-line style with a single vermilion or indigo accent, drawn inside a 52px `surface` tile with ink border and `shadow-hard`. Eggs use a dashed border and no shadow. Subjects:
  - services: wrench
  - work: folder
  - process: map/route
  - about: person
  - pricing: receipt
  - contact: envelope
  - cv: page
  - notes: notepad
  - homelab: server rack
  - pipelines: pipe elbow
  - demo: film/play
  - trash: bin
  - welcome/notFound: not shown
- **Sticky note:** only when the initial pathname is `/` and only at `md+`. Text: "Drag the windows around. Dashed icons are… not important. Probably." `bg-note`, rotated −2deg, hard shadow, dismiss × button. It is not persisted.
- **Phone (< md):**
  - The two icon columns collapse into one 4-column grid (left items, then right items).
  - `MobileHero` sits above the grid. It contains the welcome pill, headline and Book a call, using Welcome copy from Appendix A.
  - The hero is `md:hidden` and the desktop columns are `max-md:` re-flowed. Use one icon list in the DOM, not two.
- **Phone window header:** the focused window shows full-screen with a "← Back" button (`aria-label="Back to home"`) instead of the dots. It calls `close(id)`.

- [ ] **Step 1: Write failing e2e** `e2e/mobile.spec.ts` (Pixel 7):
  - Visit `/` → `Book a call` is visible and 12 icon buttons are visible in the grid. No dialog is visible.
  - Tap `Pricing` → the Pricing dialog fills the viewport (bounding box ≈ viewport) and the URL is `/pricing`.
  - Tap `Back to home` → URL `/` and the grid is visible.
- [ ] **Step 2: Add to `e2e/desktop.spec.ts`:** at viewport 1024×600, open `/about` and drag its title bar to (−3000, −3000). The title bar's bounding box must stay within the viewport, at least partially (x + width > 80, y ≥ 38).
- [ ] **Step 3: Run** `npm run test:e2e`. Expected: FAIL.
- [ ] **Step 4: Implement.**
- [ ] **Step 5: Run** `npm run test:e2e` and `npm test`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: icon glyphs, sticky note, phone home-grid`.

---

### Task 7: Core content windows

**Files:**
- Modify: `components/windows/WelcomeWindow.tsx`, `ServicesWindow.tsx`, `WorkWindow.tsx`, `ProcessWindow.tsx`, `AboutWindow.tsx`, `PricingWindow.tsx`
- Create: `components/windows/ServicesWindow.test.tsx`, `components/windows/ui.tsx` (shared `Pill`, `Button` (variant `primary|default`, renders `<a>` or `<button>`), `FinePrint`, `EmptyFolder`)

**Interfaces:**
- Consumes: `useDesk()`, `BOOKING_URL`, `LINKEDIN_URL`.
- Produces: the `ui.tsx` primitives, reused in Tasks 8–9.

**Behaviour (copy exactly from spec Appendix A):**
- **Welcome:** pill, headline (second line in vermilion), body, buttons. "Book a free chat" opens `BOOKING_URL` in a new tab. "See what I do" calls `open('services')`. Then the fine print. The pill shows just "IT & data consulting" (no city yet).
- **Services:**
  - Title, intro, 2×2 cards with ids `automation`, `pipelines`, `analytics`, `infrastructure`, then the CTA line.
  - On mount and on `hashchange`, if `location.hash` matches a card id, scroll it into view and apply a highlight (vermilion border + `bg-note`) for ~2 s. Set `data-highlighted="true"` while highlighted.
- **Work:** `EmptyFolder` showing `0 items`, the body copy, and a Book a call button. The component takes `items: CaseStudy[]` from a `const CASE_STUDIES: CaseStudy[] = []` in the same file (`type CaseStudy = { title: string; summary: string; href?: string }`) and renders file tiles when the array is non-empty.
- **Process:** title, then steps 01–03 as a numbered list. Step numbers are in mono and vermilion.
- **About:**
  - Title "Hi, I'm Connor".
  - Body with the bracketed sentence omitted.
  - "My homelab is fine. Don't check." as its own line.
  - A "More on LinkedIn →" link (`target="_blank"`).
  - A photo slot: a dashed ink-bordered square labelled "photo loading… (eventually)".
- **Pricing:** title, big line "It depends. (Genuinely.)", body, three bullets, CTA + fine print.

- [ ] **Step 1: Write failing test** `ServicesWindow.test.tsx`:
  - Set `window.location.hash = '#analytics'`, render `ServicesWindow` inside the provider → the element `#analytics` has `data-highlighted="true"`.
  - `scrollIntoView` (mocked on `Element.prototype`) is called.
- [ ] **Step 2: Write failing test** (same file or `content.test.tsx`): render each of the six windows. `document.body.textContent` must not match `/\[[^\]]+\]/`, so no brackets leak.
- [ ] **Step 3: Run** `npm test`. Expected: FAIL.
- [ ] **Step 4: Implement.**
- [ ] **Step 5: Run** `npm test`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: welcome, services, work, process, about, pricing windows`.

---

### Task 8: Contact, CV, Notes windows

**Files:**
- Modify: `components/windows/ContactWindow.tsx`, `CvWindow.tsx`, `NotesWindow.tsx`
- Create: `components/windows/ContactWindow.test.tsx`

**Interfaces:**
- Consumes: `ui.tsx`, `BOOKING_URL`, `BOOKING_EMBED_URL`, `MAILTO`, `EMAIL`, `LINKEDIN_URL`.

**Behaviour:**
- **Contact.exe:**
  - Shows the title and body copy, then a row with **Book a call** (new tab), the email (`MAILTO`) and LinkedIn, then the fine print.
  - Below that, an `<iframe title="Book a call with Connor" src={BOOKING_EMBED_URL} loading="lazy">` at full width, ~600px tall.
  - Only render the iframe at `md+` (`useIsDesktop()`). On phones, the button is enough.
  - Under the iframe: "Calendar not loading? Open it in a new tab →" linking to `BOOKING_URL`.
  - Registry size for contact is roughly `{w: 720, h: 640}`. Adjust in `lib/windows.ts` if needed.
- **CV.pdf:** "CV.pdf is still compiling…" + "In the meantime, LinkedIn has the receipts." + **View on LinkedIn** (primary, new tab) + Book a call.
- **Notes:** `Drafts: 14. Published: 0.` + subline. The structure mirrors Work, with `const NOTES: Note[] = []`.

- [ ] **Step 1: Write failing tests:**
  - With `useIsDesktop` mocked to `true`, Contact renders an iframe whose `src` is `BOOKING_EMBED_URL` and a link with `href` `MAILTO`.
  - With it mocked to `false`, there is no iframe.
  - CV renders a link named `View on LinkedIn` with `href` `LINKEDIN_URL`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Then check in `npm run dev` that the Google calendar actually renders inside the Contact window. If it doesn't (Google changed framing policy), remove the iframe and keep the button, and note it in the commit message.
- [ ] **Step 5: Commit** `feat: contact, cv, notes windows`.

---

### Task 9: Easter eggs

**Files:**
- Modify: `components/windows/HomelabWindow.tsx`, `PipelinesWindow.tsx`, `DemoWindow.tsx`, `TrashWindow.tsx`, `NotFoundWindow.tsx`, `lib/site.ts` (`SPAGHETTI`)
- Create: `public/eggs/spaghetti.jpg`, `components/windows/eggs.test.tsx`

**Behaviour:**
- **Homelab:**
  - Find a spaghetti photo on Wikimedia Commons under CC0, CC BY or CC BY-SA. Download a ≤1200px-wide version to `public/eggs/spaghetti.jpg` and fill `SPAGHETTI` with alt, credit (author), license and source URL.
  - The window shows the image via `next/image`, the caption "fig. 1 — current network topology.", the footer "Further reading: Spaghetti — Wikipedia" (`https://en.wikipedia.org/wiki/Spaghetti`, new tab), and the line `Photo: {credit}, {license}` linking to `sourceUrl`.
- **Pipelines:**
  - Title bar `data_pipelines.exe — running`.
  - An original pixel-art scene made of inline SVG `<rect>` grid cells (no images): two green warp-style pipes, a pipe labelled "ETL" dripping (CSS keyframe drip, disabled under reduced motion), and two generic moustached plumbers in **indigo and vermilion** overalls. No caps with letters, no red/green Mario/Luigi colour pairing, no names.
  - Caption: "Two certified pipeline engineers inspecting your ETL."
- **Demo:**
  - If `DEMO_VIDEO_ID` is null, show a 16:9 ink-bordered box with a looping spinner and "buffering… (forever)", plus the caption "Live demos never fail. This is a recording."
  - Otherwise, show `<iframe src={"https://www.youtube-nocookie.com/embed/" + id} title="Live demo" allowFullScreen>` at 16:9.
- **Trash:**
  - A list of three file buttons: `synergy.pptx`, `blockchain_strategy_2021.docx`, `just_use_excel.xlsx`.
  - Clicking one reveals its quip inline below the list (spec Appendix A).
  - Add an "Empty trash" button that shows "Permission denied. Some things are forever."
- **NotFound (`404.txt`):** "This file doesn't exist. Like my weekends." + a "Back to desktop" link (`href="/"`).

- [ ] **Step 1: Write failing tests** `eggs.test.tsx`:
  - Trash: clicking `just_use_excel.xlsx` shows the text "Restored 47 times.".
  - Demo with `DEMO_VIDEO_ID` null shows "buffering… (forever)" and no iframe.
  - Homelab has an `img` with non-empty alt and a link to `https://en.wikipedia.org/wiki/Spaghetti`.
  - NotFound has a link `Back to desktop` with `href="/"`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS. Look at the pipelines scene in the browser and confirm it reads as "plumbers + pipes" without resembling Nintendo sprites.
- [ ] **Step 5: Commit** `feat: easter egg windows`.

---

### Task 10: Cleanup, metadata, accessibility pass, final verification

**Files:**
- Delete: `components/Hero.tsx`, `components/NavBar.tsx`, `components/ScrollSection.tsx`, `components/Services.tsx`, `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- Modify: `README.md` (replace the create-next-app text with: what the site is, `npm run dev`, `npm test`, `npm run test:e2e`, and "how to add a window: one entry in `lib/windows.ts` + a component in `components/windows/` + a line in `windowContent.tsx`"), `e2e/desktop.spec.ts`

- [ ] **Step 1: Add e2e assertions** to `e2e/desktop.spec.ts`:
  - For each indexed slug, a `request` GET returns 200 and `<title>` matches `{Title} — Kaizen Atelier`.
  - `/trash` HTML contains `noindex`.
  - Keyboard: on `/`, Tab reaches the `Services` icon button, Enter opens the Services dialog, focus is inside it, and Escape closes it with focus back on the `Services` icon.
- [ ] **Step 2: Run** `npm run test:e2e`. Expected: FAIL on whatever is missing. Fix it.
- [ ] **Step 3: Delete the old files.** `grep -r "ScrollSection\|NavBar\|components/Hero\|components/Services" app components` must return nothing.
- [ ] **Step 4: Contrast check.** White bold text on `#D9472B` is ~4.0:1, which passes AA for large/bold UI text only. Ensure button labels are ≥ 14px bold. If any vermilion text sits on `paper`/`surface` at body size, use `#B8361D` for that text instead (add token `vermilion-ink`).
- [ ] **Step 5: Final verification**, all must pass: `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. Then manually in `npm run start`:
  - Drag, stack and maximise windows at 1440×900 and 1024×600.
  - Check the phone grid in device emulation.
  - Check reduced motion (DevTools → Rendering → emulate) gives instant open/close.
  - Confirm no `[` bracket text is visible anywhere.
- [ ] **Step 6: Commit** `chore: remove old landing page, README, a11y and metadata checks`.
