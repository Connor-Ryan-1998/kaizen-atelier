"use client";

import { useEffect, useRef, useState } from "react";
import { WorkshopLogo } from "@/components/icons/WorkshopLogo";
import { BOOKING_URL } from "@/lib/site";
import { MENUS, type MenuItem } from "@/lib/windows";
import { Clock } from "./Clock";
import { useDesk } from "./Desktop";

const itemClass =
  "rounded px-2 py-1 text-sm hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion";

export function MenuBar() {
  const { open } = useDesk();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [openMenu]);

  function choose(item: MenuItem) {
    setOpenMenu(null);
    open(item.id, item.hash);
  }

  return (
    <header
      ref={barRef}
      className="relative z-[100] flex h-[38px] shrink-0 items-center gap-2 border-b-[1.5px] border-ink bg-surface px-3"
    >
      <button
        type="button"
        onClick={() => open("welcome")}
        className={"flex items-center gap-2 font-bold tracking-tight " + itemClass}
      >
        <WorkshopLogo />
        Kaizen Atelier
      </button>

      <nav aria-label="Main" className="flex items-center gap-1 max-md:hidden">
        {MENUS.map((menu) =>
          menu.items.length === 1 ? (
            <button key={menu.label} type="button" className={itemClass} onClick={() => choose(menu.items[0])}>
              {menu.label}
            </button>
          ) : (
            <div key={menu.label} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openMenu === menu.label}
                className={itemClass + (openMenu === menu.label ? " bg-paper" : "")}
                onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
              >
                {menu.label} <span aria-hidden>▾</span>
              </button>
              {openMenu === menu.label && (
                <ul
                  role="menu"
                  aria-label={menu.label}
                  className="absolute left-0 top-[calc(100%+6px)] min-w-[220px] rounded-md border-[1.5px] border-ink bg-surface p-1 shadow-hard"
                >
                  {menu.items.map((item) => (
                    <li key={item.label} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => choose(item)}
                        className={"block w-full text-left " + itemClass}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ),
        )}
      </nav>

      <div className="flex-1" />
      <Clock />
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border-[1.5px] border-ink bg-vermilion px-3 py-1 text-sm font-bold text-white shadow-[2px_2px_0_var(--color-ink)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo"
      >
        Book a call
      </a>
    </header>
  );
}
