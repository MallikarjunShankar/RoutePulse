import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Map } from 'lucide-react';

const Card = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
    className="relative group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-b from-[#00CFFF]/0 to-[#00CFFF]/0 group-hover:from-[#00CFFF]/5 transition-colors duration-500" />
    <div className="w-14 h-14 rounded-xl bg-[#00CFFF]/10 border border-[#00CFFF]/20 flex items-center justify-center mb-6 text-[#00CFFF] group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,207,255,0.3)] transition-all">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);

const ProblemSection = () => {
  return (
    <section id="problem" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6"
          >
            Navigation Ends Too Early
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Google Maps gets you to the building. But what happens when the building is a 20-acre hospital with 14 different entrances?
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
            icon={AlertTriangle}
            title="Critical Delays"
            desc="Ambulances waste precious minutes circulating vast hospital campuses trying to find the specific active emergency intake door."
            delay={0.1}
          />
          <Card
            icon={Clock}
            title="Delivery Inefficiency"
            desc="Couriers spend 40% of their delivery time navigating from the street to the actual drop-off point inside large complexes."
            delay={0.2}
          />
          <Card
            icon={Map}
            title="Lost Visitors"
            desc="Pedestrians and students miss scheduled times because generic pins don't specify which side of a stadium or campus to enter."
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
