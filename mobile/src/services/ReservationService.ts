import { Reservation, ReservationStatus, ApiResponse, PaginatedResponse } from '@/types';
import { API_BASE_URL } from '@/constants/api';

class ReservationService {
  private static instance: ReservationService;
  private baseURL = API_BASE_URL;

  public static getInstance(): ReservationService {
    if (!ReservationService.instance) {
      ReservationService.instance = new ReservationService();
    }
    return ReservationService.instance;
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
      console.error('ReservationService request error:', error);
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

  async getReservations(params: {
    page?: number;
    limit?: number;
    status?: ReservationStatus;
  } = {}): Promise<PaginatedResponse<Reservation>> {
    const { page = 1, limit = 20, status } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });

    const response = await this.makeRequest<PaginatedResponse<Reservation>>(
      `/api/reservations?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch reservations');
  }

  async getReservationById(id: string): Promise<Reservation> {
    const response = await this.makeRequest<{ reservation: Reservation }>(
      `/api/reservations/${id}`
    );

    if (response.success && response.data) {
      return response.data.reservation;
    }

    throw new Error(response.error || 'Failed to fetch reservation');
  }

  async createReservation(params: {
    rescueBagId: string;
    quantity: number;
    notes?: string;
  }): Promise<Reservation> {
    const response = await this.makeRequest<Reservation>('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to create reservation');
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const response = await this.makeRequest<Reservation>(`/api/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to update reservation');
  }

  async cancelReservation(id: string, reason?: string): Promise<Reservation> {
    const response = await this.makeRequest<Reservation>(`/api/reservations/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to cancel reservation');
  }

  async confirmPickup(id: string, notes?: string): Promise<Reservation> {
    const response = await this.makeRequest<Reservation>(`/api/reservations/${id}/confirm-pickup`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to confirm pickup');
  }

  async getReservationHistory(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Reservation>> {
    const { page = 1, limit = 20 } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.makeRequest<PaginatedResponse<Reservation>>(
      `/api/reservations/history?${queryParams}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch reservation history');
  }

  async getActiveReservations(): Promise<Reservation[]> {
    const response = await this.makeRequest<Reservation[]>(
      '/api/reservations/active'
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch active reservations');
  }

  async getUpcomingReservations(): Promise<Reservation[]> {
    const response = await this.makeRequest<Reservation[]>(
      '/api/reservations/upcoming'
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch upcoming reservations');
  }

  async getReservationStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    totalSaved: number;
    totalCO2eSaved: number;
    totalWaterSaved: number;
  }> {
    const response = await this.makeRequest<any>('/api/reservations/stats');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch reservation stats');
  }

  async rescheduleReservation(id: string, newPickupTime: string): Promise<Reservation> {
    const response = await this.makeRequest<Reservation>(`/api/reservations/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ pickupTime: newPickupTime }),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to reschedule reservation');
  }

  async addReservationNote(id: string, note: string): Promise<Reservation> {
    const response = await this.makeRequest<Reservation>(`/api/reservations/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to add note to reservation');
  }

  async getReservationQRCode(id: string): Promise<string> {
    const response = await this.makeRequest<{ qrCode: string }>(
      `/api/reservations/${id}/qr-code`
    );

    if (response.success && response.data) {
      return response.data.qrCode;
    }

    throw new Error(response.error || 'Failed to get QR code');
  }

  async validateReservationQRCode(qrCode: string): Promise<Reservation> {
    const response = await this.makeRequest<Reservation>('/api/reservations/validate-qr', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to validate QR code');
  }

  async getReservationReminders(): Promise<Reservation[]> {
    const response = await this.makeRequest<Reservation[]>(
      '/api/reservations/reminders'
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to fetch reservation reminders');
  }

  async setReservationReminder(id: string, reminderTime: string): Promise<void> {
    const response = await this.makeRequest(`/api/reservations/${id}/reminder`, {
      method: 'POST',
      body: JSON.stringify({ reminderTime }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to set reminder');
    }
  }

  async cancelReservationReminder(id: string): Promise<void> {
    const response = await this.makeRequest(`/api/reservations/${id}/reminder`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel reminder');
    }
  }

  // Cache management
  async cacheReservations(reservations: Reservation[]): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('cachedReservations', JSON.stringify({
        data: reservations,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error caching reservations:', error);
    }
  }

  async getCachedReservations(): Promise<Reservation[] | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const cached = await AsyncStorage.getItem('cachedReservations');
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache is valid for 2 minutes
        if (Date.now() - timestamp < 2 * 60 * 1000) {
          return data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached reservations:', error);
      return null;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('cachedReservations');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const reservationService = ReservationService.getInstance();
export { ReservationService };
