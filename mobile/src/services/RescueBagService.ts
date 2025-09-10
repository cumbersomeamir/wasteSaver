import { RescueBag, Location, RescueBagFilters, PaginatedResponse, ApiResponse } from '@/types';
import { API_BASE_URL } from '@/constants/api';

class RescueBagService {
  private static instance: RescueBagService;
  private baseURL = API_BASE_URL;

  public static getInstance(): RescueBagService {
    if (!RescueBagService.instance) {
      RescueBagService.instance = new RescueBagService();
    }
    return RescueBagService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: any) {
      console.error('RescueBagService request error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  private async getToken(): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      return null;
    }
  }

  async getRescueBags(params: {
    location: Location;
    filters?: RescueBagFilters;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<RescueBag>> {
    const { location, filters = {}, page = 1, limit = 20 } = params;
    
    const queryParams = new URLSearchParams({
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.radius && { radius: filters.radius.toString() }),
      ...(filters.category && { category: filters.category }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
      ...(filters.minPrice && { minPrice: filters.minPrice.toString() }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.dietary && filters.dietary.length > 0 && { 
        dietary: filters.dietary.join(',') 
      }),
      ...(filters.allergens && filters.allergens.length > 0 && { 
        allergen: filters.allergens.join(',') 
      }),
    });

    const response = await this.makeRequest<PaginatedResponse<RescueBag>>(
      `/api/rescue-bags?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch rescue bags');
  }

  async getRescueBagById(id: string): Promise<RescueBag> {
    const response = await this.makeRequest<{ rescueBag: RescueBag }>(
      `/api/rescue-bags/${id}`
    );

    if (response.success && response.data) {
      return response.data.rescueBag;
    }

    throw new Error(response.error || 'Failed to fetch rescue bag');
  }

  async getFeaturedBags(): Promise<RescueBag[]> {
    const response = await this.makeRequest<RescueBag[]>(
      '/api/rescue-bags/featured'
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch featured bags');
  }

  async getNearbyBags(location: Location, radius: number = 5): Promise<RescueBag[]> {
    const queryParams = new URLSearchParams({
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      radius: radius.toString(),
    });

    const response = await this.makeRequest<RescueBag[]>(
      `/api/rescue-bags/nearby?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch nearby bags');
  }

  async searchRescueBags(params: {
    query: string;
    location: Location;
    filters?: RescueBagFilters;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<RescueBag>> {
    const { query, location, filters = {}, page = 1, limit = 20 } = params;
    
    const queryParams = new URLSearchParams({
      q: query,
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.radius && { radius: filters.radius.toString() }),
      ...(filters.category && { category: filters.category }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
      ...(filters.minPrice && { minPrice: filters.minPrice.toString() }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.dietary && filters.dietary.length > 0 && { 
        dietary: filters.dietary.join(',') 
      }),
      ...(filters.allergens && filters.allergens.length > 0 && { 
        allergen: filters.allergens.join(',') 
      }),
    });

    const response = await this.makeRequest<PaginatedResponse<RescueBag>>(
      `/api/rescue-bags/search?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Search failed');
  }

  async getRescueBagsByCategory(
    category: string,
    location: Location,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<RescueBag>> {
    const queryParams = new URLSearchParams({
      category,
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.makeRequest<PaginatedResponse<RescueBag>>(
      `/api/rescue-bags/category?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch bags by category');
  }

  async getRescueBagsByBusiness(
    businessId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<RescueBag>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.makeRequest<PaginatedResponse<RescueBag>>(
      `/api/rescue-bags/business/${businessId}?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch bags by business');
  }

  async getTrendingBags(location: Location): Promise<RescueBag[]> {
    const queryParams = new URLSearchParams({
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
    });

    const response = await this.makeRequest<RescueBag[]>(
      `/api/rescue-bags/trending?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch trending bags');
  }

  async getRecommendedBags(location: Location): Promise<RescueBag[]> {
    const queryParams = new URLSearchParams({
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
    });

    const response = await this.makeRequest<RescueBag[]>(
      `/api/rescue-bags/recommended?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch recommended bags');
  }

  async reportRescueBag(id: string, reason: string, description?: string): Promise<void> {
    const response = await this.makeRequest(`/api/rescue-bags/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to report rescue bag');
    }
  }

  async getRescueBagAnalytics(id: string): Promise<any> {
    const response = await this.makeRequest<any>(`/api/rescue-bags/${id}/analytics`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch rescue bag analytics');
  }

  // Cache management
  async cacheRescueBags(bags: RescueBag[]): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('cachedRescueBags', JSON.stringify({
        data: bags,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error caching rescue bags:', error);
    }
  }

  async getCachedRescueBags(): Promise<RescueBag[] | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cached = await AsyncStorage.getItem('cachedRescueBags');
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache is valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached rescue bags:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('cachedRescueBags');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const rescueBagService = RescueBagService.getInstance();
export { RescueBagService };
