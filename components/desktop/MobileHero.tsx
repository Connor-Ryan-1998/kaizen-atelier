import { BOOKING_URL } from "@/lib/site";

/** Compact welcome card shown above the home-screen grid on phones. */
export function MobileHero() {
  return (
    <section className="mx-4 mt-4 rounded-lg border-[1.5px] border-ink bg-surface p-5 shadow-hard-lg md:hidden">
      <p className="mb-3 inline-block rounded-full border-[1.5px] border-ink bg-paper px-2.5 py-0.5 text-xs font-bold">
        IT &amp; data consulting
      </p>
      <h1 className="text-[28px] font-bold leading-[1.05] tracking-[-0.03em]">
        Your business is weird. <span className="text-vermilion">Your systems should be too.</span>
      </h1>
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-md border-[1.5px] border-ink bg-vermilion px-4 py-2 text-sm font-bold text-white shadow-hard"
      >
        Book a free chat
      </a>
    </section>
  );
}
