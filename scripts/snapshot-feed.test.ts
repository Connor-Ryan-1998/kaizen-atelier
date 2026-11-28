import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { BlogPost } from "../lib/blog.ts";
import { writeSnapshot } from "./snapshot-feed.ts";

const POST: BlogPost = {
  title: "A post",
  subtitle: null,
  href: "https://signalfeed.substack.com/p/a-post",
  isoDate: "2026-11-09T21:01:18.000Z",
  date: "9 Nov 2026",
};

function tempFile(initial?: string) {
  const file = path.join(mkdtempSync(path.join(tmpdir(), "snapshot-")), "feed-snapshot.json");
  if (initial !== undefined) writeFileSync(file, initial);
  return file;
}

describe("writeSnapshot", () => {
  test("writes fetched posts as JSON and returns the count", async () => {
    const file = tempFile();
    expect(await writeSnapshot(file, async () => [POST])).toBe(1);
    expect(readFileSync(file, "utf8")).toBe(JSON.stringify([POST], null, 2) + "\n");
  });

  test("retries the fetch once after a transient failure", async () => {
    const file = tempFile();
    const fetchFn = vi.fn().mockRejectedValueOnce(new Error("blip")).mockResolvedValue([POST]);
    expect(await writeSnapshot(file, fetchFn)).toBe(1);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  test("leaves the existing file untouched when the fetch rejects", async () => {
    const file = tempFile('[{"title":"old"}]');
    await expect(writeSnapshot(file, async () => Promise.reject(new Error("blocked")))).rejects.toThrow("blocked");
    expect(readFileSync(file, "utf8")).toBe('[{"title":"old"}]');
  });

  test("refuses to write an empty list", async () => {
    const file = tempFile('[{"title":"old"}]');
    await expect(writeSnapshot(file, async () => [])).rejects.toThrow();
    expect(readFileSync(file, "utf8")).toBe('[{"title":"old"}]');
  });
});
