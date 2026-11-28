# Cloudflare Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move hosting off Vercel to a Cloudflare Worker serving a fully static Next.js export, rebuilt daily by GitHub Actions so new Substack posts appear within a day.

**Architecture:** `next build` with `output: "export"` writes plain HTML/CSS/JS to `out/`. A Worker with static assets (`wrangler.jsonc`, no Worker script) serves `out/`, with a `_redirects` file replacing the Next.js redirect. One GitHub Actions workflow tests, builds and deploys on push to `main`, on a daily cron, and on demand. The Substack feed is read once per build; a failed fetch fails the build so the previous good deploy stays live.

**Tech Stack:** Next.js 16.4 App Router (static export), React 19, Vitest, Playwright, Wrangler 4, GitHub Actions.

**Spec:** No separate design doc. Agreed in conversation on 2026-11-28 (summarised below).

### Approaches considered

1. **OpenNext adapter on Workers (`@opennextjs/cloudflare`):** keeps ISR (`revalidate: 3600`) and `next/image` optimisation via R2/KV and Cloudflare Images. Rejected: adds a runtime and cache bindings to maintain for a site that is almost entirely static.
2. **Static export + daily rebuild (chosen):** no server runtime, cheapest, simplest. Costs: blog freshness drops from hourly to daily (acceptable, the blog isn't the primary brand entry point), no image optimisation, redirect moves to `_redirects`.
3. **Static export + client-side/Worker feed fetch:** fresh posts without rebuilds, but more code. Rejected as unnecessary.

Deploy trigger: GitHub Action (chosen) over Cloudflare Workers Builds, so build, test, deploy and the daily schedule live in one pipeline.

## Global Constraints

- Worker name: `kaizen-atelier`. `compatibility_date`: `"2026-11-28"`.
- Static assets directory: `./out`. `not_found_handling: "404-page"`; `html_handling: "auto-trailing-slash"` (so `/blog` serves `out/blog.html`).
- Redirect: `/notes` → `/blog`, `301`.
- Daily rebuild cron: `0 20 * * *` (UTC; 06:00 AEST).
- Repo secrets (added manually by Connor, not in code): `CLOUDFLARE_API_TOKEN` (template "Edit Cloudflare Workers"), `CLOUDFLARE_ACCOUNT_ID`.
- CI Node version: `24`. Install with `npm ci` (repo uses `package-lock.json`).
- No `@opennextjs/*`, no Worker script, no Vercel-specific code.

## Review Focus

1. Hard-loading a deep link (`/blog`, `/homelab`, any `slugs()` entry) on the Worker returns 200 with the desktop, not a 404 (static file mapping without `.html`). Covered by e2e running against `wrangler dev`, Task 3.
2. Substack down/slow during the scheduled build: build fails, nothing deploys, live site keeps yesterday's posts. Covered by the `getBlogPosts` throw tests, Task 1.
3. `next dev` offline still renders (empty blog) rather than crashing the layout. Covered by the non-production fallback test, Task 1.
4. `/notes` still redirects with 301 after the move. Covered by e2e, Task 3.
5. An unknown path (`/nope`) shows Next's 404 page with 404 status, not the home page. Covered by e2e, Task 3.

---

### Task 1: Build-time Substack feed

**Files:**
- Modify: `lib/blog.ts:54-63`
- Test: `lib/blog.test.ts:43-63`

**Interfaces:**
- Produces: `getBlogPosts(): Promise<BlogPost[]>` (signature unchanged). In production (`process.env.NODE_ENV === "production"`, i.e. `next build`) it throws on fetch rejection or non-OK response. Otherwise it returns `[]` on failure, as today.

- [ ] **Step 1: Update tests**

Replace the `getBlogPosts` describe block with:
- `"fetches the feed without Next revalidation"`: asserts 2 posts, URL is `SUBSTACK_FEED_URL`, and `fetchMock.mock.calls[0][1].next` is `undefined`.
- `"throws in production when fetch rejects"`: `vi.stubEnv("NODE_ENV", "production")`, fetch rejects → `await expect(getBlogPosts()).rejects.toThrow()`.
- `"throws in production when response not ok"`: same, with a 503 response; error message contains `"503"`.
- `"returns [] outside production when fetch rejects"` and `"returns [] outside production when response not ok"`: the existing two tests, unchanged in behaviour.
- `afterEach` also calls `vi.unstubAllEnvs()`.

- [ ] **Step 2: Run tests, verify the new ones fail**

Run: `npx vitest run lib/blog.test.ts`
Expected: FAIL on the revalidation and production-throw tests.

- [ ] **Step 3: Implement in `lib/blog.ts`**

Drop `next: { revalidate: 3600 }` (keep the 5s `AbortSignal.timeout`). On non-OK, throw `new Error(\`Substack feed returned ${res.status}\`)`. In the catch, rethrow if `process.env.NODE_ENV === "production"`, else return `[]`. Update the doc comment: posts are fetched at build time, rebuilt daily; a failed fetch fails the production build so the last good deploy stays live.

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/blog.ts lib/blog.test.ts
git commit -m "feat: fetch Substack feed at build time, fail build on error"
```

### Task 2: Static export served by a Cloudflare Worker

**Files:**
- Modify: `next.config.ts`
- Create: `public/_redirects`
- Create: `wrangler.jsonc`
- Modify: `package.json` (devDependency + scripts)
- Modify: `.gitignore` (add `.wrangler/`)

**Interfaces:**
- Produces: `npm run build` emits `out/` (including `out/_redirects`, `out/404.html`, `out/blog.html`). `npm run preview` serves `out/` locally via Wrangler; `npm run deploy` deploys it.

- [ ] **Step 1: `next.config.ts`**

Set `output: "export"`, `images: { unoptimized: true }`. Remove `redirects()` (unsupported with export; the build warns/errors if left).

- [ ] **Step 2: `public/_redirects`**

Single line: `/notes /blog 301`

- [ ] **Step 3: `wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "kaizen-atelier",
  "compatibility_date": "2026-11-28",
  "assets": {
    "directory": "./out",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  }
}
```

- [ ] **Step 4: Dependencies and scripts**

`npm i -D wrangler@^4`. Add scripts: `"preview": "wrangler dev --port 3100"`, `"deploy": "wrangler deploy"`. Remove `"start": "next start"` (doesn't work with export).

- [ ] **Step 5: Verify build output**

Run: `npm run build && ls out/_redirects out/404.html out/blog.html out/index.html`
Expected: build succeeds; all four files listed. `HomelabWindow`'s `next/image` renders `src="/eggs/spaghetti.jpg"` unoptimised (320 KB, acceptable; no change).

- [ ] **Step 6: Commit**

```bash
git add next.config.ts public/_redirects wrangler.jsonc package.json package-lock.json .gitignore
git commit -m "feat: static export served as Cloudflare Worker assets"
```

### Task 3: E2E against the Worker

**Files:**
- Modify: `playwright.config.ts:10-16` (webServer)
- Create: `e2e/hosting.spec.ts`

**Interfaces:**
- Consumes: `npm run build`, `npm run preview` (Task 2).

- [ ] **Step 1: Point Playwright at Wrangler**

`webServer.command`: `"npm run build && npm run preview"`. Keep `url`, `reuseExistingServer: false`, `timeout`. Update the comment (production static build served by Wrangler, same as Cloudflare).

- [ ] **Step 2: Write `e2e/hosting.spec.ts`**

- `"/notes redirects to /blog with 301"`: `request.get("/notes", { maxRedirects: 0 })` → status `301`, `location` header ends with `/blog`.
- `"deep links load directly"`: for each of `/blog` and `/homelab`, `page.goto` → response status `200` and the desktop is visible (reuse whatever locator `e2e/desktop.spec.ts` uses for the desktop shell).
- `"unknown path is a 404"`: `page.goto("/nope")` → response status `404`.

- [ ] **Step 3: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: all PASS, including existing specs (blog spec still sees `signalfeed.substack.com/p/` links, which proves the build-time fetch).

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts e2e/hosting.spec.ts
git commit -m "test: run e2e against wrangler static assets"
```

