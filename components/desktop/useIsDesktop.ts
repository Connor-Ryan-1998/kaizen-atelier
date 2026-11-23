"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";

function subscribe(cb: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

function getSnapshot() {
  // Environments without matchMedia (e.g. jsdom) are treated as desktop.
  return typeof window.matchMedia === "function" ? window.matchMedia(QUERY).matches : true;
}

/** True at ≥ 768px. Always false during server rendering. */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
