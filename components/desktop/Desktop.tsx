"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type RefObject,
} from "react";
import { focused, initialState, reducer, type DeskState, type Pos } from "@/lib/windowState";
import { LEGACY_HASHES, WINDOWS, getWindow, windowForPath, type WindowId } from "@/lib/windows";
import { DesktopIcon } from "./DesktopIcon";
import { MenuBar } from "./MenuBar";
import { useIsDesktop } from "./useIsDesktop";
import { WindowFrame } from "./WindowFrame";
import { WINDOW_CONTENT } from "./windowContent";

export interface DeskApi {
  state: DeskState;
  open(id: WindowId, hash?: string): void;
  close(id: WindowId): void;
  focus(id: WindowId): void;
  toggleMax(id: WindowId): void;
  move(id: WindowId, pos: Pos): void;
  /** The desk area element (below the menu bar), used for drag bounds. */
  deskRef: RefObject<HTMLDivElement | null>;
  /** True once the user has interacted; windows only grab focus after this. */
  interacted: RefObject<boolean>;
}

const DeskContext = createContext<DeskApi | null>(null);

export function useDesk(): DeskApi {
  const ctx = useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside <Desktop>");
  return ctx;
}

export function Desktop() {
  const pathname = usePathname();
  const [state, dispatch] = useReducer(reducer, pathname, (p) => initialState(windowForPath(p)));
  const isDesktop = useIsDesktop();
  const deskRef = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const top = focused(state);
  const topRef = useRef(top);
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    topRef.current = top;
    stateRef.current = state;
  });

  const open = useCallback((id: WindowId, hash?: string) => {
    interacted.current = true;
    if (hash && id !== "notFound") {
      window.history.pushState(null, "", getWindow(id).route + hash);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    dispatch({ type: "open", id });
  }, []);

  const close = useCallback(
    (id: WindowId) => {
      interacted.current = true;
      if (isDesktop) {
        dispatch({ type: "close", id });
      } else {
        // Phones: closing any window goes back to the home grid.
        for (const w of stateRef.current.open) dispatch({ type: "close", id: w });
      }
    },
    [isDesktop],
  );

  const focus = useCallback((id: WindowId) => dispatch({ type: "focus", id }), []);
  const toggleMax = useCallback((id: WindowId) => dispatch({ type: "toggleMax", id }), []);
  const move = useCallback((id: WindowId, pos: Pos) => dispatch({ type: "move", id, pos }), []);

  // Focus -> URL.
  useEffect(() => {
    if (top === "notFound") return;
    const route = top ? getWindow(top).route : "/";
    if (route !== window.location.pathname) window.history.pushState(null, "", route);
  }, [top]);

  // URL (back/forward) -> focus. Listen to popstate directly: usePathname does not
  // reliably update for entries we created with pushState. "/" never re-opens anything.
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (path === "/") return;
      const id = windowForPath(path);
      if (id !== topRef.current) dispatch({ type: "open", id });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Old single-page anchors (/#about, /#process, ...).
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const id = LEGACY_HASHES[window.location.hash.slice(1)];
    if (!id) return;
    window.history.replaceState(null, "", getWindow(id).route);
    dispatch({ type: "open", id });
  }, []);

  const api = useMemo<DeskApi>(
    () => ({ state, open, close, focus, toggleMax, move, deskRef, interacted }),
    [state, open, close, focus, toggleMax, move],
  );

  const left = WINDOWS.filter((w) => w.side === "left");
  const right = WINDOWS.filter((w) => w.side === "right");
  // Stable DOM order (registry order) so iframes never reload on focus; z-order via style.
  const openWindows = WINDOWS.filter((w) => state.open.includes(w.id));

  return (
    <DeskContext.Provider value={api}>
      <div className="fixed inset-0 flex flex-col">
        <MenuBar />
        <div ref={deskRef} className="relative flex-1 overflow-hidden">
          <nav aria-label="Desktop" className="contents">
            <ul className="absolute left-4 top-4 flex flex-col gap-3">
              {left.map((w) => (
                <li key={w.id}>
                  <DesktopIcon id={w.id} />
                </li>
              ))}
            </ul>
            <ul className="absolute right-4 top-4 flex flex-col gap-3">
              {right.map((w) => (
                <li key={w.id}>
                  <DesktopIcon id={w.id} />
                </li>
              ))}
            </ul>
          </nav>
          <AnimatePresence>
            {openWindows.map((w) => {
              const Content = WINDOW_CONTENT[w.id];
              return (
                <WindowFrame key={w.id} id={w.id}>
                  <Content />
                </WindowFrame>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </DeskContext.Provider>
  );
}
