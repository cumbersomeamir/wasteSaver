// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  totalSaved: number;
  totalCO2eSaved: number;
  totalWaterSaved: number;
  favorites: string[];
  dietaryPreferences: string[];
  notificationSettings: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  rescueBagAlerts: boolean;
  pickupReminders: boolean;
  priceDrops: boolean;
  newBusinesses: boolean;
}

// Business Types
export interface Business {
  _id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  address: Address;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  rating: {
    average: number;
    count: number;
  };
  images: string[];
  operatingHours: OperatingHours[];
  contact: ContactInfo;
  isActive: boolean;
  rescueBagSettings: RescueBagSettings;
  createdAt: string;
  updatedAt: string;
}

export type BusinessCategory = 
  | 'bakery' 
  | 'restaurant' 
  | 'cafe' 
  | 'grocery' 
  | 'convenience' 
  | 'wholesale' 
  | 'other';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: [number, number];
}

export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
}

export interface RescueBagSettings {
  autoPause: boolean;
  pauseTime: string;
  maxReservations: number;
  advanceNotice: number; // hours
}

// Rescue Bag Types
export interface RescueBag {
  _id: string;
  businessId: string | Business;
  title: string;
  description: string;
  category: RescueBagCategory;
  price: number;
  originalValue?: number;
  pickupWindow: {
    start: string;
    end: string;
  };
  allergens: Allergen[];
  dietaryTags: DietaryTag[];
  quantity: {
    available: number;
    reserved: number;
  };
  images: ImageInfo[];
  status: RescueBagStatus;
  environmentalImpact: {
    co2Saved: number;
    waterSaved: number;
  };
  isRescueParcel: boolean;
  deliveryOptions: DeliveryOptions;
  distance?: number;
  timeUntilPickup?: number;
  discountPercentage?: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RescueBagCategory = 
  | 'bakery' 
  | 'meals' 
  | 'groceries' 
  | 'produce' 
  | 'dairy' 
  | 'mixed' 
  | 'other';

export type RescueBagStatus = 'active' | 'paused' | 'sold-out' | 'expired';

export type Allergen = 
  | 'dairy' 
  | 'eggs' 
  | 'fish' 
  | 'shellfish' 
  | 'tree-nuts' 
  | 'peanuts' 
  | 'wheat' 
  | 'soy' 
  | 'none';

export type DietaryTag = 
  | 'vegetarian' 
  | 'vegan' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'organic' 
  | 'local' 
  | 'seasonal';

export interface ImageInfo {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface DeliveryOptions {
  available: boolean;
  radius: number;
  fee: number;
}

// Reservation Types
export interface Reservation {
  _id: string;
  userId: string;
  rescueBagId: string | RescueBag;
  quantity: number;
  status: ReservationStatus;
  pickupTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'picked-up' 
  | 'cancelled' 
  | 'expired';

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'never_ask_again';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  RescueBagDetail: { bagId: string };
  Reservation: { bagId: string };
  Pickup: { reservationId: string };
  OrderHistory: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Favorites: undefined;
  Discover: undefined;
  Home: undefined;
};

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Favorites: undefined;
  Profile: undefined;
};

// Filter Types
export interface RescueBagFilters {
  category?: RescueBagCategory;
  maxPrice?: number;
  minPrice?: number;
  dietary?: DietaryTag[];
  allergens?: Allergen[];
  sortBy?: 'distance' | 'price' | 'rating' | 'pickupTime';
  radius?: number;
}

// Search Types
export interface SearchQuery {
  query: string;
  location: Location;
  filters: RescueBagFilters;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dietaryPreferences?: DietaryTag[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Context Types
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponse>>;
  signup: (data: SignupData) => Promise<ApiResponse<AuthResponse>>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export interface LocationContextType {
  location: Location | null;
  permission: LocationPermission | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Location | null>;
  watchPosition: (callback: (location: Location) => void) => number;
  clearWatch: (watchId: number) => void;
}

// Component Props Types
export interface ScreenProps {
  navigation: any;
  route: any;
}

export interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
  size?: number;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
