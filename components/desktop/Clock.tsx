"use client";

import { useEffect, useState } from "react";

/** Renders empty on the server; shows HH:MM after mount to avoid hydration mismatch. */
export function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <time
      dateTime={now?.toISOString()}
      className="font-mono text-[13px] tabular-nums text-muted max-md:hidden"
      suppressHydrationWarning
    >
      {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
    </time>
  );
}
