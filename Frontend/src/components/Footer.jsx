import React from 'react';
import { Navigation } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#020617] border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-white/80">
          <Navigation className="text-[#00CFFF]" size={20} />
          <span className="text-lg font-semibold tracking-tight">ROUTE<span className="text-[#00CFFF]">PULSE</span></span>
        </div>
        
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Route Pulse Systems. All rights reserved.
        </p>
        
        <div className="flex gap-4 text-sm text-slate-500">
          <a href="#" className="hover:text-[#00CFFF] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#00CFFF] transition-colors">Terms</a>
          <a href="#" className="hover:text-[#00CFFF] transition-colors">System Status</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
