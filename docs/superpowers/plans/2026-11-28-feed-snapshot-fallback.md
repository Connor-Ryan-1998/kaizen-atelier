# Substack Feed Snapshot Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop Substack blocking the build server from breaking deploys or emptying the blog: send browser-like request headers, and fall back to a committed snapshot of the feed when the live fetch fails in a production build.

**Architecture:** `getBlogPosts` tries the live feed (with `User-Agent`/`Accept` headers). In a production build, if that fails it returns posts from `lib/feed-snapshot.json` and warns; it throws only if the snapshot is empty. A local script refreshes the snapshot from the live feed (it works from a home IP; Cloudflare's build servers get HTTP 403).

**Tech Stack:** Next.js 16.4 (static export), Node 24+ type stripping for the script, Vitest.

**Spec:** No separate design doc. Agreed in conversation on 2026-11-28 (options 1 + 2 of the 403 discussion). This amends the "fail the build on error" rule from `docs/superpowers/plans/2026-11-28-cloudflare-migration.md`: a failed live fetch now falls back to the snapshot; the build fails only with no snapshot.

## Global Constraints

- Request headers: `User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36`, `Accept: application/rss+xml, application/xml;q=0.9, */*;q=0.8`.
- Keep the 5s `AbortSignal.timeout` and the single retry for transient failures. HTTP 403 is never retried.
- Outside production (`NODE_ENV !== "production"`): failure returns `[]`, never the snapshot (dev shows real state).
- Snapshot file: `lib/feed-snapshot.json`, a `BlogPost[]` (same shape the layout already consumes). Committed.
- No new dependencies. The script runs with plain Node (`node scripts/snapshot-feed.ts`).

## Review Focus

1. Live fetch 403s in production → snapshot posts render, build passes, a warning is logged (Task 1 test).
2. Snapshot empty and live fetch fails in production → build throws; never ships a silent empty blog (Task 1 test).
3. Live fetch succeeds → live posts win over a stale snapshot (Task 1 test).
4. `npm run snapshot` while Substack is unreachable or blocked → exits non-zero and leaves the existing snapshot file untouched (Task 2 test).
5. Dev/test environments don't read the snapshot, so offline `next dev` still shows an empty blog (Task 1 test).

---

### Task 1: Headers, 403 handling and snapshot fallback

**Files:**
- Modify: `lib/blog.ts` (`fetchPosts`, `getBlogPosts`, import of `./site`)
- Modify: `tsconfig.json` (add `"allowImportingTsExtensions": true`)
- Create: `lib/feed-snapshot.json` (initially `[]`; real content in Task 2)
- Test: `lib/blog.test.ts`

**Interfaces:**
- Produces: `fetchPosts(): Promise<BlogPost[]>` (now exported; throws on network error or non-OK, with `status` on the error for non-OK) and `getBlogPosts(snapshot: BlogPost[] = SNAPSHOT): Promise<BlogPost[]>`, where `SNAPSHOT` is `lib/feed-snapshot.json` cast to `BlogPost[]`. The layout's existing zero-argument call keeps working. Task 2 consumes `fetchPosts`.
- `blog.ts` imports `./site.ts` (explicit extension) so Node can load it without a bundler; this is why `allowImportingTsExtensions` is needed.

- [ ] **Step 1: Write failing tests in `lib/blog.test.ts` (`getBlogPosts` block)**

Use an explicit `SNAP: BlogPost[]` with one post. Production tests call `vi.stubEnv("NODE_ENV", "production")` and `getBlogPosts(SNAP)`:
- `"sends browser-like User-Agent and Accept headers"`: `fetchMock.mock.calls[0][1].headers["User-Agent"]` matches `/Mozilla\/5\.0/` and `Accept` contains `application/rss+xml`.
- `"does not retry a 403"`: fetch resolves `new Response("", { status: 403 })`; result equals `SNAP`; `fetchMock` called once.
- `"still retries a network error once"`: first call rejects, second resolves FEED; live posts returned (2), called twice. (Replaces the existing retry test if it overlaps.)
- `"production: falls back to snapshot and warns when the live fetch fails"`: fetch rejects always; `console.warn` spied; result `toEqual(SNAP)`; warn called with a message containing `"snapshot"`.
- `"production: throws when the live fetch fails and the snapshot is empty"`: `getBlogPosts([])` rejects.
- `"production: live posts win over the snapshot"`: fetch resolves FEED; result has 2 posts, first title is the live one, not `SNAP[0]`.
- Update the existing production-throw tests to pass `[]` as the snapshot so they keep asserting the throw. Non-production tests unchanged, plus `"non-production ignores the snapshot"`: fetch rejects, `getBlogPosts(SNAP)` returns `[]`.

- [ ] **Step 2: Run tests, verify the new ones fail**

Run: `npx vitest run lib/blog.test.ts`
Expected: FAIL on the header, 403, snapshot-fallback and live-wins tests.

- [ ] **Step 3: Implement in `lib/blog.ts`**

- Import `./site.ts` and `./feed-snapshot.json`; add `"allowImportingTsExtensions": true` to `tsconfig.json`.
- `fetchPosts` passes the two headers from Global Constraints. On non-OK it throws an `Error` with a numeric `status` property and message `Substack feed returned ${status}`.
- `getBlogPosts`: try `fetchPosts()`; on failure retry once unless `err.status === 403`. If it still fails: outside production return `[]`; in production, if `snapshot.length > 0` log `console.warn("Substack feed unavailable (<reason>); using lib/feed-snapshot.json")` and return `snapshot`, else rethrow the original error.
- Update the doc comment to describe the fallback.

- [ ] **Step 4: Run all checks**

Run: `npm test && npm run build`
Expected: all unit tests PASS; build succeeds (the live feed works from your machine; if offline, the empty snapshot makes it fail, as intended).

- [ ] **Step 5: Commit**

```bash
git add lib/blog.ts lib/blog.test.ts lib/feed-snapshot.json tsconfig.json
git commit -m "feat: browser-like feed headers and snapshot fallback on build"
```

### Task 2: Snapshot refresh script and docs

**Files:**
- Create: `scripts/snapshot-feed.ts`
- Create: `scripts/snapshot-feed.test.ts`
- Modify: `lib/feed-snapshot.json` (real posts)
- Modify: `package.json` (script `"snapshot": "node scripts/snapshot-feed.ts"`)
- Modify: `README.md`

**Interfaces:**
- Consumes: `fetchPosts` from Task 1.
- Produces: `writeSnapshot(path: string, fetchFn?: () => Promise<BlogPost[]>): Promise<number>`, exported from `scripts/snapshot-feed.ts`. It writes pretty-printed JSON (2-space indent, trailing newline) and returns the number of posts. It throws, without touching the file, if the fetch fails or returns zero posts. When run directly it calls `writeSnapshot("lib/feed-snapshot.json")`, prints the count, and exits 1 with the error message on failure. (`import.meta.url` check for the direct-run guard so the test can import it without running.)

- [ ] **Step 1: Write failing tests in `scripts/snapshot-feed.test.ts`**

Use a temp dir (`fs.mkdtempSync`):
- `"writes fetched posts as JSON and returns the count"`.
- `"leaves the existing file untouched when the fetch rejects"`: pre-write `[{"title":"old"}]`, call with a rejecting `fetchFn`, `await expect(...).rejects.toThrow()`, file contents unchanged.
- `"refuses to write an empty list"`: `fetchFn` resolves `[]` → rejects, file unchanged.

- [ ] **Step 2: Run, verify fail**

Run: `npx vitest run scripts/snapshot-feed.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `scripts/snapshot-feed.ts` and the `snapshot` npm script**

`fetchFn` defaults to `fetchPosts` from `../lib/blog.ts`. Add `scripts/**` to vitest's `include` only if the default pattern misses it (it shouldn't).

- [ ] **Step 4: Generate the real snapshot**

Run: `npm run snapshot`
Expected: prints a post count ≥ 1; `lib/feed-snapshot.json` now holds the posts. Then `npm test && npm run lint && npm run build`: all pass.

- [ ] **Step 5: README**

Under "Deploy", add: what the snapshot is, that it's used only when a production build can't reach Substack (Substack blocks some build-server IPs with HTTP 403), that `npm run snapshot` refreshes it from your machine and should be committed, and that the build log line `using lib/feed-snapshot.json` means the live fetch was blocked.

- [ ] **Step 6: Commit**

```bash
git add scripts package.json lib/feed-snapshot.json README.md
git commit -m "feat: npm run snapshot refreshes the committed feed fallback"
```

### Task 3: Verify on Cloudflare (manual, Connor)

- [ ] Merge to `main` and watch the Cloudflare build log. Either the build is quiet (headers worked) or it shows `using lib/feed-snapshot.json` (still blocked, fallback worked). Both are a pass; the log line tells you which.
- [ ] If it keeps falling back, refresh the snapshot with `npm run snapshot` and commit whenever you publish a post.
