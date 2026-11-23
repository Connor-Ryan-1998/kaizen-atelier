import { getWindow } from "@/lib/windows";

export function ServicesWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("services").title}</h2>;
}
