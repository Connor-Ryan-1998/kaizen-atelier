// components/Navbar.tsx
import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

export const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 font-bold tracking-tighter text-xl">
        <Hammer className="text-accent-blue w-5 h-5" />
        <span>KAIZEN <span className="text-gray-500 font-light">ATELIER</span></span>
      </div>
      <div className="hidden md:flex gap-8 text-sm text-gray-400">
        <a href="#services" className="hover:text-white transition">Services</a>
        <a href="#work" className="hover:text-white transition">The Workshop</a>
        <button className="bg-white text-black px-4 py-1.5 rounded-full font-medium hover:bg-gray-200 transition">
          Contact
        </button>
      </div>
    </div>
  </nav>
);
