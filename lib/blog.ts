import { SUBSTACK_FEED_URL } from "./site";

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

/**
 * Latest posts, fetched once at build time (the site is a static export rebuilt daily).
 * In a production build a failed fetch throws, failing the build so the last good deploy stays live.
 * Elsewhere (dev, tests) it degrades to no posts so working offline still renders.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(SUBSTACK_FEED_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`Substack feed returned ${res.status}`);
    return parseFeed(await res.text());
  } catch (err) {
    if (process.env.NODE_ENV === "production") throw err;
    return [];
  }
}
