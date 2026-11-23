import { BOOKING_URL, LINKEDIN_URL } from "@/lib/site";
import { Body, Button, ButtonRow } from "./ui";

export function CvWindow() {
  return (
    <div>
      <p className="mb-2 font-mono text-sm">
        CV.pdf is still compiling<span className="animate-pulse">…</span>
      </p>
      <Body>In the meantime, LinkedIn has the receipts.</Body>
      <ButtonRow>
        <Button variant="primary" href={LINKEDIN_URL}>
          View on LinkedIn
        </Button>
        <Button href={BOOKING_URL}>Book a call</Button>
      </ButtonRow>
    </div>
  );
}
