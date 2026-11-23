import { getWindow } from "@/lib/windows";

export function HomelabWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("homelab").title}</h2>;
}
