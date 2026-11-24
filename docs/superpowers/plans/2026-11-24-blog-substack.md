# Blog (Substack) Window + Contact Move — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Contact.exe to the left icon column under Pricing, and replace the Notes window with a Blog window that lists posts from Connor's Substack plus a subscribe box.

**Architecture:** Root layout (server component) fetches the Substack RSS feed with hourly revalidation, parses it into plain post objects, and passes them to a small client context provider wrapping `<Desktop />`. `BlogWindow` reads posts from that context. Posts link out to Substack in a new tab; the Substack `/embed` subscribe iframe sits at the bottom (desktop only, button on phones, mirroring `ContactWindow`).

**Tech Stack:** Next 16 (App Router, no Cache Components), React 19, Tailwind 4, Vitest + Testing Library, Playwright.

**Spec:** Short design below (small change; agreed in conversation).

## Design (short)

- **Intent:** Surface Connor's Substack writing on the desktop site without leaving it stale; keep readers' engagement on Substack (likes, comments, subscriber stats).
- **Decided:**
  - Contact.exe moves to left column, directly after Pricing.
  - Notes window is renamed Blog (id `blog`, route `/blog`, label "Blog"). Notes ceases to exist.
  - Approach A: list of posts (title, subtitle, date) linking to Substack in a new tab + Substack subscribe embed. Posts are NOT rendered in-window.
  - Feed: `https://signalfeed.substack.com/feed`. Subscribe embed: `https://signalfeed.substack.com/embed` (verified: `frame-ancestors *`). Full Substack pages cannot be framed (`frame-ancestors 'self' *.substack.com`) — do not try.
