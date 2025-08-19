import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      // Mock location permission check
      // In production, use react-native-permissions
      setHasPermission(true);
      
      // Set default location (NYC) for demo purposes
      setLocation({
        latitude: 40.730610,
        longitude: -73.935242,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking location permission:', error);
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      // Mock permission request
      // In production, implement actual permission request
      setHasPermission(true);
      
      // Get current location
      const mockLocation = {
        latitude: 40.730610,
        longitude: -73.935242,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setLocation(mockLocation);
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert(
        'Location Permission Required',
        'WasteSaver needs location access to show you nearby rescue bags.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => {} }
        ]
      );
      return false;
    }
  };

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
  };

  const getCurrentLocation = async () => {
    try {
      // Mock current location
      // In production, use react-native-geolocation-service
      const mockLocation = {
        latitude: 40.730610 + (Math.random() - 0.5) * 0.01,
        longitude: -73.935242 + (Math.random() - 0.5) * 0.01,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setLocation(mockLocation);
      return mockLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

  const value = {
    location,
    hasPermission,
    isLoading,
    requestLocationPermission,
    updateLocation,
    getCurrentLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
