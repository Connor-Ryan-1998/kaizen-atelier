"use client";

import { useState } from "react";

export function StickyNote() {
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  return (
    <aside
      role="note"
      className="absolute bottom-10 right-[140px] z-[5] w-[210px] -rotate-2 border-[1.5px] border-ink bg-note px-4 py-3 text-[13px] leading-snug shadow-hard max-md:hidden"
    >
      <button
        type="button"
        aria-label="Dismiss note"
        onClick={() => setShown(false)}
        className="absolute right-1.5 top-0.5 text-base leading-none text-muted hover:text-ink"
      >
        ×
      </button>
      Drag the windows around. Dashed icons are… not important. Probably.
    </aside>
  );
}
