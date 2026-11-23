import { getWindow } from "@/lib/windows";

export function AboutWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("about").title}</h2>;
}
