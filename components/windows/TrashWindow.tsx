import { getWindow } from "@/lib/windows";

export function TrashWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("trash").title}</h2>;
}
