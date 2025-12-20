import { Cpu, Database, LineChart, Layers3 } from "lucide-react";

const services = [
  {
    title: "Process Automation & Modernization",
    desc: "Streamlined workflows, reduced manual overhead, and modern toolchains that scale.",
    icon: <Cpu />,
    accent: "from-indigo-500/20 via-indigo-500/0 to-transparent"
  },
  {
    title: "Data Pipelines",
    desc: "Reliable ingestion, transformation, and delivery so your data is always usable.",
    icon: <Database />,
    accent: "from-cyan-500/20 via-cyan-500/0 to-transparent"
  },
  {
    title: "Analytics",
    desc: "Clear, decision-ready reporting, metrics, and forecasting that move the needle.",
    icon: <LineChart />,
    accent: "from-emerald-500/20 via-emerald-500/0 to-transparent"
  },
  {
    title: "Infrastructure",
    desc: "Resilient foundations, optimized costs, and secure environments across cloud or hybrid.",
    icon: <Layers3 />,
    accent: "from-amber-500/20 via-amber-500/0 to-transparent"
  }
];

export const Services = () => (
  <section id="services" className="scroll-mt-24 py-24 px-6 max-w-6xl mx-auto">
    <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <p className="text-indigo-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          Services
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-white">
          Focused expertise across your stack
        </h2>
      </div>
      <p className="text-sm text-gray-400 max-w-md">
        Four core capabilities that compound. Each engagement is tailored, but the outcomes
        stay consistent: clarity, velocity, and durability.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {services.map((s, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111318] p-8 shadow-[0_20px_60px_-40px_rgba(99,102,241,0.6)] transition-transform duration-300 hover:-translate-y-1"
        >
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent}`} />
          <div className="relative">
            <div className="mb-6 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
              {s.icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{s.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
