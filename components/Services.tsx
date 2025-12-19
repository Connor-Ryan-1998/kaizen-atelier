// components/Services.tsx
import { Database, ShieldCheck, LineChart, Cpu } from "lucide-react";

const services = [
  { title: "Data Architecture", desc: "Building the spine of your intelligence.", icon: <Database />, size: "col-span-2" },
  { title: "IT Strategy", desc: "Consulting with precision.", icon: <ShieldCheck />, size: "col-span-1" },
  { title: "System Optimization", desc: "Continuous improvement, automated.", icon: <Cpu />, size: "col-span-1" },
  { title: "Predictive Analytics", desc: "Seeing the curve before it happens.", icon: <LineChart />, size: "col-span-2" },
];

export const Services = () => (
  <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
    <h2 className="text-3xl font-bold mb-12">The Atelier Services</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {services.map((s, i) => (
        <div key={i} className={`${s.size} p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-accent-blue/50 transition-all group`}>
          <div className="text-accent-blue mb-4 group-hover:scale-110 transition-transform">{s.icon}</div>
          <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
          <p className="text-gray-500 text-sm">{s.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
