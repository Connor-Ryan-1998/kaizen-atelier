// components/Hero.tsx
import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <section className="relative pt-48 pb-32 px-6 overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl opacity-50" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-1.5 mb-6 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs font-medium"
        >
          Modern IT & Data
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
          The <span className="text-gray-500 font-normal">Atelier</span> for your <br />
          Technology Systems
        </h1>

        <p className="mt-8 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          We help ambitious companies transform fragmented and disparate processes into modern and cost effective systems
          for the AI age
        </p>
      </div>
    </section>
  );
};
