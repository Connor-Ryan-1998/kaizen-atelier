import { getWindow } from "@/lib/windows";

export function NotFoundWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("notFound").title}</h2>;
}
