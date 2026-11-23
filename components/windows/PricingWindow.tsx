import { getWindow } from "@/lib/windows";

export function PricingWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("pricing").title}</h2>;
}
