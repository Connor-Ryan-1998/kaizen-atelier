# Workshop Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the flat workshop illustration behind the desktop icons and windows on roomy screens only.

**Architecture:** The hand-coded SVG ships as a static file in `public/desk/` and renders as a decorative `<img>` inside the desk area of `<Desktop>`. A Tailwind custom variant `roomy` (≥1024px wide and ≥640px tall) controls visibility. Animations and the reduced-motion switch live inside the SVG.

**Tech Stack:** Next.js 16.4 App Router, React 19, Tailwind 4, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-24-workshop-background-design.md`

## Global Constraints

- Asset: `.superpowers/workshop/workshop-draft.svg`, copied unchanged to `public/desk/workshop.svg` (viewBox `0 0 1000 500`).
- Visible only at viewport ≥ 1024px wide **and** ≥ 640px tall; hidden otherwise (including all phones).
- Decorative: `alt=""`, `aria-hidden`, `pointer-events: none`, not draggable, not selectable.
- Sits below icons, windows and the sticky note; must never intercept clicks.
- Size: width `min(820px, 70%)`, bottom-centred in the desk area, `aspect-ratio: 2 / 1` (no layout shift).
- Plain `<img>` with `decoding="async"`; no `next/image`.

## Review Focus

1. Clicking an icon or window that visually overlaps the illustration still works (pointer-events).
2. Exactly 1024×640 shows it; 1023 wide or 639 tall hides it (boundary of the media query).
3. Resizing the browser across the threshold shows or hides it without a reload (CSS-only, no JS state).
4. Dragging a window over it doesn't select or drag the image (ghost-image drag).
5. Reduced-motion visitors see no animation (media query inside the SVG; covered by the asset itself).

---

### Task 1: Workshop illustration on the desk

**Files:**
- Create: `public/desk/workshop.svg` (copy of the draft)
- Create: `components/desktop/WorkshopScene.tsx`
- Create: `components/desktop/WorkshopScene.test.tsx`
- Modify: `app/globals.css` (add `@custom-variant roomy`)
- Modify: `components/desktop/Desktop.tsx` (render `<WorkshopScene />` first inside the desk `div`, before `<MobileHero />`)
- Modify: `e2e/desktop.spec.ts`, `e2e/mobile.spec.ts`

**Interfaces:**
- Produces: `export function WorkshopScene(): JSX.Element` — renders `<img data-workshop src="/desk/workshop.svg" ...>`.

- [ ] **Step 1: Write failing unit test** `WorkshopScene.test.tsx`
  - `renders a decorative, non-interactive image`: `container.querySelector("img[data-workshop]")` has `src="/desk/workshop.svg"`, `alt=""`, `aria-hidden="true"`, `draggable="false"`, and its class list contains `pointer-events-none`, `hidden`, `roomy:block`.
  - `is not exposed to assistive tech`: `screen.queryByRole("img")` is `null`.

- [ ] **Step 2: Write failing e2e tests**
  - desktop.spec.ts `workshop illustration shows on roomy screens, behind the welcome window`: at 1440×900 on `/`, `img[data-workshop]` is visible; its computed z-index is lower than the welcome dialog's; `request.get("/desk/workshop.svg")` is 200 with `content-type` containing `image/svg+xml`.
  - desktop.spec.ts `icons over the illustration stay clickable`: at 1024×640, `page.locator('[data-icon="pricing"]').click()` opens the "Pricing" dialog, and `elementFromPoint` at the image's centre is not the image.
  - desktop.spec.ts `illustration hidden when the window is too small` (table): 1023×800, 1280×639 → `img[data-workshop]` not visible; then `setViewportSize(1024, 640)` → visible (no reload).
  - mobile.spec.ts `no workshop illustration on phones`: `img[data-workshop]` not visible.

- [ ] **Step 3: Run tests, confirm RED** — `npm test` fails (module missing); `npx playwright test` fails the 4 new tests.

- [ ] **Step 4: Implement**
  - `app/globals.css`: `@custom-variant roomy (@media (min-width: 1024px) and (min-height: 640px));`
  - Copy the SVG; write `WorkshopScene` with classes for absolute bottom-centre placement, `w-[min(820px,70%)] aspect-[2/1]`, `z-0`, `pointer-events-none select-none`, `hidden roomy:block`.
  - Render it first inside the desk `div` in `Desktop.tsx`.

- [ ] **Step 5: Run tests, confirm GREEN** — `npm run lint`, `npm test`, `npx playwright test` all pass.

- [ ] **Step 6: Visual check** — screenshot `/` at 1440×900 and 1024×640, and `/services` with a window over the scene; compare with `.superpowers/workshop/desk-1440.png`.

- [ ] **Step 7: Commit** — `feat: workshop illustration on the desktop background`
