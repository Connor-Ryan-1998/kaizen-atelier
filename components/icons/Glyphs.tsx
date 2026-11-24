import type { ReactNode } from "react";
import type { IconName } from "@/lib/windows";

const INK = "#1E1B18";
const V = "#D9472B";
const I = "#2C3E63";

const paths: Partial<Record<IconName, ReactNode>> = {
  services: (
    // wrench
    <>
      <path d="M14.5 4.5a4 4 0 0 0-4.6 5.4L4 15.8 6.2 18l5.9-5.9a4 4 0 0 0 5.4-4.6l-2.4 2.4-2.1-.6-.6-2.1z" fill={V} />
    </>
  ),
  work: (
    // folder
    <>
      <path d="M3 7.5V18a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-8.5L9.5 5.5H4a1 1 0 0 0-1 1z" fill="#FFF3A8" />
      <path d="M3 10h18" />
    </>
  ),
  process: (
    // route with waypoints
    <>
      <path d="M5 18c0-4 4-4 7-6s7-2 7-6" strokeDasharray="2 2.2" />
      <circle cx="5" cy="18" r="2" fill={V} />
      <circle cx="19" cy="6" r="2" fill={I} />
    </>
  ),
  about: (
    // person
    <>
      <circle cx="12" cy="8.5" r="3.5" fill="#FFF3A8" />
      <path d="M5 19.5c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5z" fill={I} />
    </>
  ),
  pricing: (
    // receipt
    <>
      <path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" fill="#FBF7EF" />
      <path d="M9 8h6M9 11h6M9 14h3.5" />
      <circle cx="15.5" cy="14" r=".6" fill={V} stroke={V} />
    </>
  ),
  contact: (
    // envelope
    <>
      <rect x="3" y="6" width="18" height="12.5" rx="1" fill="#FBF7EF" />
      <path d="M3.5 6.5 12 13l8.5-6.5" stroke={V} />
    </>
  ),
  cv: (
    // document with folded corner
    <>
      <path d="M6 3.5h8.5L18.5 7.5v13H6z" fill="#FBF7EF" />
      <path d="M14.5 3.5v4h4" />
      <path d="M8.5 11h7M8.5 14h7M8.5 17h4.5" stroke={I} />
    </>
  ),
  blog: (
    // notepad + pencil
    <>
      <rect x="4.5" y="4.5" width="12" height="15" rx="1" fill="#FFF3A8" />
      <path d="M7 9h7M7 12h7M7 15h4" />
      <path d="M19.5 8.5 14 17l-1.5.8.2-1.7 5.5-8.4z" fill={V} />
    </>
  ),
  homelab: (
    // server rack
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1" fill="#FBF7EF" />
      <path d="M5 9h14M5 14.5h14" />
      <circle cx="8" cy="6.3" r=".8" fill={V} stroke={V} />
      <circle cx="8" cy="11.8" r=".8" fill={I} stroke={I} />
      <circle cx="8" cy="17.3" r=".8" fill={V} stroke={V} />
      <path d="M11 6.3h5M11 11.8h5M11 17.3h5" />
    </>
  ),
  pipelines: (
    // pipe elbow with drip
    <>
      <path d="M3 8h9a4 4 0 0 1 4 4v8.5h-4.5V13H3z" fill="#5E8C5A" />
      <path d="M2.5 6.5v8M10.5 21h7" strokeWidth="2" />
      <path d="M20 14c0 1.2-.7 2-1.5 2S17 15.2 17 14c0-1 1.5-3 1.5-3S20 13 20 14z" fill={I} />
    </>
  ),
  demo: (
    // film frame with play
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" fill="#FBF7EF" />
      <path d="M6 5v14M18 5v14" strokeDasharray="1.6 1.6" />
      <path d="M10 9.2v5.6l4.6-2.8z" fill={V} />
    </>
  ),
  trash: (
    // bin
    <>
      <path d="M6 7.5h12l-1 12.5H7z" fill="#FBF7EF" />
      <path d="M4.5 7.5h15M9.5 7.5V5h5v2.5M10 11v6M14 11v6" />
    </>
  ),
};

export function Glyph({ name, className = "h-7 w-7" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      stroke={INK}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
