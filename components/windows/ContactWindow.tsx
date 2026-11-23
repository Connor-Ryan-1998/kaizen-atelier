"use client";

import { useIsDesktop } from "@/components/desktop/useIsDesktop";
import { BOOKING_EMBED_URL, BOOKING_URL, EMAIL, LINKEDIN_URL, MAILTO } from "@/lib/site";
import { Body, Button, ButtonRow, FinePrint, Title } from "./ui";

const link = "font-semibold text-indigo underline decoration-[1.5px] underline-offset-2 hover:text-vermilion-ink";

export function ContactWindow() {
  const isDesktop = useIsDesktop();
  return (
    <div>
      <Title>Contact.exe</Title>
      <Body>
        The fastest way is to grab an hour on my calendar. You talk, I listen, and you leave with at least one
        useful idea, even if we never work together.
      </Body>
      <ButtonRow>
        <Button variant="primary" href={BOOKING_URL}>
          Book a call
        </Button>
        <span className="text-sm text-muted">
          or email{" "}
          <a href={MAILTO} className={link}>
            {EMAIL}
          </a>{" "}
          · or find me on{" "}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={link}>
            LinkedIn
          </a>
        </span>
      </ButtonRow>
      <FinePrint>
        Replies usually within one business day. Faster if the subject line includes &ldquo;spaghetti&rdquo;.
      </FinePrint>
      {isDesktop && (
        <div className="mt-5">
          <iframe
            title="Book a call with Connor"
            src={BOOKING_EMBED_URL}
            loading="lazy"
            className="h-[600px] w-full rounded-md border-[1.5px] border-ink bg-white"
          />
          <p className="mt-2 text-xs text-muted">
            Calendar not loading?{" "}
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={link}>
              Open it in a new tab →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
