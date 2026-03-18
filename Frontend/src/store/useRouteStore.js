import { create } from 'zustand';

export const useRouteStore = create((set) => ({
  userType: 'ambulance',
  userLocation: null,
  destinationCoords: null,
  destination: '',
  routeData: null,
  isLoading: false,
  error: null,
  
  setUserType: (type) => set({ userType: type }),
  setUserLocation: (coords) => set({ userLocation: coords }),
  setDestinationCoords: (coords) => set({ destinationCoords: coords }),
  setDestination: (dest) => set({ destination: dest }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setRouteData: (data) => {
    console.log("Before updating state with data:", data);
    if (!data) {
      set({ routeData: null, error: null });
      return;
    }
    
    // Validate path coordinates
    if (data.path) {
      const validPath = data.path.every(p => p && typeof p.lat === 'number' && typeof p.lng === 'number');
      if (!validPath) {
        set({ error: "Invalid path coordinates returned." });
        return;
      }
    }
    
    set({ routeData: data, error: null });
  },
  
  setError: (err) => set({ error: err }),
  
  resetRoute: () => set({ routeData: null, error: null })
}));
