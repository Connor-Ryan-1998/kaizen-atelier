import { LINKEDIN_URL } from "@/lib/site";
import { Body, Title } from "./ui";

export function AboutWindow() {
  return (
    <div className="flex gap-5 max-sm:flex-col">
      <div
        aria-label="Photo placeholder"
        role="img"
        className="grid h-28 w-28 shrink-0 place-items-center rounded-md border-[1.5px] border-dashed border-ink bg-paper p-2 text-center font-mono text-[11px] text-muted"
      >
        photo loading… (eventually)
      </div>
      <div>
        <Title>Hi, I&apos;m Connor</Title>
        <Body>
          I started Kaizen Atelier because too many good businesses are stuck choosing between brittle legacy
          systems and overpriced &ldquo;solutions&rdquo;. It isn&apos;t a binary. <em>Kaizen</em> means continuous
          improvement; an <em>atelier</em> is a workshop where things are made by hand. That&apos;s the whole pitch.
        </Body>
        <Body>My homelab is fine. Don&apos;t check.</Body>
        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-indigo underline decoration-[1.5px] underline-offset-2 hover:text-vermilion-ink"
        >
          More on LinkedIn →
        </a>
      </div>
    </div>
  );
}
