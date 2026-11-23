import { BOOKING_URL } from "@/lib/site";
import { Body, Button, EmptyFolder } from "./ui";

export type CaseStudy = { title: string; summary: string; href?: string };

/** Add case studies here; the folder renders them as file tiles. */
export const CASE_STUDIES: CaseStudy[] = [];

export function WorkWindow({ items = CASE_STUDIES }: { items?: CaseStudy[] }) {
  return (
    <EmptyFolder count={items.length}>
      {items.length === 0 ? (
        <>
          <Body>
            The NDAs are winning. Real case studies are on the way. In the meantime, ask me on a call — I can tell
            you what I&apos;ve built, just not who for.
          </Body>
          <Button variant="primary" href={BOOKING_URL}>
            Book a call
          </Button>
        </>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {items.map((c) => (
            <li key={c.title} className="rounded-[7px] border-[1.5px] border-ink bg-paper p-3">
              <h3 className="font-mono text-sm font-semibold">{c.href ? <a href={c.href}>{c.title}</a> : c.title}</h3>
              <p className="mt-1 text-[13px] text-muted">{c.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </EmptyFolder>
  );
}
