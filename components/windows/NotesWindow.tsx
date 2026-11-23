import { getWindow } from "@/lib/windows";

export function NotesWindow() {
  return <h2 className="text-2xl font-bold">{getWindow("notes").title}</h2>;
}
