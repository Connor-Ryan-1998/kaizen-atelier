"use client";
import { motion } from "framer-motion";

export const Navbar = () => {
  return (
    <div className="fixed top-6 inset-x-0 z-[100] flex justify-center px-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-6 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg shadow-2xl"
      >
        <div className="text-white font-bold tracking-tight text-sm mr-4">KAIZEN <span className="text-indigo-400">ATELIER</span></div>
        <div className="hidden md:flex gap-6 text-xs font-medium text-gray-300">
          <a href="#about" className="hover:text-white transition">Approach</a>
          <a href="#services" className="hover:text-white transition">Services</a>
          <a href="#process" className="hover:text-white transition">Process</a>
        </div>
        <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full transition-all">
          Contact us
        </button>
      </motion.nav>
    </div>
  );
}

