import { Title } from "./ui";

const STEPS = [
  {
    n: "01",
    name: "Audit",
    text: "I dig into how work actually flows today: the tools, the spreadsheets, the workarounds nobody admits to. You get a plain-English map of where time and money leak.",
  },
  {
    n: "02",
    name: "Blueprint",
    text: "We agree a roadmap sized to your business and budget. Small wins first, big bets only when they earn it.",
  },
  {
    n: "03",
    name: "Iterate",
    text: "I build in short cycles, ship often, and leave you with documentation and systems your team can run without me. That's the kaizen bit: keep improving, a little at a time.",
  },
];

export function ProcessWindow() {
  return (
    <div>
      <Title>The process (no, there isn&apos;t a 90-slide deck)</Title>
      <ol className="mt-4 space-y-3">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-4 rounded-[7px] border-[1.5px] border-ink bg-paper p-3.5">
            <span className="font-mono text-lg font-semibold text-vermilion-ink">{s.n}</span>
            <div>
              <h3 className="text-[15px] font-bold">{s.name}</h3>
              <p className="mt-0.5 text-[13.5px] leading-snug text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
