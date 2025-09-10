import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import { Location, LocationPermission } from '@/types';

class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<LocationPermission> {
    try {
      let permission: Permission;
      
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await request(permission);
      
      return {
        granted: result === RESULTS.GRANTED,
        canAskAgain: result !== RESULTS.NEVER_ASK_AGAIN,
        status: result as 'granted' | 'denied' | 'never_ask_again',
      };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  async checkPermissions(): Promise<LocationPermission> {
    try {
      let permission: Permission;
      
      if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      } else {
        permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      }

      const result = await check(permission);
      
      return {
        granted: result === RESULTS.GRANTED,
        canAskAgain: result !== RESULTS.NEVER_ASK_AGAIN,
        status: result as 'granted' | 'denied' | 'never_ask_again',
      };
    } catch (error) {
      console.error('Error checking location permission:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      };

      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          resolve(location);
        },
        (error) => {
          console.error('Error getting current location:', error);
          reject(new Error(error.message || 'Failed to get current location'));
        },
        options
      );
    });
  }

  watchPosition(callback: (location: Location) => void): number {
    const options = {
      enableHighAccuracy: true,
      distanceFilter: 10, // meters
      interval: 5000, // milliseconds
      fastestInterval: 2000, // milliseconds
    };

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        callback(location);
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      options
    );

    return this.watchId;
  }

  async clearWatch(watchId: number): Promise<void> {
    try {
      Geolocation.clearWatch(watchId);
      this.watchId = null;
    } catch (error) {
      console.error('Error clearing watch:', error);
    }
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted;
      }
      
      return 'Unknown location';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Unknown location';
    }
  }

  // Get coordinates from address (geocoding)
  async getCoordinatesFromAddress(address: string): Promise<Location | null> {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=YOUR_API_KEY`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.geometry.lat,
          longitude: result.geometry.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  }

  // Check if location services are enabled
  async isLocationEnabled(): Promise<boolean> {
    try {
      const permission = await this.checkPermissions();
      return permission.granted;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  // Get location accuracy
  async getLocationAccuracy(): Promise<number | null> {
    try {
      const location = await this.getCurrentLocation();
      // This would require additional implementation to get accuracy
      // For now, return a default value
      return 10; // meters
    } catch (error) {
      console.error('Error getting location accuracy:', error);
      return null;
    }
  }

  // Format distance for display
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }

  // Get location bounds for map display
  getLocationBounds(center: Location, radiusKm: number = 5) {
    const latDelta = radiusKm / 111; // Approximate km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos(center.latitude * Math.PI / 180));
    
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }
}

export const locationService = LocationService.getInstance();
export { LocationService };
