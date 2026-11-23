"use client";

import { useState } from "react";

const FILES = [
  { name: "synergy.pptx", quip: "Deleted for everyone's sake." },
  { name: "blockchain_strategy_2021.docx", quip: "We don't talk about 2021." },
  { name: "just_use_excel.xlsx", quip: "Restored 47 times." },
];

export function TrashWindow() {
  const [selected, setSelected] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const quip = FILES.find((f) => f.name === selected)?.quip;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between border-b-[1.5px] border-dashed border-ink/40 pb-2 font-mono text-xs text-muted">
        <span>{FILES.length} items</span>
        <button
          type="button"
          onClick={() => setDenied(true)}
          className="rounded border-[1.5px] border-ink bg-surface px-2 py-0.5 font-sans font-semibold text-ink shadow-[2px_2px_0_var(--color-ink)]"
        >
          Empty trash
        </button>
      </div>
      <ul className="space-y-1">
        {FILES.map((f) => (
          <li key={f.name}>
            <button
              type="button"
              onClick={() => setSelected(f.name)}
              aria-pressed={selected === f.name}
              className={
                "w-full rounded px-2 py-1.5 text-left font-mono text-sm hover:bg-paper " +
                (selected === f.name ? "bg-note" : "")
              }
            >
              {f.name}
            </button>
          </li>
        ))}
      </ul>
      <div aria-live="polite" className="mt-3 min-h-[1.5rem] text-sm">
        {denied ? (
          <p className="font-semibold text-vermilion-ink">Permission denied. Some things are forever.</p>
        ) : quip ? (
          <p className="text-muted">{quip}</p>
        ) : null}
      </div>
    </div>
  );
}
