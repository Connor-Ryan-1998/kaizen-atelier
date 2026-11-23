import { clampPosition, focused, initialState, reducer } from "./windowState";

test("initialState opens and focuses the given window", () => {
  const s = initialState("services");
  expect(s.open).toEqual(["services"]);
  expect(focused(s)).toBe("services");
  expect(s.positions.services).toBeDefined();
});

test("opening an already-open window focuses it without duplicating", () => {
  let s = initialState("services");
  s = reducer(s, { type: "open", id: "about" });
  expect(s.open).toEqual(["services", "about"]);
  s = reducer(s, { type: "open", id: "services" });
  expect(s.open).toEqual(["about", "services"]);
});

test("focus moves a window to the top; focusing a closed window is a no-op", () => {
  let s = reducer(initialState("services"), { type: "open", id: "about" });
  s = reducer(s, { type: "focus", id: "services" });
  expect(focused(s)).toBe("services");
  const before = s;
  expect(reducer(s, { type: "focus", id: "trash" })).toBe(before);
});

test("closing the focused window focuses the previous; closing the last leaves none", () => {
  let s = reducer(initialState("services"), { type: "open", id: "about" });
  s = reducer(s, { type: "close", id: "about" });
  expect(focused(s)).toBe("services");
  s = reducer(s, { type: "close", id: "services" });
  expect(focused(s)).toBeNull();
});

test("toggleMax toggles; close clears maximised", () => {
  let s = initialState("services");
  s = reducer(s, { type: "toggleMax", id: "services" });
  expect(s.maximized).toEqual(["services"]);
  s = reducer(s, { type: "toggleMax", id: "services" });
  expect(s.maximized).toEqual([]);
  s = reducer(s, { type: "toggleMax", id: "services" });
  s = reducer(s, { type: "close", id: "services" });
  expect(s.maximized).toEqual([]);
});

test("move stores a position that survives close and reopen", () => {
  let s = initialState("services");
  s = reducer(s, { type: "move", id: "services", pos: { x: 333, y: 111 } });
  s = reducer(s, { type: "close", id: "services" });
  s = reducer(s, { type: "open", id: "services" });
  expect(s.positions.services).toEqual({ x: 333, y: 111 });
});

test("reducer does not mutate state", () => {
  const s = initialState("services");
  const snapshot = JSON.stringify(s);
  reducer(s, { type: "open", id: "about" });
  reducer(s, { type: "move", id: "services", pos: { x: 1, y: 1 } });
  expect(JSON.stringify(s)).toBe(snapshot);
});

describe("clampPosition keeps the title bar reachable", () => {
  const size = { w: 500, h: 400 };
  const bounds = { w: 1024, h: 562 };
  test("far top-left", () => {
    expect(clampPosition({ x: -2000, y: -50 }, size, bounds)).toEqual({ x: -420, y: 0 });
  });
  test("far bottom-right", () => {
    expect(clampPosition({ x: 5000, y: 5000 }, size, bounds)).toEqual({ x: 944, y: 528 });
  });
  test("in range is unchanged", () => {
    expect(clampPosition({ x: 100, y: 100 }, size, bounds)).toEqual({ x: 100, y: 100 });
  });
});
