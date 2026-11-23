"use client";

import { motion, useDragControls, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { clampPosition, focused } from "@/lib/windowState";
import { getWindow, type WindowId } from "@/lib/windows";
import { useDesk } from "./Desktop";
import { useIsDesktop } from "./useIsDesktop";

const TITLE_BAR = 34;

export function WindowFrame({ id, children }: { id: WindowId; children: ReactNode }) {
  const { state, close, focus, toggleMax, move, deskRef, interacted } = useDesk();
  const w = getWindow(id);
  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();
  const controls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const isTop = focused(state) === id;
  const maximized = state.maximized.includes(id);
  const pos = state.positions[id] ?? { x: 200, y: 48 };
  const z = state.open.indexOf(id) + 10;

  useEffect(() => {
    if (isTop && interacted.current) ref.current?.focus({ preventScroll: true });
  }, [isTop, interacted]);

  function handleClose() {
    close(id);
    const icon = document.querySelector<HTMLElement>(`[data-icon="${id}"]`);
    icon?.focus();
  }

  function handleDragEnd() {
    const desk = deskRef.current?.getBoundingClientRect();
    const next = { x: pos.x + x.get(), y: pos.y + y.get() };
    x.set(0);
    y.set(0);
    move(id, desk ? clampPosition(next, w.size, { w: desk.width, h: desk.height }) : next);
  }

  const hiddenOnPhone = id === "welcome" || !isTop;

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      drag={isDesktop && !maximized}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onPointerDown={() => focus(id)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          handleClose();
        }
      }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={{ duration: reduce ? 0 : 0.18 }}
      style={
        maximized
          ? { x, y, zIndex: z, left: 8, top: 8, right: 8, bottom: 8 }
          : {
              x,
              y,
              zIndex: z,
              left: pos.x,
              top: pos.y,
              width: w.size.w,
              maxWidth: "calc(100vw - 24px)",
              maxHeight: `min(${w.size.h}px, calc(100% - ${pos.y + 12}px))`,
            }
      }
      className={
        "absolute flex flex-col overflow-hidden rounded-lg border-[1.5px] border-ink bg-surface shadow-hard-lg outline-none " +
        "max-md:fixed! max-md:inset-0! max-md:left-0! max-md:top-[38px]! max-md:w-auto! max-md:max-w-none! max-md:max-h-none! max-md:rounded-none max-md:shadow-none " +
        (hiddenOnPhone ? "max-md:hidden " : "max-md:z-50! ")
      }
    >
      <div
        data-titlebar
        onPointerDown={(e) => {
          focus(id);
          if (isDesktop && !maximized) controls.start(e);
        }}
        style={{ height: TITLE_BAR, touchAction: "none" }}
        className="flex shrink-0 cursor-grab items-center gap-2 border-b-[1.5px] border-ink bg-paper px-2.5 select-none active:cursor-grabbing"
      >
        <button
          type="button"
          aria-label="Back to home"
          onClick={handleClose}
          className="rounded px-1.5 py-0.5 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-vermilion md:hidden"
        >
          ← Back
        </button>
        <div className="flex gap-1.5 max-md:hidden">
          <button
            type="button"
            aria-label={`Close ${w.title}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleClose}
            className="h-3 w-3 rounded-full border-[1.5px] border-ink bg-vermilion hover:brightness-110 focus-visible:ring-2 focus-visible:ring-indigo"
          />
          <button
            type="button"
            aria-label={`Maximise ${w.title}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleMax(id)}
            className="h-3 w-3 rounded-full border-[1.5px] border-ink bg-note hover:brightness-95 focus-visible:ring-2 focus-visible:ring-indigo max-md:hidden"
          />
          <span aria-hidden className="h-3 w-3 rounded-full border-[1.5px] border-ink max-md:hidden" />
        </div>
        <div id={titleId} className="flex-1 truncate text-center font-mono text-[13px] font-semibold">
          {w.title}
        </div>
        <div className="w-[48px]" aria-hidden />
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-6 py-5">{children}</div>
    </motion.div>
  );
}
