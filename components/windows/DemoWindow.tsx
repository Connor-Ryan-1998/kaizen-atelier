import { getWindow } from "@/lib/windows";

export function DemoWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("demo").title}</h2>;
}
