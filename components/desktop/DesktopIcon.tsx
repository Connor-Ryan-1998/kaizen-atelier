"use client";

import { Glyph } from "@/components/icons/Glyphs";
import { getWindow, type WindowId } from "@/lib/windows";
import { useDesk } from "./Desktop";

export function DesktopIcon({ id }: { id: WindowId }) {
  const { open } = useDesk();
  const w = getWindow(id);
  return (
    <button
      type="button"
      data-icon={id}
      onClick={() => open(id)}
      className="group flex w-[92px] flex-col items-center gap-1.5 rounded-md p-1.5 text-center outline-none hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-vermilion max-md:w-full"
    >
      <span
        aria-hidden
        className={
          "grid h-[52px] w-[52px] place-items-center rounded-[10px] border-[1.5px] border-ink bg-surface transition-transform group-active:translate-x-px group-active:translate-y-px " +
          (w.egg ? "border-dashed" : "shadow-hard")
        }
      >
        <Glyph name={id} />
      </span>
      <span className="font-mono text-[11.5px] font-semibold leading-tight">
        {/* Allow line breaks after "_" and "." in filenames instead of mid-word. */}
        {w.iconLabel.replace(/([_.])/g, "$1​")}
      </span>
    </button>
  );
}
