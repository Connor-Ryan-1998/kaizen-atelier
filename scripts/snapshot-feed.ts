// Refreshes lib/feed-snapshot.json from the live Substack feed: `npm run snapshot`, then commit.
// The build falls back to that file when Substack blocks the build server (HTTP 403).
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fetchPosts, type BlogPost } from "../lib/blog.ts";

/**
 * Writes the posts to `path` and returns how many. Retries the fetch once; if it still fails, or there are
 * no posts, throws and leaves the file untouched.
 */
export async function writeSnapshot(path: string, fetchFn: () => Promise<BlogPost[]> = fetchPosts): Promise<number> {
  const posts = await fetchFn().catch(fetchFn);
  if (posts.length === 0) throw new Error("Feed returned no posts; keeping the existing snapshot");
  writeFileSync(path, JSON.stringify(posts, null, 2) + "\n");
  return posts.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeSnapshot(fileURLToPath(new URL("../lib/feed-snapshot.json", import.meta.url))).then(
    (n) => console.log(`Wrote ${n} posts to lib/feed-snapshot.json`),
    (err: Error) => {
      console.error(`Snapshot failed: ${err.message}`);
      process.exit(1);
    },
  );
}
