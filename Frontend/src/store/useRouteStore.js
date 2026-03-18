import { create } from 'zustand';

export const useRouteStore = create((set) => ({
  userType: 'ambulance',
  destination: '',
  routeData: null,
  isLoading: false,
  error: null,
  
  setUserType: (type) => set({ userType: type }),
  setDestination: (dest) => set({ destination: dest }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setRouteData: (data) => set({ routeData: data, error: null }),
  setError: (err) => set({ error: err, routeData: null }),
  
  resetRoute: () => set({ routeData: null, error: null })
}));
