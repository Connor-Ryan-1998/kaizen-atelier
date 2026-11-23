import { getWindow } from "@/lib/windows";

export function CvWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("cv").title}</h2>;
}
