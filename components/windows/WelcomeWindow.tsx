"use client";

import { useDesk } from "@/components/desktop/Desktop";
import { BOOKING_URL } from "@/lib/site";
import { Body, Button, ButtonRow, FinePrint, Pill } from "./ui";

export function WelcomeWindow() {
  const { open } = useDesk();
  return (
    <div>
      <Pill>IT &amp; data consulting</Pill>
      <h1 className="mb-3 text-[34px] font-bold leading-[1.05] tracking-[-0.03em]">
        Your business is weird.
        <br />
        <span className="text-vermilion">Your systems should be too.</span>
      </h1>
      <Body>
        Not a 20-year-old legacy system held together by one guy named Steve. Not a seven-figure ERP you&apos;ll
        regret by Q3. I learn how your business <em>actually</em> runs, then build the data, automation and
        infrastructure that fits it.
      </Body>
      <ButtonRow>
        <Button variant="primary" href={BOOKING_URL}>
          Book a free chat
        </Button>
        <Button onClick={() => open("services")}>See what I do</Button>
      </ButtonRow>
      <FinePrint>Free chats are actually free. No &ldquo;discovery workshop&rdquo; invoice later.</FinePrint>
    </div>
  );
}
