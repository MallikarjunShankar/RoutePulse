import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-white/5 shadow-lg shadow-[#00CFFF]/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Navigation className="text-[#00CFFF]" size={28} />
          <span className="text-xl font-bold tracking-tight">ROUTE<span className="text-[#00CFFF]">PULSE</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
          <a href="#solution" className="hover:text-white transition-colors">How It Works</a>
          <a 
            href="#demo" 
            className="px-5 py-2 rounded-full bg-white/5 border border-[#00CFFF]/20 text-white hover:bg-[#00CFFF]/10 hover:border-[#00CFFF]/50 transition-all duration-300 shadow-[0_0_15px_rgba(0,207,255,0.1)] relative overflow-hidden group"
          >
            <span className="relative z-10">Live Demo</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00CFFF]/0 via-[#00CFFF]/10 to-[#00CFFF]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 h-full w-full" />
          </a>
        </div>
        
        {/* Mobile menu button could go here, omitting for brevity to focus on core layout */}
      </div>
    </motion.nav>
  );
};

export default Navbar;
