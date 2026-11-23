"use client";

import { useEffect, useState } from "react";
import { BOOKING_URL } from "@/lib/site";
import { Body, Button, ButtonRow, FinePrint, Title } from "./ui";

const SERVICES = [
  {
    id: "automation",
    name: "Automation & modernisation",
    desc: "Kill the copy-paste. I replace manual, error-prone busywork with workflows that run while you sleep.",
  },
  {
    id: "pipelines",
    name: "Data pipelines",
    desc: "Your data, from wherever it hides, to wherever it's useful. Reliably, on schedule, with alerts before anyone notices.",
  },
  {
    id: "analytics",
    name: "Analytics",
    desc: "Dashboards people actually open. Metrics tied to decisions, not vanity.",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    desc: "Cloud, hybrid or the cupboard under the stairs. Secure, documented, and not quietly costing you a fortune.",
  },
] as const;

function currentHash() {
  return typeof window === "undefined" ? "" : window.location.hash.slice(1);
}

export function ServicesWindow() {
  // Starts null on server and client (no hydration mismatch); the hash is applied after mount.
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    const apply = () => {
      const h = currentHash();
      if (SERVICES.some((s) => s.id === h)) setHighlighted(h);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    if (!highlighted) return;
    document.getElementById(highlighted)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const t = setTimeout(() => setHighlighted(null), 2000);
    return () => clearTimeout(t);
  }, [highlighted]);

  return (
    <div>
      <Title>Things I&apos;m suspiciously good at</Title>
      <Body>
        Four disciplines that compound. Most clients start with one and end up with all four. I&apos;m not saying
        that&apos;s the plan. I&apos;m not <em>not</em> saying it.
      </Body>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {SERVICES.map((s) => {
          const on = highlighted === s.id;
          return (
            <section
              key={s.id}
              id={s.id}
              data-highlighted={on ? "true" : undefined}
              className={
                "scroll-m-4 rounded-[7px] border-[1.5px] p-3.5 transition-colors duration-300 " +
                (on ? "border-vermilion bg-note" : "border-ink bg-paper")
              }
            >
              <h3 className="mb-1 text-[15px] font-bold">{s.name}</h3>
              <p className="text-[13px] leading-snug text-muted">{s.desc}</p>
            </section>
          );
        })}
      </div>
      <ButtonRow>
        <div className="mt-3">
          <Button variant="primary" href={BOOKING_URL}>
            Book a call
          </Button>
        </div>
      </ButtonRow>
      <FinePrint>&ldquo;Which one do I need?&rdquo; is a great first question.</FinePrint>
    </div>
  );
}
