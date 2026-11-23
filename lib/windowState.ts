import type { WindowId } from "./windows";

export interface Pos {
  x: number;
  y: number;
}

export interface DeskState {
  /** Open windows in z-order; last = top/focused. */
  open: WindowId[];
  positions: Partial<Record<WindowId, Pos>>;
  maximized: WindowId[];
}

export type DeskAction =
  | { type: "open"; id: WindowId }
  | { type: "close"; id: WindowId }
  | { type: "focus"; id: WindowId }
  | { type: "toggleMax"; id: WindowId }
  | { type: "move"; id: WindowId; pos: Pos };

export function cascadePos(index: number): Pos {
  const step = 24 * (index % 8);
  return { x: 200 + step, y: 48 + step };
}

function defaultPos(id: WindowId, index: number): Pos {
  return id === "welcome" ? { x: 140, y: 32 } : cascadePos(index);
}

export function initialState(id: WindowId): DeskState {
  return { open: [id], positions: { [id]: defaultPos(id, 0) }, maximized: [] };
}

export function focused(s: DeskState): WindowId | null {
  return s.open.length ? s.open[s.open.length - 1] : null;
}

export function reducer(s: DeskState, a: DeskAction): DeskState {
  switch (a.type) {
    case "open": {
      if (s.open.includes(a.id)) return reducer(s, { type: "focus", id: a.id });
      const positions = s.positions[a.id]
        ? s.positions
        : { ...s.positions, [a.id]: defaultPos(a.id, s.open.length) };
      return { ...s, open: [...s.open, a.id], positions };
    }
    case "focus": {
      if (!s.open.includes(a.id) || focused(s) === a.id) return s;
      return { ...s, open: [...s.open.filter((w) => w !== a.id), a.id] };
    }
    case "close": {
      if (!s.open.includes(a.id)) return s;
      return {
        ...s,
        open: s.open.filter((w) => w !== a.id),
        maximized: s.maximized.filter((w) => w !== a.id),
      };
    }
    case "toggleMax": {
      const maximized = s.maximized.includes(a.id)
        ? s.maximized.filter((w) => w !== a.id)
        : [...s.maximized, a.id];
      return { ...s, maximized };
    }
    case "move":
      return { ...s, positions: { ...s.positions, [a.id]: a.pos } };
  }
}

/** Keep at least 80px of the window and its 34px title bar inside the bounds. */
export function clampPosition(
  p: Pos,
  size: { w: number; h: number },
  bounds: { w: number; h: number },
): Pos {
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));
  return {
    x: clamp(p.x, 80 - size.w, bounds.w - 80),
    y: clamp(p.y, 0, bounds.h - 34),
  };
}
