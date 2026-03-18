import React, { useState } from 'react';
import { useRouteStore } from '../../store/useRouteStore';
import { optimizeRoute } from '../../services/api';
import { MapPin, Search, Navigation, AlertCircle, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Small utility equivalent to clsx+twMerge
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ControlPanel = () => {
  const { 
    userType, setUserType, 
    destination, setDestination, 
    routeData, isLoading, 
    setLoading, setRouteData, setError, error 
  } = useRouteStore();

  const handleOptimize = async () => {
    if (!destination?.trim()) {
      setError("Please select a destination.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setRouteData(null); // Clear old map line
    try {
      // Pass a fixed mock location representing user's origin
      const response = await optimizeRoute({ 
        userType, 
        destination, 
        location: { lat: 37.7700, lng: -122.4100 } 
      });
      setRouteData(response);
    } catch (err) {
      setError("Failed to fetch optimized route.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 flex flex-col h-full text-slate-300">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Navigation className="text-[#00CFFF]" size={20} /> Parameters
        </h3>
        <p className="text-sm text-slate-500">Configure simulation parameters</p>
      </div>

      <div className="space-y-6">
        {/* User Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Unit Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['ambulance', 'delivery', 'visitor'].map(type => (
              <button
                key={type}
                onClick={() => setUserType(type)}
                className={cn(
                  "py-3 px-2 rounded-xl text-xs sm:text-sm font-medium capitalize border transition-all duration-300",
                  userType === type 
                    ? "bg-[#00CFFF]/20 border-[#00CFFF] text-white shadow-[0_0_15px_rgba(0,207,255,0.2)]"
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Destination
          </label>
          <div className="relative group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-[#00CFFF]/70" size={18} />
            <input 
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Memorial Hospital..."
              className="w-full bg-[#020617] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00CFFF]/50 focus:ring-1 focus:ring-[#00CFFF]/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Execute Action */}
      <div className="mt-8 mb-6">
        <button
          onClick={handleOptimize}
          disabled={isLoading}
          className="w-full relative group overflow-hidden rounded-xl bg-[#020617] border border-[#00CFFF]/40 hover:border-[#00CFFF] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00CFFF]/10 to-[#3b82f6]/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
          <div className="py-4 flex items-center justify-center gap-2 font-semibold text-white relative z-10 transition-colors">
            {isLoading ? <Loader2 size={20} className="animate-spin text-[#00CFFF]" /> : <Search size={20} className="text-[#00CFFF] group-hover:animate-pulse" />}
            {isLoading ? 'Calculating...' : 'Execute Route Optimization'}
          </div>
        </button>
      </div>

      {/* Results / Status Panel */}
      <div className="flex-1 mt-6 border-t border-white/5 pt-6 relative overflow-hidden">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">System Telemetry</h4>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="text-red-400 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          {!routeData && !error && !isLoading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-32 text-center text-slate-500 gap-2">
                <Info size={24} className="opacity-50" />
                <p className="text-sm">Awaiting simulation params</p>
             </motion.div>
          )}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
               <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
               <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
               <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
            </motion.div>
          )}

          {routeData && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl border border-[#00CFFF]/30 bg-[#00CFFF]/5">
                <p className="text-xs text-[#00CFFF]/80 font-medium mb-1">OPTIMAL ENTRY SECURED</p>
                <p className="text-lg font-bold text-white tracking-tight">{routeData.bestEntry}</p>
              </div>

              {routeData.alerts?.length > 0 && (
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-200/90 text-sm flex gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{routeData.alerts[0]}</span>
                </div>
              )}

              {routeData.alternatives?.length > 0 && (
                <div className="text-sm">
                  <p className="text-slate-500 mb-2 font-medium">Alternative Nodes:</p>
                  <div className="flex gap-2 flex-wrap">
                    {routeData.alternatives.map(alt => (
                      <span key={alt.id} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-xs text-slate-400">
                        {alt.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default ControlPanel;
