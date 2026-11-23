import { getWindow } from "@/lib/windows";

export function WorkWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("work").title}</h2>;
}
