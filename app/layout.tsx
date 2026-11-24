import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Desktop } from "@/components/desktop/Desktop";
import { BlogPostsProvider } from "@/components/windows/BlogWindow";
import { getBlogPosts } from "@/lib/blog";
import { HOME_TITLE, TITLE_TEMPLATE } from "@/lib/titles";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: HOME_TITLE,
    template: TITLE_TEMPLATE,
  },
  description:
    "Data, automation and infrastructure built around how your business actually works.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = await getBlogPosts();
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexMono.variable} antialiased`}>
        <BlogPostsProvider posts={posts}>
          <Desktop />
        </BlogPostsProvider>
        {children}
      </body>
    </html>
  );
}
