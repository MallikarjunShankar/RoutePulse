import React, { useEffect, useRef, useState } from 'react';
import { useRouteStore } from '../../store/useRouteStore';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Node Icon (Pulse effect)
const createPulseIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 15px ${color}; border: 2px solid white; animation: pulse-anim 2s infinite;"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const mapStyleUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

// Component to dynamically recenter map and animate lines
const MapController = ({ routeData }) => {
  const map = useMap();
  
  useEffect(() => {
    if (routeData && routeData.path?.length > 0) {
      // Fit map to show both start and end, with padding
      const bounds = L.latLngBounds(routeData.path.map(p => [p.lat, p.lng]));
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [routeData, map]);

  return null;
};

// Component to animate polyline drawing
const AnimatedPolyline = ({ path, color }) => {
  const [currentPath, setCurrentPath] = useState([]);

  useEffect(() => {
    setCurrentPath([]);
    if (!path || path.length === 0) return;

    // Simulate progressive path drawing
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        setCurrentPath(prev => [...prev, [path[step].lat, path[step].lng]]);
        step += 1;
      } else {
        clearInterval(interval);
      }
    }, 250); // Frame rate of drawing

    return () => clearInterval(interval);
  }, [path]);

  if (currentPath.length < 2) return null;

  return (
    <>
      {/* Background glow path */}
      <Polyline positions={currentPath} color={color} weight={8} opacity={0.2} pathOptions={{ className: 'animate-pulse' }} />
      {/* Main Path */}
      <Polyline positions={currentPath} color={color} weight={3} dashArray="8, 8" opacity={0.8} />
    </>
  );
};

const MapComponent = () => {
  const { routeData } = useRouteStore();
  
  // Default SF view
  const center = [37.7725, -122.4140];
  const zoom = 14;

  const nodeColor = '#00CFFF';
  const startColor = '#c084fc';
  
  // Inject some CSS for our pulse keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse-anim {
        0% { box-shadow: 0 0 0 0 rgba(0, 207, 255, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(0, 207, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 207, 255, 0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url={mapStyleUrl}
        />
        
        {/* Dynamic map behavior */}
        <MapController routeData={routeData} />

        {/* Existing Route Drawings and Markers */}
        {routeData && (
          <>
            <AnimatedPolyline path={routeData.path} color={nodeColor} />
            
            <Marker position={[routeData.startLocation.lat, routeData.startLocation.lng]} icon={createPulseIcon(startColor)}>
              <Popup className="dark-popup">Origin Location</Popup>
            </Marker>
            
            <Marker position={[routeData.destinationLocation.lat, routeData.destinationLocation.lng]} icon={createPulseIcon(nodeColor)}>
              <Popup className="dark-popup font-bold">{routeData.bestEntry}</Popup>
            </Marker>
            
            {/* Alternative nodes */}
            {routeData.alternatives?.map(alt => (
              <Marker key={alt.id} position={[alt.lat, alt.lng]} icon={createPulseIcon('#334155')}>
                <Popup className="dark-popup">{alt.name}</Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>
      
      {/* Decorative overlays */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-r-3xl" />
      <div className="absolute top-4 left-4 pointer-events-none px-3 py-1.5 bg-[#020617]/80 backdrop-blur border border-white/10 rounded overflow-hidden text-[#00CFFF] text-[10px] uppercase font-mono tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-[#00CFFF] rounded-full animate-ping" />
        Live Geo-Telemetry
      </div>

    </div>
  );
};

export default MapComponent;
