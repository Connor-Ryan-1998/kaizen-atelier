import type { Metadata } from "next";
import { getWindow, slugs, windowForPath } from "@/lib/windows";

// The visible UI is the <Desktop> in the root layout; this route only supplies metadata.
export const dynamicParams = false;

export function generateStaticParams() {
  return slugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = getWindow(windowForPath(`/${slug}`));
  return {
    title: w.title,
    description: w.description,
    robots: w.indexed ? undefined : { index: false },
  };
}

export default function WindowPage() {
  return null;
}
