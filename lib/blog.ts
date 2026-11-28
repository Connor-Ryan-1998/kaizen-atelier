import snapshotJson from "./feed-snapshot.json" with { type: "json" };
import { SUBSTACK_FEED_URL } from "./site.ts";

export type BlogPost = {
  title: string;
  subtitle: string | null;
  href: string;
  isoDate: string;
  /** Display date, formatted on the server so client and server markup match. */
  date: string;
};

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== "#") return NAMED[e.toLowerCase()] ?? m;
    const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Number.isNaN(code) ? m : String.fromCodePoint(code);
  });
}

function tag(item: string, name: string): string | null {
  const m = item.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))</${name}>`));
  if (!m) return null;
  const value = decode((m[1] ?? m[2]).trim());
  return value || null;
}

/** Substack's RSS shape is fixed, so a small regex parse beats pulling in an XML library. */
export function parseFeed(xml: string, limit = 10): BlogPost[] {
  const posts: BlogPost[] = [];
  for (const [, raw] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    // Drop the post body so tags inside it can't be mistaken for item fields.
    const item = raw.replace(/<content:encoded>[\s\S]*?<\/content:encoded>/g, "");
    const title = tag(item, "title");
    const href = tag(item, "link");
    if (!title || !href) continue;
    const when = new Date(tag(item, "pubDate") ?? "");
    const valid = !Number.isNaN(when.getTime());
    posts.push({
      title,
      subtitle: tag(item, "description"),
      href,
      isoDate: valid ? when.toISOString() : "",
      date: valid
        ? when.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
        : "",
    });
    if (posts.length >= limit) break;
  }
  return posts;
}

/** Substack's bot protection rejects bare server requests, so look like a browser. */
const FEED_HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
};

const SNAPSHOT = snapshotJson as BlogPost[];

/** Guards the committed snapshot: a hand-edited or corrupt entry is skipped rather than crashing the render. */
function isBlogPost(p: unknown): p is BlogPost {
  if (typeof p !== "object" || p === null) return false;
  const o = p as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.href === "string" && typeof o.date === "string" && typeof o.isoDate === "string";
}

// getBlogPosts runs once per exported page; warn once per snapshot, not once per page.
const warned = new WeakSet<BlogPost[]>();

class FeedStatusError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Substack feed returned ${status}`);
    this.status = status;
  }
}

export async function fetchPosts(): Promise<BlogPost[]> {
  const res = await fetch(SUBSTACK_FEED_URL, { headers: FEED_HEADERS, signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new FeedStatusError(res.status);
  const posts = parseFeed(await res.text());
  // Bot protection can answer 200 with an HTML challenge page; treat "no posts" as a failed fetch.
  if (posts.length === 0) throw new Error("Substack feed contained no posts");
  return posts;
}

/**
 * Latest posts, fetched at build time (the site is a static export rebuilt daily).
 * Substack blocks some build-server IPs (HTTP 403), so in a production build a failed live fetch falls back
 * to lib/feed-snapshot.json (refresh with `npm run snapshot`) and warns; it throws only if the snapshot has no usable posts.
 * Elsewhere (dev, tests) a failure gives no posts so working offline still renders.
 * Called once per exported page (root layout), so one retry keeps a single blip from failing the build;
 * a 403 is deterministic, so it isn't retried.
 */
export async function getBlogPosts(snapshot: BlogPost[] = SNAPSHOT): Promise<BlogPost[]> {
  try {
    return await fetchPosts().catch((err) => {
      if (err instanceof FeedStatusError && err.status === 403) throw err;
      return fetchPosts();
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") return [];
    const usable = snapshot.filter(isBlogPost);
    if (usable.length === 0) throw err;
    if (!warned.has(snapshot)) {
      warned.add(snapshot);
      // `::warning::` shows as an annotation in GitHub Actions; it is just text elsewhere.
      console.warn(`::warning::Substack feed unavailable (${(err as Error).message}); using lib/feed-snapshot.json`);
    }
    return usable;
  }
}
