// Mock Location Service for development
// In production, implement actual location functionality

export const LocationService = {
  requestPermissions: async () => {
    // Mock permission request
    return Promise.resolve(true);
  },

  getCurrentLocation: async () => {
    // Mock current location (NYC)
    return Promise.resolve({
      latitude: 40.730610,
      longitude: -73.935242,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  },

  watchPosition: (callback) => {
    // Mock position watching
    const mockLocation = {
      latitude: 40.730610,
      longitude: -73.935242,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    callback(mockLocation);
    return 1; // Mock watch ID
  },

  clearWatch: (watchId) => {
    // Mock clear watch
    return Promise.resolve();
  },
};
