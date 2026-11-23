import { getWindow } from "@/lib/windows";

export function ContactWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("contact").title}</h2>;
}
