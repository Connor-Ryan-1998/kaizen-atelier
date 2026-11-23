import { getWindow } from "@/lib/windows";

export function ProcessWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("process").title}</h2>;
}
