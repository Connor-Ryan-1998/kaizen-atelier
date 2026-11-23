import { getWindow } from "@/lib/windows";

export function WelcomeWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("welcome").title}</h2>;
}
