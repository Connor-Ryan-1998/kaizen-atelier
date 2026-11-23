import { BOOKING_URL } from "@/lib/site";
import { Body, Button, FinePrint, Title } from "./ui";

export function PricingWindow() {
  return (
    <div>
      <Title>Pricing</Title>
      <p className="mb-3 text-[24px] font-bold tracking-[-0.02em]">
        It depends. <span className="text-vermilion-ink">(Genuinely.)</span>
      </p>
      <Body>
        Every business is different, so every engagement is too. What moves the number: how much needs building,
        how messy the starting point is, and whether you want me on call afterwards.
      </Body>
      <ul className="mb-4 space-y-1.5 text-[14px]">
        {["Fixed-price audits", "Project quotes up front", "Ongoing support by the month"].map((b) => (
          <li key={b} className="flex items-center gap-2">
            <span aria-hidden className="h-2 w-2 rounded-full border-[1.5px] border-ink bg-vermilion" />
            {b}
          </li>
        ))}
      </ul>
      <Button variant="primary" href={BOOKING_URL}>
        Book a free chat
      </Button>
      <FinePrint>I&apos;ll give you a real number, not a &ldquo;starting from&rdquo;.</FinePrint>
    </div>
  );
}