- **Non-goals:** in-window post reading, comments, search, pagination, RSS on the client.
- **Anti-goals:** Substack being down or slow must never break or stall the site.
- **Approaches considered:** A list + link out + subscribe (picked: keeps Substack's engagement loop, light); B full posts in-window (sanitising + styling Substack HTML, duplicate content); C list + excerpt preview (A with extra).
- **Builder's calls (Claude's, flagged for review):** `/notes` → `/blog` permanent redirect; hourly revalidate; 5s fetch timeout; max 10 posts; dates formatted server-side as `9 Nov 2026` (UTC) to avoid hydration mismatch; no new dependencies (regex RSS parse is enough for Substack's fixed feed shape); notepad glyph reused for Blog icon.

## Global Constraints

- Feed URL `https://signalfeed.substack.com/feed`; embed URL `https://signalfeed.substack.com/embed`; publication URL `https://signalfeed.substack.com` — all in `lib/site.ts`.
- No new npm dependencies.
- External post links: `target="_blank" rel="noopener noreferrer"`.
- Fetch: `{ next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) }`. Any error / non-2xx → `[]`.

## Review Focus

1. **Feed fetch fails or times out at build/render** → site renders, Blog shows empty state with "Read on Substack" link. Test in Task 2 (`getBlogPosts returns [] when fetch rejects` and `… non-ok`).
2. **Titles with entities / curly quotes** (`isn&#8217;t`, `&amp;`) → rendered as `isn’t`, `&`. Test in Task 2.
3. **Item missing `<description>`** → post renders without subtitle, no "undefined". Test in Task 2 + Task 3.
4. **Hydration mismatch from date formatting** → date string computed on server only. Covered by existing e2e `no hydration or console errors on a window route` once `/blog` exists (Task 4 adds `/blog` to it implicitly via `WINDOWS` loop; verify).
5. **Old `/notes` links** → 308 to `/blog`. e2e in Task 4.

## Pre-flight

Working tree has uncommitted changes in `components/desktop/Desktop.tsx`, `WindowFrame.tsx`, `WindowFrame.test.tsx`, `e2e/desktop.spec.ts`. Commit or stash them before starting (Task 4 edits `e2e/desktop.spec.ts`). Ask Connor which.

---

### Task 1: Move Contact left, rename Notes → Blog in registry

**Files:**
- Modify: `lib/windows.ts` (WindowId union, WINDOWS entries, MENUS)
- Modify: `lib/windows.test.ts:23-26`
- Modify: `components/icons/Glyphs.tsx:60` (key `notes` → `blog`)
- Modify: `components/desktop/windowContent.tsx` (temporarily map `blog: NotesWindow`; Task 3 swaps it)
- Modify: `next.config.ts` (redirect)

**Interfaces:**
- Produces: `WindowId` includes `"blog"`, not `"notes"`.

- [ ] **Step 1: Update test** `icon columns are in spec order`:
  ```ts
  expect(ids("left")).toEqual(["services", "work", "process", "about", "pricing", "contact"]);
  expect(ids("right")).toEqual(["cv", "blog", "homelab", "pipelines", "demo", "trash"]);
  ```
  Add: `test("blog route", () => expect(windowForPath("/blog")).toBe("blog"))` and `expect(windowForPath("/notes")).toBe("notFound")`. Update any MENUS assertion to expect `{ label: "Blog", id: "blog" }`.
- [ ] **Step 2:** `npx vitest run lib/windows.test.ts` → FAIL.
- [ ] **Step 3: Implement.** In `WINDOWS`: move the `contact` entry to directly after `pricing`, set `side: "left"`, move the `// Right column` comment below it. Replace `notes` entry with:
  `id: "blog", title: "Blog", iconLabel: "Blog", route: "/blog", side: "right", egg: false, indexed: true, description: "Writing on data, automation and what software really costs. Published on Substack.", size: { w: 520, h: 560 }`.
  MENUS "More": `{ label: "Blog", id: "blog" }` replaces Notes. Glyphs key rename. `next.config.ts`: `redirects: async () => [{ source: "/notes", destination: "/blog", permanent: true }]`.
- [ ] **Step 4:** `npm test && npx tsc --noEmit` → PASS (fix `ContactWindow.test.tsx` import only if tsc complains; NotesWindow file still exists until Task 3).
- [ ] **Step 5:** Commit `feat: move contact to left column, rename notes to blog`.

### Task 2: Substack feed loader

**Files:**
- Modify: `lib/site.ts` (add `SUBSTACK_URL`, `SUBSTACK_FEED_URL`, `SUBSTACK_EMBED_URL`)
- Create: `lib/blog.ts`
- Test: `lib/blog.test.ts` (fixture string inline: 2 items copied from the live feed shape, one with `<content:encoded>` and one with no `<description>`)

**Interfaces:**
- Produces:
  ```ts
  export type BlogPost = { title: string; subtitle: string | null; href: string; isoDate: string; date: string };
  export function parseFeed(xml: string, limit?: number /* default 10 */): BlogPost[];
  export async function getBlogPosts(): Promise<BlogPost[]>;
  ```

- [ ] **Step 1: Tests**
  - `parseFeed extracts title, subtitle, link, date`: first item → `{ title: "Code is cheap, but you haven’t accepted it yet.", subtitle: "and your OpEx isn’t", href: "https://signalfeed.substack.com/p/code-is-cheap-but-you-havent-accepted", isoDate: "2026-11-09T21:01:18.000Z", date: "9 Nov 2026" }`.
  - `decodes entities`: `&#8217;` → `’`, `&amp;` → `&`, `&lt;` → `<`.
  - `missing description gives null subtitle`.
  - `ignores <content:encoded> and channel-level <title>` (channel title "Connor’s Substack" never appears as a post).
  - `respects limit` (limit 1 → length 1).
  - `getBlogPosts returns [] when fetch rejects` / `… when response not ok` (`vi.stubGlobal("fetch", …)`).
  - `getBlogPosts calls feed URL with revalidate 3600` (assert second arg `next.revalidate === 3600`).
- [ ] **Step 2:** `npx vitest run lib/blog.test.ts` → FAIL.
- [ ] **Step 3: Implement.** Split on `<item>…</item>`; per item read `title`, `description`, `link`, `pubDate` with a tag regex that strips optional `<![CDATA[ ]]>`; decode numeric (`&#\d+;`, `&#x..;`) and the five named entities; `date` via `toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })`; skip items without title or link. `getBlogPosts` wraps fetch + `parseFeed` in try/catch per Global Constraints.
- [ ] **Step 4:** tests PASS.
- [ ] **Step 5:** Commit `feat: substack feed loader`.

### Task 3: BlogWindow + posts provider

**Files:**
- Create: `components/windows/BlogWindow.tsx` (client)
- Create: `components/windows/BlogWindow.test.tsx`
- Delete: `components/windows/NotesWindow.tsx`
- Modify: `components/windows/ContactWindow.test.tsx` (drop Notes import + test)
- Modify: `components/desktop/windowContent.tsx` (`blog: BlogWindow`)
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `BlogPost`, `getBlogPosts` (Task 2); `SUBSTACK_URL`, `SUBSTACK_EMBED_URL`.
- Produces:
  ```ts
  export function BlogPostsProvider(props: { posts: BlogPost[]; children: React.ReactNode }): JSX.Element;
  export function BlogWindow(props: { posts?: BlogPost[] }): JSX.Element; // prop overrides context, for tests
  ```

- [ ] **Step 1: Tests** (mock `useIsDesktop` like `ContactWindow.test.tsx`):
  - `lists posts linking to Substack in a new tab`: link name = post title, `href` = post href, `target="_blank"`, `rel="noopener noreferrer"`; subtitle and `9 Nov 2026` visible.
  - `post without subtitle renders no subtitle text` (no "null"/"undefined" in container text).
  - `empty state links to the publication`: with `posts={[]}` → text "Nothing published yet. Or the feed's having a lie-in." and link "Read on Substack" → `SUBSTACK_URL`.
  - `desktop shows subscribe embed`: `getByTitle("Subscribe to Connor's Substack")` has `src` = `SUBSTACK_EMBED_URL`.
  - `phone shows subscribe button, no iframe`: link "Subscribe on Substack" → `SUBSTACK_URL`; `querySelector("iframe")` null.
  - `reads posts from BlogPostsProvider when no prop`.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3: Implement.** `BlogWindow` layout: `<Title>Blog</Title>`, short `<Body>` intro ("Notes on data, automation and the economics of software. Written on Substack, read wherever."), post list styled like the old Notes list (dashed bottom borders, title in indigo, mono date right, subtitle `text-sm text-muted` under title), "All posts on Substack →" link, then subscribe embed `h-[320px] w-full rounded-md border-[1.5px] border-ink bg-white` (`loading="lazy"`) on desktop / `<Button variant="primary" href={SUBSTACK_URL}>Subscribe on Substack</Button>` on phones. Context default `[]`. In `app/layout.tsx`: make `RootLayout` async, `const posts = await getBlogPosts();`, wrap `<Desktop />` in `<BlogPostsProvider posts={posts}>`.
- [ ] **Step 4:** `npm test && npx tsc --noEmit && npm run lint` → PASS.
- [ ] **Step 5:** Commit `feat: blog window listing substack posts`.

### Task 4: e2e + build check

**Files:**
- Modify: `e2e/desktop.spec.ts`

- [ ] **Step 1: Tests**
  - `/notes redirects to /blog`: `request.get("/notes", { maxRedirects: 0 })` → status 308, `location` header ends `/blog`.
  - `blog window lists posts from the feed`: goto `/blog`; window "Blog" visible; at least one link with `href` starting `https://signalfeed.substack.com/p/` (live feed; acceptable flake risk — if Connor objects, route-mock it).
  - `contact icon sits in the left column`: the Contact.exe icon's bounding box `x` < viewport width / 2.
- [ ] **Step 2:** `npm run build` → succeeds; output shows `/blog` prerendered with revalidate 1h.
- [ ] **Step 3:** `npm run test:e2e` → PASS (including existing per-route title + hydration tests now covering `/blog`).
- [ ] **Step 4:** Commit `test: e2e for blog window and contact move`.
