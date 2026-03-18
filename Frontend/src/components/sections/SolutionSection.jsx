import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Crosshair } from 'lucide-react';

const steps = [
  {
    icon: Crosshair,
    title: "Context Awareness",
    desc: "System identifies user type (EMS, Delivery, Civilian) to determine optimal entry rules."
  },
  {
    icon: ShieldCheck,
    title: "Live Congestion",
    desc: "Real-time parsing of entrance availability, crowd density, and security lockdowns."
  },
  {
    icon: Zap,
    title: "Micro-Navigation",
    desc: "Dynamic rendering of final 500-meter path directly to the exact correct door."
  }
];

const SolutionSection = () => {
  return (
    <section id="solution" className="py-32 bg-slate-900/50 border-y border-white/5 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#00CFFF]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <span className="text-[#00CFFF] font-semibold tracking-wider text-sm uppercase mb-4 block">The Route Pulse Solution</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-20">Optimizing the Last Mile</h2>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative flex flex-col items-center flex-1"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#020617] border border-white/10 flex items-center justify-center mb-6 shadow-xl relative z-10 group hover:border-[#00CFFF]/50 transition-colors">
                  <div className="absolute inset-0 rounded-2xl bg-[#00CFFF]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <step.icon size={32} className="text-slate-300 group-hover:text-[#00CFFF] transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-center text-sm leading-relaxed max-w-[250px]">{step.desc}</p>
              </motion.div>
              
              {/* Connector */}
              {idx < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.2 }}
                  className="hidden md:block w-24 h-[2px] bg-gradient-to-r from-transparent via-[#00CFFF]/40 to-transparent relative top-[-40px]"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
