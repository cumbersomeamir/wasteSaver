import 'react-native-gesture-handler/jestSetup';

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-maps
jest.mock('react-native-maps', () => 'MapView');

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => 'FastImage');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock Geolocation
jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

// Mock Push Notifications
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  onNotification: jest.fn(),
  onRegister: jest.fn(),
  requestPermissions: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  channelExists: jest.fn(),
  createChannel: jest.fn(),
  channelBlocked: jest.fn(),
  deleteChannel: jest.fn(),
  getChannels: jest.fn(),
  getInitialNotification: jest.fn(),
  getBadgeNumber: jest.fn(),
  setBadgeNumber: jest.fn(),
  clearAllNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  requestPermissions: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
  onRegister: jest.fn(),
  onNotification: jest.fn(),
  configure: jest.fn(),
}));

// Global test utilities
global.createTestProps = (props = {}) => ({
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    remove: jest.fn(),
  },
  route: {
    params: {},
  },
  ...props,
});

global.createTestUser = () => ({
  _id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  location: {
    type: 'Point',
    coordinates: [-73.935242, 40.730610],
  },
  totalSaved: 25.50,
  totalCO2eSaved: 15.2,
  totalWaterSaved: 120.5,
  favorites: [],
  dietaryPreferences: ['vegetarian'],
});

global.createTestRescueBag = () => ({
  _id: 'test-bag-id',
  title: 'Test Rescue Bag',
  description: 'A test rescue bag with fresh food',
  price: 5.99,
  originalValue: 15.99,
  category: 'bakery',
  businessId: {
    _id: 'test-business-id',
    name: 'Test Bakery',
    category: 'bakery',
    rating: { average: 4.5, count: 25 },
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610],
    },
  },
  pickupWindow: {
    start: new Date(Date.now() + 2 * 60 * 60 * 1000),
    end: new Date(Date.now() + 4 * 60 * 60 * 1000),
  },
  quantity: {
    available: 10,
    reserved: 0,
  },
  status: 'active',
  allergens: ['dairy'],
  dietaryTags: ['vegetarian'],
});
