import { screen } from "@testing-library/react";
import { renderInDesk } from "@/components/desktop/testUtils";
import type { BlogPost } from "@/lib/blog";
import { SUBSTACK_EMBED_URL, SUBSTACK_URL } from "@/lib/site";
import { BlogPostsProvider, BlogWindow } from "./BlogWindow";

const isDesktop = vi.hoisted(() => ({ value: true }));
vi.mock("@/components/desktop/useIsDesktop", () => ({ useIsDesktop: () => isDesktop.value }));

const POSTS: BlogPost[] = [
  {
    title: "Code is cheap, but you haven’t accepted it yet.",
    subtitle: "and your OpEx isn’t",
    href: "https://signalfeed.substack.com/p/code-is-cheap-but-you-havent-accepted",
    isoDate: "2026-11-09T21:01:18.000Z",
    date: "9 Nov 2026",
  },
  {
    title: "Pipes & plumbing",
    subtitle: null,
    href: "https://signalfeed.substack.com/p/pipes",
    isoDate: "2026-11-01T08:00:00.000Z",
    date: "1 Nov 2026",
  },
];

beforeEach(() => {
  isDesktop.value = true;
});

test("lists posts linking to Substack in a new tab", () => {
  renderInDesk(<BlogWindow posts={POSTS} />);
  const link = screen.getByRole("link", { name: POSTS[0].title });
  expect(link).toHaveAttribute("href", POSTS[0].href);
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(screen.getByText("and your OpEx isn’t")).toBeInTheDocument();
  expect(screen.getByText("9 Nov 2026")).toBeInTheDocument();
});

test("post without subtitle renders no subtitle text", () => {
  const { container } = renderInDesk(<BlogWindow posts={[POSTS[1]]} />);
  expect(container.textContent).not.toMatch(/null|undefined/);
});

test("empty state links to the publication", () => {
  renderInDesk(<BlogWindow posts={[]} />);
  expect(screen.getByText("Nothing published yet. Or the feed's having a lie-in.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Read on Substack" })).toHaveAttribute("href", SUBSTACK_URL);
});

test("desktop shows subscribe embed", () => {
  renderInDesk(<BlogWindow posts={POSTS} />);
  expect(screen.getByTitle("Subscribe to Connor's Substack")).toHaveAttribute("src", SUBSTACK_EMBED_URL);
});

test("phone shows subscribe button, no iframe", () => {
  isDesktop.value = false;
  const { container } = renderInDesk(<BlogWindow posts={POSTS} />);
  expect(container.querySelector("iframe")).toBeNull();
  expect(screen.getByRole("link", { name: "Subscribe on Substack" })).toHaveAttribute("href", SUBSTACK_URL);
});

test("reads posts from BlogPostsProvider when no prop", () => {
  renderInDesk(
    <BlogPostsProvider posts={POSTS}>
      <BlogWindow />
    </BlogPostsProvider>,
  );
  expect(screen.getByRole("link", { name: "Pipes & plumbing" })).toBeInTheDocument();
});
