// Simulated Mock API for Route Pulse

// Helpers to simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Preset coordinates representing destination and varying entries
const destinationCoords = { lat: 37.7749, lng: -122.4194 }; // SF Center
const entryPoints = {
  ambulance: [
    { id: 'E1', name: 'Emergency Gate A', lat: 37.7755, lng: -122.4180, congestion: 'low' },
    { id: 'E2', name: 'Emergency Gate B', lat: 37.7740, lng: -122.4200, congestion: 'high' }
  ],
  delivery: [
    { id: 'D1', name: 'Loading Dock North', lat: 37.7752, lng: -122.4185, congestion: 'medium' },
    { id: 'D2', name: 'Service Elevators', lat: 37.7745, lng: -122.4190, congestion: 'low' }
  ],
  visitor: [
    { id: 'V1', name: 'Main Lobby', lat: 37.7748, lng: -122.4198, congestion: 'high' }
  ]
};

export const optimizeRoute = async ({ userType, destination, location }) => {
  await delay(1500); // Simulate API latency

  // Validate userType
  const availableEntries = entryPoints[userType?.toLowerCase()] || entryPoints.visitor;

  // Find best entry point based on congestion (prefer 'low' or 'medium')
  const bestEntry = availableEntries.find(e => e.congestion === 'low') || availableEntries[0];

  // Generate a mock path from user location to best entry
  // We'll create a simple curved/stepped path between location and entry for visual effect
  const start = location || { lat: 37.7700, lng: -122.4100 }; // Default start
  
  const midPoint = {
    lat: start.lat + (bestEntry.lat - start.lat) * 0.5,
    lng: start.lng + (bestEntry.lng - start.lng) * 0.8 // Curve
  };

  const path = [start, midPoint, { lat: bestEntry.lat, lng: bestEntry.lng }];

  return {
    bestEntry: bestEntry.name,
    isOptimized: true,
    path,
    startLocation: start,
    destinationLocation: { lat: bestEntry.lat, lng: bestEntry.lng }, // Using entry as the target on map
    alternatives: availableEntries.filter(e => e.id !== bestEntry.id),
    alerts: bestEntry.congestion === 'high' 
      ? ['High congestion at chosen entry. Proceed with caution.'] 
      : userType === 'ambulance' ? ['Emergency protocol active. Priority clear.'] : []
  };
};
