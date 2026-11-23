# Kaizen Atelier — Desktop Redesign

**Date:** 2026-11-23
**Status:** Draft for review
**Owner:** Connor Ryan

## 1. Intent

Kaizen Atelier is Connor's IT & data consultancy and doubles as their portfolio. The current site is a generic dark/indigo SaaS landing page. Connor wants it rebuilt in the spirit of [posthog.com](https://posthog.com): an **interactive desktop** — menu bar, desktop icons, draggable windows — with a **warm, cheeky, retro look and voice**.

Why: the site should feel like *them* and be memorable, while still letting a prospective client find services, process, and a way to book a call in seconds. The design borrows PostHog's *feel*, not its assets.

**Success looks like:** a visitor from LinkedIn or Google understands what Connor does and can book a call without discovering anything clever; a curious visitor pokes around, finds the easter eggs, and remembers the site.

## 2. Goals, non-goals, anti-goals

**Goals**
- Desktop metaphor on wide screens: menu bar + icons on left and right + draggable windows.
- Icons are the primary navigation. Every important page is reachable from an icon.
- Easter eggs as a bonus layer, never required.
- Home-screen grid on phones, each page opening full-screen.
- Every window has its own URL, server-rendered, indexable, shareable.
- Full copy rewrite in the new voice (draft in Appendix A, Connor edits).
- Washi paper / vermilion / indigo palette.

**Non-goals (v1)**
- Window resizing, minimising, or a taskbar of open windows.
- Persisting window layout between visits.
- A CMS. Content lives in code.
- Real case studies or blog posts (both launch empty).
- Analytics, contact forms, dark mode.

