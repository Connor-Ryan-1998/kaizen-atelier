export type WindowId =
  | "welcome"
  | "services"
  | "work"
  | "process"
  | "about"
  | "pricing"
  | "contact"
  | "cv"
  | "notes"
  | "homelab"
  | "pipelines"
  | "demo"
  | "trash"
  | "notFound";

export type IconName = WindowId;

export interface WindowDef {
  id: WindowId;
  /** Window title bar text. */
  title: string;
  /** Label under the desktop icon. */
  iconLabel: string;
  route: string;
  side: "left" | "right" | "none";
  egg: boolean;
  indexed: boolean;
  description: string;
  /** Default desktop size in px. */
  size: { w: number; h: number };
}

export const WINDOWS: readonly WindowDef[] = [
  {
    id: "welcome",
    title: "welcome.md",
    iconLabel: "Welcome",
    route: "/",
    side: "none",
    egg: false,
    indexed: true,
    description:
      "Data, automation and infrastructure built around how your business actually works.",
    size: { w: 580, h: 420 },
  },
  // Left column: the hiring path
  {
    id: "services",
    title: "Services",
    iconLabel: "Services",
    route: "/services",
    side: "left",
    egg: false,
    indexed: true,
    description:
      "Automation, data pipelines, analytics and infrastructure — four disciplines that compound.",
    size: { w: 620, h: 520 },
  },
  {
    id: "work",
    title: "Case studies",
    iconLabel: "Case studies",
    route: "/work",
    side: "left",
    egg: false,
    indexed: true,
    description: "Case studies from Kaizen Atelier. The NDAs are winning, for now.",
    size: { w: 520, h: 380 },
  },
  {
    id: "process",
    title: "How I work",
    iconLabel: "How I work",
    route: "/process",
    side: "left",
    egg: false,
    indexed: true,
    description: "Audit, blueprint, iterate. A plain-English process with no 90-slide deck.",
    size: { w: 560, h: 480 },
  },
  {
    id: "about",
    title: "About me",
    iconLabel: "About me",
    route: "/about",
    side: "left",
    egg: false,
    indexed: true,
    description: "Hi, I'm Connor. Why Kaizen Atelier exists and what continuous improvement means here.",
    size: { w: 540, h: 480 },
  },
  {
    id: "pricing",
    title: "Pricing",
    iconLabel: "Pricing",
    route: "/pricing",
    side: "left",
    egg: false,
    indexed: true,
    description: "Pricing: it depends, genuinely. Fixed-price audits, upfront project quotes, monthly support.",
    size: { w: 520, h: 460 },
  },
  // Right column: act or explore
  {
    id: "contact",
    title: "Contact.exe",
    iconLabel: "Contact.exe",
    route: "/contact",
    side: "right",
    egg: false,
    indexed: true,
    description: "Grab an hour on my calendar, or send an email. Either way, you leave with a useful idea.",
    size: { w: 720, h: 640 },
  },
  {
    id: "cv",
    title: "CV.pdf",
    iconLabel: "CV.pdf",
    route: "/cv",
    side: "right",
    egg: false,
    indexed: true,
    description: "Connor's CV. Still compiling — LinkedIn has the receipts in the meantime.",
    size: { w: 460, h: 320 },
  },
  {
    id: "notes",
    title: "Notes",
    iconLabel: "Notes",
    route: "/notes",
    side: "right",
    egg: false,
    indexed: true,
    description: "Writing about data, automation and homelabs. Coming soon, allegedly.",
    size: { w: 460, h: 300 },
  },
  {
    id: "homelab",
    title: "homelab_infra/",
    iconLabel: "homelab_infra/",
    route: "/homelab",
    side: "right",
    egg: true,
    indexed: false,
    description: "fig. 1 — current network topology.",
    size: { w: 560, h: 520 },
  },
  {
    id: "pipelines",
    title: "data_pipelines.exe — running",
    iconLabel: "data_pipelines.exe",
    route: "/pipelines",
    side: "right",
    egg: true,
    indexed: false,
    description: "Two certified pipeline engineers inspecting your ETL.",
    size: { w: 560, h: 440 },
  },
  {
    id: "demo",
    title: "live_demo.mp4",
    iconLabel: "live_demo.mp4",
    route: "/demo",
    side: "right",
    egg: true,
    indexed: false,
    description: "Live demos never fail. This is a recording.",
    size: { w: 640, h: 460 },
  },
  {
    id: "trash",
    title: "Trash",
    iconLabel: "Trash",
    route: "/trash",
    side: "right",
    egg: true,
    indexed: false,
    description: "Some things are forever.",
    size: { w: 460, h: 380 },
  },
  {
    id: "notFound",
    title: "404.txt",
    iconLabel: "404.txt",
    route: "/404",
    side: "none",
    egg: false,
    indexed: false,
    description: "This file doesn't exist.",
    size: { w: 420, h: 240 },
  },
];

const byId = new Map(WINDOWS.map((w) => [w.id, w]));

export function getWindow(id: WindowId): WindowDef {
  const w = byId.get(id);
  if (!w) throw new Error(`Unknown window: ${id}`);
  return w;
}

export function windowForPath(pathname: string): WindowId {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const match = WINDOWS.find((w) => w.id !== "notFound" && w.route === clean);
  return match ? match.id : "notFound";
}

export function slugs(): string[] {
  return WINDOWS.filter((w) => w.route !== "/" && w.id !== "notFound").map((w) => w.route.slice(1));
}

export const LEGACY_HASHES: Record<string, WindowId> = {
  about: "about",
  process: "process",
  services: "services",
  contact: "contact",
};

export interface MenuItem {
  label: string;
  id: WindowId;
  hash?: string;
}

export const MENUS: { label: string; items: MenuItem[] }[] = [
  {
    label: "Services",
    items: [
      { label: "Automation & modernisation", id: "services", hash: "#automation" },
      { label: "Data pipelines", id: "services", hash: "#pipelines" },
      { label: "Analytics", id: "services", hash: "#analytics" },
      { label: "Infrastructure", id: "services", hash: "#infrastructure" },
    ],
  },
  {
    label: "Work",
    items: [
      { label: "Case studies", id: "work" },
      { label: "How I work", id: "process" },
      { label: "Pricing", id: "pricing" },
    ],
  },
  { label: "About", items: [{ label: "About", id: "about" }] },
  {
    label: "More",
    items: [
      { label: "Contact", id: "contact" },
      { label: "CV", id: "cv" },
      { label: "Notes", id: "notes" },
      { label: "Trash", id: "trash" },
      { label: "live_demo.mp4", id: "demo" },
    ],
  },
];
