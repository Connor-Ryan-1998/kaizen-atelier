import { getBlogPosts, parseFeed, type BlogPost } from "./blog";
import { SUBSTACK_FEED_URL } from "./site";

const FEED = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title><![CDATA[Connor’s Substack]]></title><link>https://signalfeed.substack.com</link>
<item><title><![CDATA[Code is cheap, but you haven’t accepted it yet.]]></title><description><![CDATA[and your OpEx isn&#8217;t]]></description><link>https://signalfeed.substack.com/p/code-is-cheap-but-you-havent-accepted</link><pubDate>Mon, 09 Nov 2026 21:01:18 GMT</pubDate><content:encoded><![CDATA[<p>Body <title>not this</title></p>]]></content:encoded></item>
<item><title>Pipes &amp; plumbing &lt;3 &#x2014; part two</title><link>https://signalfeed.substack.com/p/pipes</link><pubDate>Sun, 01 Nov 2026 08:00:00 GMT</pubDate></item>
<item><title><![CDATA[No link, skipped]]></title><pubDate>Sun, 01 Nov 2026 08:00:00 GMT</pubDate></item>
</channel></rss>`;

describe("parseFeed", () => {
  test("extracts title, subtitle, link and date", () => {
    expect(parseFeed(FEED)[0]).toEqual({
      title: "Code is cheap, but you haven’t accepted it yet.",
      subtitle: "and your OpEx isn’t",
      href: "https://signalfeed.substack.com/p/code-is-cheap-but-you-havent-accepted",
      isoDate: "2026-11-09T21:01:18.000Z",
      date: "9 Nov 2026",
    });
  });

  test("decodes entities", () => {
    expect(parseFeed(FEED)[1].title).toBe("Pipes & plumbing <3 — part two");
  });

  test("missing description gives null subtitle", () => {
    expect(parseFeed(FEED)[1].subtitle).toBeNull();
  });

  test("ignores channel title, post bodies and items without a link", () => {
    const titles = parseFeed(FEED).map((p) => p.title);
    expect(titles).toHaveLength(2);
    expect(titles).not.toContain("Connor’s Substack");
    expect(titles).not.toContain("not this");
  });

  test("respects limit", () => {
    expect(parseFeed(FEED, 1)).toHaveLength(1);
  });
});


const SNAP: BlogPost[] = [
  { title: "From snapshot", subtitle: null, href: "https://signalfeed.substack.com/p/snap", isoDate: "2026-10-01T00:00:00.000Z", date: "1 Oct 2026" },
];

describe("getBlogPosts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const production = () => vi.stubEnv("NODE_ENV", "production");
  const stubFetch = (fn: ReturnType<typeof vi.fn>) => vi.stubGlobal("fetch", fn);

  test("fetches the feed without Next revalidation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(FEED));
    stubFetch(fetchMock);
    const posts = await getBlogPosts(SNAP);
    expect(posts).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toBe(SUBSTACK_FEED_URL);
    expect(fetchMock.mock.calls[0][1].next).toBeUndefined();
  });

  test("sends browser-like User-Agent and Accept headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(FEED));
    stubFetch(fetchMock);
    await getBlogPosts(SNAP);
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers["User-Agent"]).toMatch(/Mozilla\/5\.0/);
    expect(headers["Accept"]).toContain("application/rss+xml");
  });

  test("still retries a network error once", async () => {
    production();
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("timeout")).mockResolvedValue(new Response(FEED));
    stubFetch(fetchMock);
    expect(await getBlogPosts(SNAP)).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("does not retry a 403", async () => {
    production();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 403 }));
    stubFetch(fetchMock);
    expect(await getBlogPosts(SNAP)).toEqual(SNAP);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("production: falls back to the snapshot and warns when the live fetch fails", async () => {
    production();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    stubFetch(vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await getBlogPosts(SNAP)).toEqual(SNAP);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("snapshot"));
  });

  test("production: throws when the live fetch fails and the snapshot is empty", async () => {
    production();
    stubFetch(vi.fn().mockRejectedValue(new Error("timeout")));
    await expect(getBlogPosts([])).rejects.toThrow("timeout");
  });

  test("production: throws with the status when response not ok and the snapshot is empty", async () => {
    production();
    stubFetch(vi.fn().mockResolvedValue(new Response("nope", { status: 503 })));
    await expect(getBlogPosts([])).rejects.toThrow("503");
  });

  test("production: a 200 with no posts (e.g. a bot-challenge page) falls back to the snapshot", async () => {
    production();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    stubFetch(vi.fn().mockImplementation(async () => new Response("<html><title>Just a moment...</title></html>", { status: 200 })));
    expect(await getBlogPosts(SNAP)).toEqual(SNAP);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("snapshot"));
  });

  test("production: a 200 with no posts and an empty snapshot throws", async () => {
    production();
    stubFetch(vi.fn().mockImplementation(async () => new Response("<html></html>", { status: 200 })));
    await expect(getBlogPosts([])).rejects.toThrow("no posts");
  });

  test("production: live posts win over the snapshot", async () => {
    production();
    stubFetch(vi.fn().mockResolvedValue(new Response(FEED)));
    const posts = await getBlogPosts(SNAP);
    expect(posts).toHaveLength(2);
    expect(posts[0].title).not.toBe("From snapshot");
  });

  test("non-production ignores the snapshot when the fetch rejects", async () => {
    stubFetch(vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await getBlogPosts(SNAP)).toEqual([]);
  });

  test("non-production returns [] when response not ok", async () => {
    stubFetch(vi.fn().mockResolvedValue(new Response("nope", { status: 503 })));
    expect(await getBlogPosts(SNAP)).toEqual([]);
  });
});
