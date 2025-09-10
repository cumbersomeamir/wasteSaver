import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, SignupData, User, AuthResponse, ApiResponse } from '@/types';
import { API_BASE_URL } from '@/constants/api';

class AuthService {
  private static instance: AuthService;
  private baseURL = API_BASE_URL;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
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
      console.error('AuthService request error:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      await this.storeAuthData(response.data);
      return response.data;
    }

    throw new Error(response.error || 'Login failed');
  }

  async signup(userData: SignupData): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      await this.storeAuthData(response.data);
      return response.data;
    }

    throw new Error(response.error || 'Signup failed');
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate token on server
      await this.makeRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      await this.clearAuthData();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.data) {
      await this.storeAuthData(response.data);
      return response.data;
    }

    throw new Error(response.error || 'Token refresh failed');
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.makeRequest<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      // Update stored user data
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      return response.data;
    }

    throw new Error(response.error || 'Profile update failed');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await this.makeRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Password change failed');
    }
  }

  async resetPassword(email: string): Promise<void> {
    const response = await this.makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Password reset failed');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await this.makeRequest('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Email verification failed');
    }
  }

  async resendVerificationEmail(): Promise<void> {
    const response = await this.makeRequest('/api/auth/resend-verification', {
      method: 'POST',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to resend verification email');
    }
  }

  async deleteAccount(): Promise<void> {
    const response = await this.makeRequest('/api/auth/delete-account', {
      method: 'DELETE',
    });

    if (response.success) {
      await this.clearAuthData();
    } else {
      throw new Error(response.error || 'Account deletion failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    const user = await this.getCurrentUser();
    return !!(token && user);
  }

  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', authData.token);
      await AsyncStorage.setItem('userData', JSON.stringify(authData.user));
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Biometric authentication methods
  async enableBiometric(): Promise<void> {
    // Implementation for biometric authentication
    // This would integrate with react-native-biometrics
    throw new Error('Biometric authentication not implemented');
  }

  async authenticateWithBiometric(): Promise<AuthResponse> {
    // Implementation for biometric authentication
    throw new Error('Biometric authentication not implemented');
  }

  // Social authentication methods
  async loginWithGoogle(): Promise<AuthResponse> {
    // Implementation for Google OAuth
    throw new Error('Google authentication not implemented');
  }

  async loginWithApple(): Promise<AuthResponse> {
    // Implementation for Apple Sign-In
    throw new Error('Apple authentication not implemented');
  }

  async loginWithFacebook(): Promise<AuthResponse> {
    // Implementation for Facebook OAuth
    throw new Error('Facebook authentication not implemented');
  }
}

export const authService = AuthService.getInstance();
export { AuthService };
