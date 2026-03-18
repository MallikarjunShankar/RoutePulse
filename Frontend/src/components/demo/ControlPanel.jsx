import React, { useState } from 'react';
import { useRouteStore } from '../../store/useRouteStore';
import { optimizeLastMile, optimizeRoute } from '../../services/api';
import { MapPin, Search, Navigation, AlertCircle, Loader2, Info, LocateFixed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Small utility equivalent to clsx+twMerge
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ControlPanel = () => {
  const [result, setResult] = useState(null);

  const { 
    userType, setUserType, 
    userLocation, setUserLocation,
    destinationCoords,
    destination,
    routeData, isLoading, 
    setLoading, setRouteData, setError, error 
  } = useRouteStore();

  const userTypeLabel = {
    ambulance: 'Emergency',
    delivery: 'Delivery',
    visitor: 'Pedestrian'
  };

  const formatLngLat = (coords) => {
    if (!Array.isArray(coords) || coords.length !== 2) return null;
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        setUserLocation(coords);
        console.log('User location set:', coords);
      },
      (geoError) => {
        console.error(geoError);
        setError('Unable to fetch your location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleOptimize = async () => {
    if (!destinationCoords) {
      setError('Please click on the map to select destination.');
      return;
    }

    if (!userLocation) {
      setError('Please click "Use My Location" first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    console.log({
      userLocation,
      destination: destinationCoords,
      userType
    });
    
    console.log('Calling API for destination:', destinationCoords);
    
    try {
      // Backend expects [lat, lon]
      const backendUserLocation = [userLocation[1], userLocation[0]];
      const backendDestination = [destinationCoords[1], destinationCoords[0]];

      const backendResult = await optimizeLastMile({
        userLocation: backendUserLocation,
        destination: backendDestination,
        userType
      });

      console.log("Backend optimize-last-mile response:", backendResult);
      setResult(backendResult);

      // Pass a fixed mock location representing user's origin
      const response = await optimizeRoute({ 
        userType, 
        destination: formatLngLat(destinationCoords) || destination,
        location: { lat: userLocation[1], lng: userLocation[0] }
      });
      
      console.log("API returned response:", response);

      if (!response || !response.startLocation) {
        throw new Error("Invalid response from routing engine.");
      }

      const startLat = Number(response.startLocation.lat);
      const startLng = Number(response.startLocation.lng ?? response.startLocation.lon);
      const destLat = Number(response.destinationLocation?.lat);
      const destLng = Number(response.destinationLocation?.lng ?? response.destinationLocation?.lon);

      if (!Number.isFinite(startLat) || !Number.isFinite(startLng) || !Number.isFinite(destLat) || !Number.isFinite(destLng)) {
        console.error("Invalid coordinates received:", response);
        throw new Error("Invalid coordinates received.");
      }

      console.log("Updating state with valid coordinates:", { startLat, startLng, destLat, destLng });
      setRouteData(response);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch optimized route.");
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
            {[
              { value: 'ambulance', label: 'Emergency' },
              { value: 'delivery', label: 'Delivery' },
              { value: 'visitor', label: 'Pedestrian' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setUserType(option.value)}
                className={cn(
                  "py-3 px-2 rounded-xl text-xs sm:text-sm font-medium capitalize border transition-all duration-300",
                  userType === option.value
                    ? "bg-[#00CFFF]/20 border-[#00CFFF] text-white shadow-[0_0_15px_rgba(0,207,255,0.2)]"
                    : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Destination
          </label>
          <div className="bg-[#020617] border border-white/10 rounded-xl py-3 px-4 text-sm text-slate-400 flex items-center gap-2">
            <MapPin size={16} className="text-slate-500" />
            <span>Click on map to select destination</span>
          </div>
          {destination && <p className="text-xs text-slate-500 mt-2">Selected: {destination}</p>}
        </div>

        <div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="w-full rounded-xl bg-[#020617] border border-white/10 hover:border-[#00CFFF]/40 py-3 px-4 text-sm text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <LocateFixed size={16} className="text-[#00CFFF]" />
            Use My Location
          </button>
          {userLocation && (
            <p className="text-xs text-slate-500 mt-2">
              Current: {formatLngLat(userLocation)}
            </p>
          )}
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
            {isLoading ? 'Calculating...' : 'Optimize Last Mile'}
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

              {result && (
                <div className="text-sm rounded-lg border border-[#00CFFF]/25 bg-[#00CFFF]/5 p-4 space-y-3">
                  <p className="text-slate-300 text-xs uppercase tracking-wider font-semibold">Decision Panel</p>

                  <div className="rounded-md border border-white/10 bg-[#020617]/70 p-3">
                    <p className="text-xs text-slate-500">Best Entry</p>
                    <p className="text-white font-semibold mt-0.5">
                      {result.entry?.name || result.best_entry?.name || result.bestEntry || routeData?.bestEntry || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Why</p>
                    <ul className="space-y-1 text-slate-200">
                      <li>
                        • Crowd level: {result.entry?.crowd_level || result.crowd_level || result.crowdLevel || result.status || 'N/A'}
                      </li>
                      <li>
                        • Accessibility: {result.entry?.accessibility || result.accessibility || 'N/A'}
                      </li>
                      <li>
                        • Optimized for: {result.user_type || result.userType || userTypeLabel[userType] || userType}
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-white/10 bg-[#020617]/70 p-2">
                      <p className="text-slate-500">Distance</p>
                      <p className="text-white font-medium">
                        {typeof result.distance === 'number' ? `${Math.round(result.distance)}m` : result.distance || 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-md border border-white/10 bg-[#020617]/70 p-2">
                      <p className="text-slate-500">User Type</p>
                      <p className="text-white font-medium">
                        {result.user_type || result.userType || userTypeLabel[userType] || userType}
                      </p>
                    </div>
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