**Anti-goals (failure even if it works)**
- A visitor can't find Services or Book a call within a few seconds.
- It looks like a PostHog clone: no hedgehogs, no PostHog illustrations, no copied layouts or copy.
- Using third-party characters/IP (e.g. Nintendo's Mario & Luigi).
- Unusable on mobile or by keyboard.
- Content invisible to search engines because it only exists after client-side clicks.

## 3. Constraints

- Keep the existing stack: Next.js 16 (App Router), React 19, Tailwind 4, framer-motion, lucide-react, clsx, tailwind-merge. No new UI frameworks.
- Booking link: `https://calendar.app.google/5HCocotfMXvcyh3V8` (Google Calendar appointment schedule).
- Contact email: `hq2831@gmail.com` (current site).
- Hosting: **Vercel** (full Next.js features available: SSR, dynamic metadata, redirects, `next/image`).
- LinkedIn (stand-in for CV/About details until Connor supplies them): `https://www.linkedin.com/in/connormartinryan/`
- Launch: ships with tidy placeholders; Connor fills About, city, photo and CV later. No raw `[bracket]` text visible on the live site — use neutral placeholder copy or omit the line.
- Original art only. Spaghetti photo must be free-licensed (e.g. Wikimedia Commons) with attribution.

## 4. Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | Rebuild on current Next.js + Tailwind + framer-motion with a home-made window manager; one route per window. | Most custom code, but no new deps, full control of look, real URLs + SEO. |
| B | Same stack + retro desktop lib (react95 / 98.css / react-rnd). | Free resize/edge cases, but imposes Win95 look we'd fight; no help with routing. |
| C | Plain HTML/JS like the mockup. | Fastest to show; loses Next, per-window URLs, SEO; painful to grow. |

Connor picked **A** because it is the only option giving custom look, shareable links, and search visibility together.

## 5. Visual design

Reference mockup: `.superpowers/brainstorm/*/content/desktop-v1.html`, palette **B**.

**Palette (tokens in Tailwind `@theme`)**
| Token | Value | Use |
|---|---|---|
| `paper` | `#F2EBDD` | desktop background, with faint indigo dot grid (`rgba(44,62,99,.06)`, 18px) |
| `surface` | `#FBF7EF` | windows, menu bar, icon tiles |
| `ink` | `#1E1B18` | text, all borders, hard shadows |
| `muted` | `#6E655A` | secondary text |
| `vermilion` | `#D9472B` | primary buttons, accents, highlighted headline words |
| `indigo` | `#2C3E63` | secondary accents, links |
| `note` | `#FFF3A8` | sticky notes |

*Builder may nudge `indigo` toward the logo's navy if they clash side by side.*

**Shape language:** 1.5px `ink` borders; hard offset shadows (3px on small elements, 6px on windows), no blur; 6–10px radii; no gradients or glassmorphism.

**Typography (my call):** IBM Plex Sans (UI/body) + IBM Plex Mono (filenames, labels, code-ish bits) via `next/font`. Remove the `font-family: Arial` override in `globals.css`. Headlines tight tracking (`-0.03em`), heavy weight.

**Logo mark (Connor's request):** a new small SVG of a workshop (e.g. a little atelier building/workbench with tools), drawn in the same ink-line style with vermilion/indigo accents, legible at ~20–24px. Used in the menu bar; also use it for the favicon. `public/logo.jpg` stays in the repo but is not used in the menu bar.

**Icons:** custom SVG glyphs in a consistent ink-line style inside bordered tiles (no emoji in production). Easter-egg icons use a dashed border and no shadow so they read as "extra".

**Motion:** windows scale/fade in from their icon (~150–200 ms); drag via framer-motion. Respect `prefers-reduced-motion` (no scale, instant open). Drop the current scroll-progress bar.

## 6. Layout & behaviour

### 6.1 Desktop (≥ 768px — my call)

**Menu bar (top, full width, 38px):** logo (new small **workshop** SVG icon + "Kaizen Atelier") · menus `Services ▾` · `Work ▾` · `About` · `More ▾` · spacer · live clock · **Book a call** (vermilion button).
Menus are drop-downs whose items open windows (my call on contents):
- `Services ▾` — the four services; each opens the Services window scrolled to and highlighting that card (`/services#automation`, `#pipelines`, `#analytics`, `#infrastructure`). No separate per-service windows in v1.
- `Work ▾` — Case studies, How I work, Pricing.
- `About` — plain menu item, opens About me.
- `More ▾` — Contact, CV, Notes, plus Trash and `live_demo.mp4` for people who explore menus.

**Left icon column — the hiring path:**
1. Services
2. Case studies
3. How I work
4. About me
5. Pricing

**Right icon column — act or explore:**
1. Contact.exe
2. CV.pdf
3. Notes
4. `homelab_infra/` *(egg)*
5. `data_pipelines.exe` *(egg)*
6. `live_demo.mp4` *(egg)*
7. Trash *(egg)*

**Windows**
- Title bar: three dots (close · maximise · decorative), title in mono, drag handle.
- Multiple windows may be open; clicking focuses and raises. New windows cascade (offset ~24px) from a sensible default position and stay within the viewport while dragging.
- `Esc` closes the focused window. Maximise fills the desktop area below the menu bar.
- On first visit to `/`, the **Welcome** window is open plus a sticky note: "Drag the windows around. Dashed icons are… not important. Probably."

### 6.2 Phone (< 768px)

- Menu bar collapses to logo + Book a call.
- Icons become a home-screen grid (4 columns), same order: left column items first, then right column items, eggs included.
- Tapping opens the window **full-screen** with a title bar and a back/close control. No dragging.
- Welcome content shows above the grid as a compact hero card (not a window).

### 6.3 URLs & routing

Each window has a route. Loading a route directly renders the desktop with that window open and focused, and its content present in the server-rendered HTML.

| Window | Route | Indexed |
|---|---|---|
| Welcome | `/` | yes |
| Services | `/services` | yes |
| Case studies | `/work` | yes |
| How I work | `/process` | yes |
| About me | `/about` | yes |
| Pricing | `/pricing` | yes |
| Contact | `/contact` | yes |
| CV | `/cv` | yes |
| Notes | `/notes` | yes |
| Homelab | `/homelab` | builder's call |
| Data pipelines | `/pipelines` | builder's call |
| Live demo | `/demo` | builder's call |
| Trash | `/trash` | builder's call |

- URL reflects the **focused** window; opening/focusing updates it without a full reload or remounting the desktop. Closing the last window returns to `/`. Browser back/forward should move between previously focused windows.
- Each route has its own `<title>` and meta description.
- Old anchors (`#about`, `#process`, `#services`, `#contact`) should land on the matching window — builder's call on mechanism.

### 6.4 Accessibility

- Icons and menu items are real buttons/links, keyboard focusable, visible focus ring.
- Windows are labelled regions/dialogs; focus moves into a window on open and returns to its icon on close.
- Colour contrast AA for text on `paper`/`surface`; vermilion buttons use white bold text (check contrast; darken vermilion slightly if needed).

## 7. Window contents

Copy drafts are in Appendix A. Structural notes:

- **Services:** 2×2 cards — Automation & modernisation, Data pipelines, Analytics, Infrastructure — plus CTA.
- **Case studies (`/work`):** a folder view that is deliberately empty: "0 items" with a joke and a Book a call button. Structure must make adding case studies later easy (a typed array of entries rendered as file icons).
- **How I work:** three steps (Audit → Blueprint → Iterate) as a numbered list or tiny timeline.
- **About me:** short bio + photo slot (placeholder until Connor supplies one) + "More on LinkedIn" link.
- **Pricing:** no numbers yet. "It depends (genuinely)" framing, what drives price, CTA. Structure ready for tiers later.
- **Contact.exe:** Book a call button, email link, what happens after booking. Try embedding the Google appointment page in the window; if Google blocks framing, fall back to opening the link in a new tab.
- **CV.pdf:** until Connor supplies a PDF, the window shows a short placeholder and a prominent "View my experience on LinkedIn" button; later embed or link the PDF from `public/`.
- **Notes:** empty state ("Drafts: 14. Published: 0.") — same "add later" structure as case studies.
- **Book a call** (menu bar + CTAs everywhere): opens booking link in a new tab.

### Easter eggs
- **`homelab_infra/`** — free-licensed spaghetti photo captioned "fig. 1 — current network topology", link to Wikipedia "Spaghetti", attribution line.
- **`data_pipelines.exe`** — original pixel-art scene: green warp-style pipes and two unnamed moustached plumbers, maybe a pipe labelled "ETL" leaking. **No Nintendo characters, names, or sprites** (my call; Connor didn't object). Simple CSS/SVG pixel art is fine.
- **`live_demo.mp4`** — YouTube embed from a single config constant. Until set: "buffering… (forever)" placeholder.
- **Trash** — a few joke "deleted" files (e.g. `synergy.pptx`, `blockchain_strategy_2021.docx`, `just_use_excel.xlsx`), each opening a one-line quip. Builder may refine the jokes.

## 8. Code structure (decided vs. left to builder)

**Decided**
- Content (copy, window registry: id, title, route, icon, side, isEgg, component) lives in one typed module so adding a window is one entry.
- A small window-manager state (open windows, z-order, positions, focused, maximised) via React context/reducer — no state library.
- framer-motion for drag and open/close animation.
- Remove `components/ScrollSection.tsx`, `components/Hero.tsx`, the current `NavBar.tsx`/`Services.tsx` once replaced, and the unused Next boilerplate SVGs in `public/`.
- Fix existing copy typos by virtue of the rewrite.

**Left to builder**
- Exact App Router mechanics for per-window routes without remounting (e.g. shared layout + route pages, `[slug]` segment, parallel/intercepting routes).
- Default window sizes/positions, cascade offsets.
- Icon artwork details, pixel-art execution.
- Testing approach (no test setup exists today). At minimum: `npm run lint` and `npm run build` pass; manual check of desktop + phone + keyboard; optional Playwright smoke tests for "route opens window" and "icon opens window".

---

## Appendix A — Copy draft (Connor to edit)

Voice: dry, self-aware, a little funny, always competent. Short sentences. Jokes in the margins, substance in the middle. Anything in `[brackets]` needs Connor's facts.

### Welcome (`/`)
- Pill: `IT & data consulting · [City/Country — until supplied, just "IT & data consulting"]`
- **Headline:** Your business is weird. *Your systems should be too.*
- **Body:** Not a 20-year-old legacy system held together by one guy named Steve. Not a seven-figure ERP you'll regret by Q3. I learn how your business *actually* runs, then build the data, automation and infrastructure that fits it.
- Buttons: **Book a free chat** · See what I do
- Fine print: *Free chats are actually free. No "discovery workshop" invoice later.*

### Services (`/services`)
- **Title:** Things I'm suspiciously good at
- **Intro:** Four disciplines that compound. Most clients start with one and end up with all four. I'm not saying that's the plan. I'm not *not* saying it.
- **Automation & modernisation** — Kill the copy-paste. I replace manual, error-prone busywork with workflows that run while you sleep.
- **Data pipelines** — Your data, from wherever it hides, to wherever it's useful. Reliably, on schedule, with alerts before anyone notices.
- **Analytics** — Dashboards people actually open. Metrics tied to decisions, not vanity.
- **Infrastructure** — Cloud, hybrid or the cupboard under the stairs. Secure, documented, and not quietly costing you a fortune.
- CTA: **Book a call** — *"Which one do I need?" is a great first question.*

### Case studies (`/work`)
- Folder header: `0 items`
- **Body:** The NDAs are winning. Real case studies are on the way. In the meantime, ask me on a call — I can tell you what I've built, just not who for.
- CTA: **Book a call**

### How I work (`/process`)
- **Title:** The process (no, there isn't a 90-slide deck)
- **01 — Audit:** I dig into how work actually flows today: the tools, the spreadsheets, the workarounds nobody admits to. You get a plain-English map of where time and money leak.
- **02 — Blueprint:** We agree a roadmap sized to your business and budget. Small wins first, big bets only when they earn it.
- **03 — Iterate:** I build in short cycles, ship often, and leave you with documentation and systems your team can run without me. That's the *kaizen* bit: keep improving, a little at a time.

### About me (`/about`)
- **Title:** Hi, I'm Connor
- **Body:** [1–2 sentences: background, years, industries — until supplied, omit this sentence]. I started Kaizen Atelier because too many good businesses are stuck choosing between brittle legacy systems and overpriced "solutions". It isn't a binary. *Kaizen* means continuous improvement; an *atelier* is a workshop where things are made by hand. That's the whole pitch.
- Off the clock: [hobbies — until supplied, use just the next sentence]. My homelab is fine. Don't check.
- Link: **More on LinkedIn →**
- Photo: [placeholder]

### Pricing (`/pricing`)
- **Title:** Pricing
- **Big line:** It depends. *(Genuinely.)*
- **Body:** Every business is different, so every engagement is too. What moves the number: how much needs building, how messy the starting point is, and whether you want me on call afterwards.
- Bullets: Fixed-price audits · Project quotes up front · Ongoing support by the month
- CTA: **Book a free chat** — *I'll give you a real number, not a "starting from".*

### Contact.exe (`/contact`)
- **Title:** Contact.exe
- **Body:** The fastest way is to grab 30 minutes on my calendar. You talk, I listen, and you leave with at least one useful idea, even if we never work together.
- **Book a call** · or email `hq2831@gmail.com` · or find me on [LinkedIn](https://www.linkedin.com/in/connormartinryan/)
- Fine print: *Replies usually within one business day. Faster if the subject line includes "spaghetti".*

### CV.pdf (`/cv`)
- Placeholder: `CV.pdf is still compiling…` In the meantime, LinkedIn has the receipts. · **View on LinkedIn** · Book a call

### Notes (`/notes`)
- `Drafts: 14. Published: 0.` — Writing about data, automation and homelabs. Coming soon, allegedly.

### Easter eggs
- **homelab_infra/** — Caption: *fig. 1 — current network topology.* Footer: "Further reading: [Spaghetti — Wikipedia](https://en.wikipedia.org/wiki/Spaghetti)". Image attribution line.
- **data_pipelines.exe** — Title bar: `data_pipelines.exe — running`. Caption: *Two certified pipeline engineers inspecting your ETL.*
- **live_demo.mp4** — Before video exists: `buffering… (forever)`. *Live demos never fail. This is a recording.*
- **Trash** — `synergy.pptx`: "Deleted for everyone's sake." · `blockchain_strategy_2021.docx`: "We don't talk about 2021." · `just_use_excel.xlsx`: "Restored 47 times."

### Metadata
- Site title pattern: `{Window} — Kaizen Atelier`; home: `Kaizen Atelier — IT & data consulting`.
- Default description: "Data, automation and infrastructure built around how your business actually works."
- Footer/menu tagline (optional): *Engineered for continuous improvement.*
