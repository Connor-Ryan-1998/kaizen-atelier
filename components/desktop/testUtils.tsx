import { render } from "@testing-library/react";
import { createRef, type ReactElement } from "react";
import { initialState } from "@/lib/windowState";
import { DeskContext, type DeskApi } from "./Desktop";

/** Render a window's content with a stub desk API (for content-only tests). */
export function renderInDesk(ui: ReactElement, overrides: Partial<DeskApi> = {}) {
  const api: DeskApi = {
    state: initialState("welcome"),
    open: vi.fn(),
    close: vi.fn(),
    focus: vi.fn(),
    toggleMax: vi.fn(),
    move: vi.fn(),
    deskRef: createRef<HTMLDivElement>(),
    pendingFocusRef: { current: null },
    ...overrides,
  };
  return { api, ...render(<DeskContext.Provider value={api}>{ui}</DeskContext.Provider>) };
}
