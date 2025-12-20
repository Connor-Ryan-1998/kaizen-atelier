// app/page.tsx
"use client";

import { Navbar } from "@/components/NavBar";
import { Hero } from "@/components/Hero";
import { ContentSections } from "@/components/ScrollSection";
import { motion, useScroll, useSpring } from "framer-motion";
import { Services } from "@/components/Services";

export default function Home() {
  // A subtle scroll progress bar at the very top (very trendy right now)
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <main className="bg-[#0F1115] min-h-screen selection:bg-indigo-500/30">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-[110]"
        style={{ scaleX }}
      />

      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Content & Boilerplate Sections */}
      <div className="relative z-10">
        <ContentSections />
      </div>

      <Services />

      {/* Final CTA Section (Boilerplate placeholder) */}
      <section id="contact" className="scroll-mt-24 py-32 px-6 flex flex-col items-center text-center">
        <div className="max-w-3xl p-12 rounded-[3rem] bg-gradient-to-b from-[#1A1D23] to-transparent border border-white/5">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to refine your <br /> digital craft?
          </h2>
          <p className="text-gray-400 mb-8">
            Whether you need a full data audit or a custom IT infrastructure,
            Kaizen Atelier is ready to build with you.
          </p>
          <a
            href="mailto:hq2831@gmail.com?subject=Project%20Request"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all shadow-xl shadow-indigo-500/20"
          >
            Start a Project
          </a>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} Kaizen Atelier. Engineered for Continuous Improvement.
        </p>
      </footer>
    </main>
  );
}
