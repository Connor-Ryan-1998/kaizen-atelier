import Image from "next/image";
import { SPAGHETTI } from "@/lib/site";

const link = "font-semibold text-indigo underline decoration-[1.5px] underline-offset-2 hover:text-vermilion-ink";

export function HomelabWindow() {
  return (
    <figure>
      <Image
        src={SPAGHETTI.src}
        alt={SPAGHETTI.alt}
        width={SPAGHETTI.width}
        height={SPAGHETTI.height}
        sizes="(min-width: 768px) 520px, 100vw"
        className="h-auto w-full rounded-md border-[1.5px] border-ink"
      />
      <figcaption className="mt-2 font-mono text-[13px]">fig. 1 — current network topology.</figcaption>
      <p className="mt-3 text-sm text-muted">
        Further reading:{" "}
        <a href="https://en.wikipedia.org/wiki/Spaghetti" target="_blank" rel="noopener noreferrer" className={link}>
          Spaghetti — Wikipedia
        </a>
      </p>
      <p className="mt-1 text-[11px] text-muted">
        <a href={SPAGHETTI.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          Photo: {SPAGHETTI.credit}, {SPAGHETTI.license}
        </a>
      </p>
    </figure>
  );
}