### Task 4: Deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write the workflow**

- `name: Deploy`
- `on`: `push` to `main`; `schedule` with `cron: "0 20 * * *"`; `workflow_dispatch`.
- `concurrency: { group: deploy, cancel-in-progress: false }` so a cron run and a push can't deploy over each other.
- Single job `deploy` on `ubuntu-latest`: `actions/checkout@v4`, `actions/setup-node@v4` (`node-version: 24`, `cache: npm`), `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npx wrangler deploy` with env `CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}` and `CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`.
- E2E is not run in CI (local gate only; avoids installing browsers on every daily run).

- [ ] **Step 2: Validate syntax**

Run: `npx --yes @action-validator/cli .github/workflows/deploy.yml` (or `actionlint` if installed)
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy to Cloudflare on push and daily"
```

### Task 5: Cutover (manual, Connor)

Not code. Do in order:

- [ ] Create the Cloudflare API token ("Edit Cloudflare Workers" template) and add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repo secrets.
- [ ] Push `main` (or run the workflow manually). Confirm it goes green.
- [ ] Check `https://kaizen-atelier.<subdomain>.workers.dev`: home, `/blog` hard load, `/notes` redirect, blog posts listed, fonts, spaghetti image.
- [ ] Worker → Settings → Domains & Routes → add the custom domain. If DNS isn't on Cloudflare yet, move the zone first (lower TTL beforehand).
- [ ] Confirm the custom domain serves the Worker, then disconnect the domain from Vercel and delete the Vercel project after a few days.
