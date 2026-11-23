import { LEGACY_HASHES, MENUS, WINDOWS, getWindow, slugs, windowForPath } from "./windows";

describe("windowForPath", () => {
  test("maps routes to window ids", () => {
    expect(windowForPath("/")).toBe("welcome");
    expect(windowForPath("/services")).toBe("services");
    expect(windowForPath("/services/")).toBe("services");
  });
  test("unknown paths map to notFound", () => {
    expect(windowForPath("/nope")).toBe("notFound");
  });
});

test("slugs() lists the 12 routable windows", () => {
  const s = slugs();
  expect(s).toHaveLength(12);
  expect(s).toContain("trash");
  expect(s).not.toContain("404");
  expect(s).not.toContain("");
});

test("icon columns are in spec order", () => {
  const ids = (side: string) => WINDOWS.filter((w) => w.side === side).map((w) => w.id);
  expect(ids("left")).toEqual(["services", "work", "process", "about", "pricing"]);
  expect(ids("right")).toEqual(["contact", "cv", "notes", "homelab", "pipelines", "demo", "trash"]);
});

test("easter eggs are not indexed", () => {
  for (const w of WINDOWS.filter((w) => w.egg)) expect(w.indexed).toBe(false);
});

test("routes are unique", () => {
  const routes = WINDOWS.map((w) => w.route);
  expect(new Set(routes).size).toBe(routes.length);
});

test("legacy hashes map to windows", () => {
  expect(LEGACY_HASHES).toEqual({
    about: "about",
    process: "process",
    services: "services",
    contact: "contact",
  });
});

test("every menu item targets a real window", () => {
  for (const m of MENUS) for (const i of m.items) expect(getWindow(i.id).id).toBe(i.id);
});
