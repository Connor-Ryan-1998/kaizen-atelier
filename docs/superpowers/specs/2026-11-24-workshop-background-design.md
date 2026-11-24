# Workshop illustration on the desktop background — short design

Date: 2026-11-24 · Size: small change · Status: approved

## Intent
Give the desktop some warmth and personality, in the spirit of PostHog's illustrated backgrounds: a little
Japanese workshop full of craftspeople, sitting behind the icons and windows. It is decoration that tells
the "atelier" story at a glance. It is not navigation.

## What was decided (by Connor)
- Use the **flat cutaway** draft (`.superpowers/workshop/workshop-draft.svg`), not the isometric one.
- Hand-coded SVG in the site palette; no image service, no Three.js.
- **Not shown on small screens** (phones keep the home-screen grid as-is).

## Goals
- Visible on the desktop layout, bottom-centre of the desk area, behind windows and icons.
- Matches the site: palette tokens, ink outlines, same scene and gags as the draft (tea break, designer,
  carpenter, spaghetti server rack with sleeping cat, leaky pipe plumbers, lanterns, bonsai).
- Subtle CSS animation (steam, drips, LEDs, lanterns, cat tail, plane); none with reduced motion.

## Non-goals
- Clicking or hovering parts of the scene (could be a later easter egg).
- The isometric version, parallax, day/night or dark-mode variants.

## Anti-goals (failure even if it "works")
- It blocks clicks or drags on icons, windows or the desk.
- It noticeably slows first load or shifts layout.
- It moves for visitors who asked for reduced motion.
- It reads as clutter on a cramped laptop screen.

## Approaches considered
1. **Static file in `public/` shown with `<img>` (recommended, my call).** Cached once across all pages,
   keeps ~20KB out of every server-rendered HTML response, CSS animations inside the SVG still run.
   Trade-off: parts of the scene can't be made interactive later without switching approach.
2. **Inline React component.** Lets parts become clickable later, but adds ~20KB to the HTML of every
   route, since `<Desktop>` lives in the root layout.
3. **CSS `background-image` on the desk.** Same caching as 1, but harder to size and position relative to
   the icon columns, and no alt/`aria-hidden` control.

## How it works (builder's guide)
- Asset: copy the flat draft to `public/desk/workshop.svg` as-is (already includes the
  reduced-motion media query and the separated chimney puffs).
- Render inside the desk area in `components/desktop/Desktop.tsx`, before the icon nav, as a decorative
  `<img alt="" aria-hidden>` with `pointer-events: none`, `select-none`, `draggable={false}`, z-index
  below icons, windows and the sticky note.
- Position: absolutely positioned, bottom of the desk, horizontally centred, width `min(820px, 70%)`,
  fixed aspect (1000×500) so there is no layout shift.
- Visibility (my call): shown only when the viewport is **≥ 1024px wide and ≥ 640px tall**; hidden below
  that via CSS (`hidden` + a min-width/min-height media query), so phones, tablets in portrait and very short
  laptop windows don't get it. The mobile home grid is untouched.
- Loading: `loading="eager"` is unnecessary; use `decoding="async"`, and plain `<img>` (not `next/image`,
  which adds nothing for an SVG).

## Tests
- e2e desktop (1440×900): the illustration is visible, sits behind the welcome window (lower z-index),
  and clicking an icon over/near it still opens its window.
- e2e mobile (Pixel 7): the illustration is not visible.
- e2e small desktop (1000×700 and 1280×600): not visible.
- e2e: `/desk/workshop.svg` responds 200 with an SVG content type.
- Existing suites stay green (lint, unit, build, e2e).

## Left to the builder
- Exact z-index values and Tailwind class spelling.
- Whether the sticky note nudges position to avoid covering the bonsai (cosmetic).
