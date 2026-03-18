import React, { useEffect, useRef, useState } from 'react';
import { useRouteStore } from '../../store/useRouteStore';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
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

const isValidPoint = (point) => {
  if (!point) return false;

  const lat = Number(point.lat);
  const lng = Number(point.lng ?? point.lon);

  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const normalizePoint = (point) => {
  if (!isValidPoint(point)) return null;
  return { lat: Number(point.lat), lng: Number(point.lng ?? point.lon) };
};

const isValidLatLngTuple = (value) => {
  if (!Array.isArray(value) || value.length !== 2) return false;
  const lng = Number(value[0]);
  const lat = Number(value[1]);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const tupleLngLatToLeaflet = (value) => {
  if (!isValidLatLngTuple(value)) return null;
  return [Number(value[1]), Number(value[0])];
};

const toLeafletPoint = (point) => {
  if (!point) return null;
  const lat = Number(point[0]);
  const lng = Number(point[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

const pointsNear = (a, b, tolerance = 0.002) => {
  if (!a || !b) return false;
  return Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance;
};

const matchBackendPathSegment = (backendPath, start, end) => {
  if (!Array.isArray(backendPath) || backendPath.length < 2 || !start || !end) return null;

  const normalized = backendPath
    .map((p) => normalizePoint(p))
    .filter(Boolean)
    .map((p) => [p.lat, p.lng]);

  if (normalized.length < 2) return null;

  const first = normalized[0];
  const last = normalized[normalized.length - 1];

  if (pointsNear(first, start) && pointsNear(last, end)) return normalized;
  if (pointsNear(first, end) && pointsNear(last, start)) return normalized.reverse();

  return null;
};

const fetchMapboxSegment = async (start, end) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (!token) return null;

  const startLngLat = `${start[1]},${start[0]}`;
  const endLngLat = `${end[1]},${end[0]}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLngLat};${endLngLat}?geometries=geojson&overview=full&access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const coordinates = data?.routes?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  return coordinates
    .map((coord) => [Number(coord[1]), Number(coord[0])])
    .filter((coord) => Number.isFinite(coord[0]) && Number.isFinite(coord[1]));
};

const normalizeEntry = (entry, fallbackId) => {
  if (!entry) return null;

  const lat = Number(entry.lat ?? entry.latitude ?? entry.location?.lat);
  const lng = Number(entry.lng ?? entry.lon ?? entry.longitude ?? entry.location?.lng ?? entry.location?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return {
    id: entry.id ?? `entry-${fallbackId}`,
    name: entry.name ?? entry.label ?? `Entry ${fallbackId + 1}`,
    lat,
    lng,
    recommended: Boolean(entry.recommended)
  };
};

const MapInteractionBridge = ({ onMapReady, onMapClick }) => {
  const map = useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      onMapClick(lat, lng);
    }
  });

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

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
  // Use selector to avoid unnecessary remounts when typing in search
  const routeData = useRouteStore(state => state.routeData);
  const userLocation = useRouteStore(state => state.userLocation);
  const destinationCoords = useRouteStore(state => state.destinationCoords);
  const setDestinationCoords = useRouteStore(state => state.setDestinationCoords);
  const setDestinationInput = useRouteStore(state => state.setDestination);
  const mapRef = useRef(null);
  const hasBoundRouteRef = useRef(false);
  const mapInitializedRef = useRef(false);
  const destinationMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const entryMarkersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Manage stable map center
  const defaultCenter = { lat: 37.7725, lng: -122.4140 };
  const [position, setPosition] = useState(defaultCenter);

  useEffect(() => {
    const nextPosition = normalizePoint(routeData?.startLocation);
    if (nextPosition) {
      setPosition(nextPosition);
    }
  }, [routeData]);

  const zoom = 14;
  const nodeColor = '#00CFFF';
  const startColor = '#c084fc';
  const safePath = (routeData?.path || []).map(normalizePoint).filter(Boolean);
  const safeStartLocation = normalizePoint(routeData?.startLocation);
  const safeDestinationLocation = normalizePoint(routeData?.destinationLocation);
  const safeSelectedDestination = isValidLatLngTuple(destinationCoords) ? destinationCoords : null;
  const safeUserLocation = isValidLatLngTuple(userLocation) ? userLocation : null;

  // Initialization lifecycle log (runs once)
  useEffect(() => {
    console.log('[Map] MapComponent mounted.');
    return () => {
      if (mapRef.current && destinationMarkerRef.current) {
        mapRef.current.removeLayer(destinationMarkerRef.current);
      }
      if (mapRef.current && userMarkerRef.current) {
        mapRef.current.removeLayer(userMarkerRef.current);
      }
      if (mapRef.current && entryMarkersLayerRef.current) {
        mapRef.current.removeLayer(entryMarkersLayerRef.current);
      }
      if (mapRef.current && routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
      }
      console.log('[Map] MapComponent unmounted.');
    };
  }, []);

  const initializeMapOnce = (map) => {
    if (mapInitializedRef.current) return;
    if (!map) return;

    mapRef.current = map;
    mapInitializedRef.current = true;
    console.log('[Map] initialized once.');
  };

  const handleMapClick = (lat, lng) => {
    console.log('[Map] destination selected from map click:', { lat, lng });
    setDestinationCoords([lng, lat]);
  };

  // Update map center from validated state updates without re-creating map
  useEffect(() => {
    if (!mapRef.current || !isValidPoint(position)) return;
    mapRef.current.setView([position.lat, position.lng], mapRef.current.getZoom());
    console.log('[Map] setView', position);
  }, [position]);

  // Fit bounds only when we have a valid route path
  useEffect(() => {
    if (!mapRef.current || safePath.length < 2) {
      hasBoundRouteRef.current = false;
      return;
    }

    const bounds = L.latLngBounds(safePath.map((p) => [p.lat, p.lng]));
    mapRef.current.flyToBounds(bounds, { padding: [50, 50], duration: hasBoundRouteRef.current ? 0.9 : 1.5 });
    hasBoundRouteRef.current = true;
    console.log('[Map] flyToBounds with points:', safePath.length);
  }, [safePath]);

  // Keep destination text input in sync when destination is selected on map
  useEffect(() => {
    if (!safeSelectedDestination) return;

    const [lng, lat] = safeSelectedDestination;
    setDestinationInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }, [safeSelectedDestination, setDestinationInput]);

  // Update destination marker only when destination state changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (destinationMarkerRef.current) {
      mapRef.current.removeLayer(destinationMarkerRef.current);
      destinationMarkerRef.current = null;
    }

    if (!safeSelectedDestination) return;

    const leafletPosition = tupleLngLatToLeaflet(safeSelectedDestination);
    if (!leafletPosition) return;

    destinationMarkerRef.current = L.marker(leafletPosition, { icon: createPulseIcon('#ef4444') })
      .addTo(mapRef.current)
      .bindPopup('Selected Destination');
  }, [safeSelectedDestination]);

  // Update user marker when geolocation changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (!safeUserLocation) return;

    const leafletPosition = tupleLngLatToLeaflet(safeUserLocation);
    if (!leafletPosition) return;

    userMarkerRef.current = L.marker(leafletPosition, { icon: createPulseIcon('#3b82f6') })
      .addTo(mapRef.current)
      .bindPopup('Your Location');
  }, [safeUserLocation]);

  useEffect(() => {
    if (!safeUserLocation) return;
    setPosition({ lat: safeUserLocation[1], lng: safeUserLocation[0] });
  }, [safeUserLocation]);

  // Draw optimized route as User -> Entry -> Destination
  useEffect(() => {
    let disposed = false;

    const drawRoute = async () => {
      if (!mapRef.current) return;

      if (routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      if (!safeUserLocation || !safeSelectedDestination || !selectedEntry) return;

      const userPoint = tupleLngLatToLeaflet(safeUserLocation);
      const destinationPoint = tupleLngLatToLeaflet(safeSelectedDestination);
      const entryPoint = toLeafletPoint([selectedEntry.lat, selectedEntry.lng]);

      if (!userPoint || !destinationPoint || !entryPoint) return;

      const backendSegment1 = matchBackendPathSegment(routeData?.path, userPoint, entryPoint);

      let segment1 = backendSegment1;
      if (!segment1) {
        segment1 = await fetchMapboxSegment(userPoint, entryPoint);
      }
      if (!segment1 || segment1.length < 2) {
        segment1 = [userPoint, entryPoint];
      }

      let segment2 = await fetchMapboxSegment(entryPoint, destinationPoint);
      if (!segment2 || segment2.length < 2) {
        segment2 = [entryPoint, destinationPoint];
      }

      if (disposed || !mapRef.current) return;

      const layer = L.layerGroup().addTo(mapRef.current);
      routeLayerRef.current = layer;

      L.polyline(segment1, {
        color: '#22d3ee',
        weight: 4,
        opacity: 0.9
      }).addTo(layer);

      L.polyline(segment2, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.9,
        dashArray: '10,8'
      }).addTo(layer);
    };

    drawRoute();

    return () => {
      disposed = true;
      if (mapRef.current && routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
    };
  }, [safeUserLocation, safeSelectedDestination, selectedEntry, routeData]);

  // Build entries + selected entry from route/api response
  useEffect(() => {
    if (!routeData) {
      setEntries([]);
      setSelectedEntry(null);
      return;
    }

    const backendEntries = Array.isArray(routeData.entries) ? routeData.entries : [];
    let nextEntries = backendEntries.map((entry, idx) => normalizeEntry(entry, idx)).filter(Boolean);

    if (nextEntries.length === 0) {
      const fallbackEntries = [];

      if (safeDestinationLocation) {
        fallbackEntries.push({
          id: 'selected-entry',
          name: routeData.bestEntry || 'Selected Entry',
          lat: safeDestinationLocation.lat,
          lng: safeDestinationLocation.lng,
          recommended: true
        });
      }

      (routeData.alternatives || []).forEach((alt, idx) => {
        const normalized = normalizeEntry(alt, idx + 1);
        if (normalized) fallbackEntries.push(normalized);
      });

      nextEntries = fallbackEntries;
    }

    const selectedByRef = routeData.entry || routeData.selectedEntry || routeData.bestEntry;
    const selectedById = selectedByRef?.id || selectedByRef;
    const selectedByName = selectedByRef?.name || selectedByRef;

    const match = nextEntries.find((entry) => (
      entry.id === selectedById || entry.name === selectedByName || entry.recommended
    ));

    setEntries(nextEntries);
    setSelectedEntry(match || nextEntries[0] || null);
  }, [routeData, safeDestinationLocation]);

  // Entry marker layer: remove old markers, add latest markers with highlight
  useEffect(() => {
    if (!mapRef.current) return;

    if (entryMarkersLayerRef.current) {
      mapRef.current.removeLayer(entryMarkersLayerRef.current);
      entryMarkersLayerRef.current = null;
    }

    if (!entries.length) return;

    const layer = L.layerGroup().addTo(mapRef.current);
    entryMarkersLayerRef.current = layer;

    entries.forEach((entry) => {
      const isSelected = Boolean(selectedEntry) && (
        entry.id === selectedEntry.id || entry.name === selectedEntry.name
      );

      const marker = L.marker([entry.lat, entry.lng], {
        icon: createPulseIcon(isSelected ? '#22c55e' : '#eab308')
      }).addTo(layer);

      marker.bindPopup(isSelected ? `${entry.name} (Selected)` : entry.name);
    });
  }, [entries, selectedEntry]);
  
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
        center={position} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#020617' }}
        zoomControl={false}
      >
        <MapInteractionBridge onMapReady={initializeMapOnce} onMapClick={handleMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url={mapStyleUrl}
        />

        {/* Existing Route Drawings and Markers */}
        {routeData && (
          <>
            {!safeUserLocation && <AnimatedPolyline path={safePath} color={nodeColor} />}
            
            {safeStartLocation && (
              <Marker position={[safeStartLocation.lat, safeStartLocation.lng]} icon={createPulseIcon(startColor)}>
                <Popup className="dark-popup">Origin Location</Popup>
              </Marker>
            )}
            
            {safeDestinationLocation && entries.length === 0 && (
              <Marker position={[safeDestinationLocation.lat, safeDestinationLocation.lng]} icon={createPulseIcon(nodeColor)}>
                <Popup className="dark-popup font-bold">{routeData.bestEntry}</Popup>
              </Marker>
            )}
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
