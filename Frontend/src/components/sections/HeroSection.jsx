import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Grid & Particles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(2,6,23,1)_1px,transparent_1px),linear-gradient(90deg,rgba(2,6,23,1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" style={{ backgroundImage: 'linear-gradient(135deg, #0f172a 25%, transparent 25%), linear-gradient(225deg, #0f172a 25%, transparent 25%), linear-gradient(45deg, #0f172a 25%, transparent 25%), linear-gradient(315deg, #0f172a 25%, transparent 25%)' }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
            className="w-[800px] h-[800px] border border-dashed border-[#00CFFF]/20 rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
              className="w-[600px] h-[600px] border border-[#c084fc]/10 rounded-full"
            />
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#00CFFF] animate-pulse" />
          <span className="text-sm font-medium text-slate-300">Intelligent Routing System v2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500 mb-6 drop-shadow-lg"
        >
          Optimize the <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#00CFFF] to-[#3b82f6]">Last 5 Minutes</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
        >
          Because reaching the building isn't enough. AI-driven precision navigation that knows the right door, the right time, and the right path.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#demo"
            className="group relative px-8 py-4 rounded-lg bg-[#00CFFF] text-[#020617] font-semibold text-lg hover:bg-[#3b82f6] transition-all duration-300 overflow-hidden flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out" />
            <Navigation2 className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            <span>Start Simulation</span>
          </a>
          <a
            href="#problem"
            className="px-8 py-4 rounded-lg bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5 text-slate-400" />
            <span>How it Works</span>
          </a>
        </motion.div>
      </div>

      {/* Decorative Line down */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100px" }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-[#00CFFF]/50 to-transparent"
      />
    </section>
  );
};

export default HeroSection;
