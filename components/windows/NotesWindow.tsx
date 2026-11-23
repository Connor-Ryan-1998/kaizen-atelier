import { Body } from "./ui";

export type Note = { title: string; date: string; href: string };

/** Add published notes here; they render as a list. */
export const NOTES: Note[] = [];

export function NotesWindow({ items = NOTES }: { items?: Note[] }) {
  if (items.length === 0) {
    return (
      <div>
        <p className="mb-2 font-mono text-sm font-semibold">Drafts: 14. Published: 0.</p>
        <Body>Writing about data, automation and homelabs. Coming soon, allegedly.</Body>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((n) => (
        <li key={n.href} className="flex justify-between gap-4 border-b border-dashed border-ink/30 pb-2">
          <a href={n.href} className="font-semibold text-indigo underline underline-offset-2">
            {n.title}
          </a>
          <span className="font-mono text-xs text-muted">{n.date}</span>
        </li>
      ))}
    </ul>
  );
}
