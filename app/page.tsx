// app/page.tsx
"use client";
import { Navbar } from "@/components/NavBar";
import { Services } from "@/components/Services";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-blue/10 blur-[120px] rounded-full" />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-bold tracking-tight mb-6"
        >
          Engineering <br /> <span className="text-gray-500 italic">Continuous Flow</span>
        </motion.h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
          Kaizen Atelier is a data-first IT consultancy. We craft high-performance systems and analytics pipelines for the next era of enterprise.
        </p>
      </section>

      <Services />
    </main>
  );
}
