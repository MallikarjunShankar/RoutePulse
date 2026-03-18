import React from 'react';
import { motion } from 'framer-motion';
import ControlPanel from './ControlPanel';
import MapComponent from './MapComponent';

const DemoSection = () => {
  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1 bg-[#00CFFF]/10 border border-[#00CFFF]/30 text-[#00CFFF] text-xs font-semibold rounded-full mb-4">LIVE SYSTEM</span>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
              Simulation Interface
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Test the routing engine in real-time. Select a user type and observe how the system actively reroutes to the optimal entry point based on operational context.
            </p>
          </motion.div>
        </div>

        {/* The Dashboard Interface */}
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.7, ease: "easeOut" }}
           className="w-full h-auto min-h-[600px] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row bg-[#020617]/50 backdrop-blur-xl relative"
        >
          {/* Glass Overlay Effect */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />
          
          <div className="lg:w-[400px] w-full shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 relative z-10 bg-[#0f172a]/60 pt-6 flex flex-col">
            <ControlPanel />
          </div>

          <div className="flex-1 relative min-h-[400px] lg:min-h-full overflow-hidden bg-[#020617]">
            <MapComponent />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
