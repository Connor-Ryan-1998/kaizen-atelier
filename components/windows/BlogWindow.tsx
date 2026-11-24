"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useIsDesktop } from "@/components/desktop/useIsDesktop";
import type { BlogPost } from "@/lib/blog";
import { SUBSTACK_EMBED_URL, SUBSTACK_URL } from "@/lib/site";
import { Body, Button, Title } from "./ui";

const link = "font-semibold text-indigo underline decoration-[1.5px] underline-offset-2 hover:text-vermilion-ink";
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const BlogPostsContext = createContext<BlogPost[]>([]);

/** Carries posts fetched by the root layout (server) down to the Blog window (client). */
export function BlogPostsProvider({ posts, children }: { posts: BlogPost[]; children: ReactNode }) {
  return <BlogPostsContext.Provider value={posts}>{children}</BlogPostsContext.Provider>;
}

export function BlogWindow({ posts: postsProp }: { posts?: BlogPost[] }) {
  const fromContext = useContext(BlogPostsContext);
  const posts = postsProp ?? fromContext;
  const isDesktop = useIsDesktop();
  return (
    <div>
      <Title>Blog</Title>
      <Body>Notes on data, automation and the economics of software. Written on Substack, read wherever.</Body>
      {posts.length === 0 ? (
        <p className="mb-4 text-sm">
          Nothing published yet. Or the feed&apos;s having a lie-in.{" "}
          <a href={SUBSTACK_URL} {...external} className={link}>
            Read on Substack
          </a>
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.href} className="border-b border-dashed border-ink/30 pb-2">
                <div className="flex items-baseline justify-between gap-4">
                  <a href={p.href} {...external} className={link}>
                    {p.title}
                  </a>
                  {p.date && <span className="shrink-0 font-mono text-xs text-muted">{p.date}</span>}
                </div>
                {p.subtitle && <p className="mt-0.5 text-sm text-muted">{p.subtitle}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <a href={SUBSTACK_URL} {...external} className={link}>
              All posts on Substack →
            </a>
          </p>
        </>
      )}
      <div className="mt-5">
        {isDesktop ? (
          <iframe
            title="Subscribe to Connor's Substack"
            src={SUBSTACK_EMBED_URL}
            loading="lazy"
            className="h-[320px] w-full rounded-md border-[1.5px] border-ink bg-white"
          />
        ) : (
          <Button variant="primary" href={SUBSTACK_URL}>
            Subscribe on Substack
          </Button>
        )}
      </div>
    </div>
  );
}
