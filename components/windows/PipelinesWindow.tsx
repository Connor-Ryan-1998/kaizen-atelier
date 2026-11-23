import { getWindow } from "@/lib/windows";

export function PipelinesWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("pipelines").title}</h2>;
}
