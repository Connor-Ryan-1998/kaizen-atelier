import { getBlogPosts, parseFeed } from "./blog";
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

describe("getBlogPosts", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("fetches the feed with hourly revalidation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(FEED));
    vi.stubGlobal("fetch", fetchMock);
    const posts = await getBlogPosts();
    expect(posts).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toBe(SUBSTACK_FEED_URL);
    expect(fetchMock.mock.calls[0][1].next.revalidate).toBe(3600);
  });

  test("returns [] when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    expect(await getBlogPosts()).toEqual([]);
  });

  test("returns [] when response not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 503 })));
    expect(await getBlogPosts()).toEqual([]);
  });
});
