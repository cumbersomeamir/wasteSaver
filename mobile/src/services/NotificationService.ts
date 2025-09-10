import PushNotification from 'react-native-push-notification';
import { Platform, Alert } from 'react-native';
import { NotificationSettings } from '@/types';

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    PushNotification.configure({
      onRegister: (token) => {
        console.log('FCM Token:', token);
        this.storeFCMToken(token.token);
      },
      onNotification: (notification) => {
        console.log('Notification received:', notification);
        this.handleNotification(notification);
      },
      onAction: (notification) => {
        console.log('Notification action:', notification);
        this.handleNotificationAction(notification);
      },
      onRegistrationError: (err) => {
        console.error('Registration error:', err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    this.isInitialized = true;
  }

  async requestPermissions(): Promise<{
    granted: boolean;
    canAskAgain: boolean;
    status: 'granted' | 'denied' | 'never_ask_again';
  }> {
    try {
      const permissions = await PushNotification.requestPermissions();
      
      return {
        granted: permissions.alert && permissions.badge && permissions.sound,
        canAskAgain: true, // FCM doesn't provide this info
        status: permissions.alert && permissions.badge && permissions.sound ? 'granted' : 'denied',
      };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  async checkPermissions(): Promise<{
    granted: boolean;
    canAskAgain: boolean;
    status: 'granted' | 'denied' | 'never_ask_again';
  }> {
    try {
      const permissions = await PushNotification.checkPermissions();
      
      return {
        granted: permissions.alert && permissions.badge && permissions.sound,
        canAskAgain: true,
        status: permissions.alert && permissions.badge && permissions.sound ? 'granted' : 'denied',
      };
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };
    }
  }

  async sendLocalNotification(notification: {
    title: string;
    message: string;
    data?: any;
    soundName?: string;
    playSound?: boolean;
    vibrate?: boolean;
    priority?: 'high' | 'low';
    importance?: 'high' | 'low';
  }): Promise<void> {
    PushNotification.localNotification({
      title: notification.title,
      message: notification.message,
      data: notification.data,
      soundName: notification.soundName || 'default',
      playSound: notification.playSound !== false,
      vibrate: notification.vibrate !== false,
      priority: notification.priority || 'high',
      importance: notification.importance || 'high',
      smallIcon: 'ic_notification',
      largeIcon: 'ic_launcher',
      color: '#4CAF50',
      actions: ['View', 'Dismiss'],
    });
  }

  async scheduleNotification(notification: {
    title: string;
    message: string;
    date: Date;
    data?: any;
    repeatType?: 'week' | 'day' | 'hour' | 'minute';
    repeatTime?: number;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      PushNotification.localNotificationSchedule({
        title: notification.title,
        message: notification.message,
        date: notification.date,
        data: notification.data,
        repeatType: notification.repeatType,
        repeatTime: notification.repeatTime,
        smallIcon: 'ic_notification',
        largeIcon: 'ic_launcher',
        color: '#4CAF50',
        actions: ['View', 'Dismiss'],
        id: Date.now().toString(),
      });

      resolve(Date.now().toString());
    });
  }

  async cancelNotification(id: string): Promise<void> {
    PushNotification.cancelLocalNotifications({ id });
  }

  async cancelAllNotifications(): Promise<void> {
    PushNotification.cancelAllLocalNotifications();
  }

  async getDeliveredNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getDeliveredNotifications((notifications) => {
        resolve(notifications);
      });
    });
  }

  async removeDeliveredNotifications(identifiers: string[]): Promise<void> {
    PushNotification.removeDeliveredNotifications(identifiers);
  }

  async clearAllDeliveredNotifications(): Promise<void> {
    PushNotification.clearAllDeliveredNotifications();
  }

  async setBadgeCount(count: number): Promise<void> {
    PushNotification.setApplicationIconBadgeNumber(count);
  }

  async getBadgeCount(): Promise<number> {
    return new Promise((resolve) => {
      PushNotification.getApplicationIconBadgeNumber((count) => {
        resolve(count);
      });
    });
  }

  async clearBadge(): Promise<void> {
    PushNotification.setApplicationIconBadgeNumber(0);
  }

  // Specific notification types
  async sendRescueBagAlert(bag: any): Promise<void> {
    await this.sendLocalNotification({
      title: 'New Rescue Bag Available! 🍽️',
      message: `${bag.title} from ${bag.business?.name} - $${bag.price}`,
      data: { type: 'rescue_bag', bagId: bag._id },
      priority: 'high',
    });
  }

  async sendPickupReminder(reservation: any): Promise<void> {
    await this.sendLocalNotification({
      title: 'Pickup Reminder ⏰',
      message: `Don't forget to pick up your ${reservation.rescueBag?.title} at ${reservation.pickupTime}`,
      data: { type: 'pickup_reminder', reservationId: reservation._id },
      priority: 'high',
    });
  }

  async sendPriceDropAlert(bag: any, oldPrice: number): Promise<void> {
    const savings = oldPrice - bag.price;
    await this.sendLocalNotification({
      title: 'Price Drop! 💰',
      message: `${bag.title} price dropped by $${savings.toFixed(2)}!`,
      data: { type: 'price_drop', bagId: bag._id },
      priority: 'high',
    });
  }

  async sendNewBusinessAlert(business: any): Promise<void> {
    await this.sendLocalNotification({
      title: 'New Business Joined! 🎉',
      message: `${business.name} is now offering rescue bags in your area`,
      data: { type: 'new_business', businessId: business._id },
      priority: 'low',
    });
  }

  async sendReservationConfirmation(reservation: any): Promise<void> {
    await this.sendLocalNotification({
      title: 'Reservation Confirmed! ✅',
      message: `Your ${reservation.rescueBag?.title} is reserved for pickup`,
      data: { type: 'reservation_confirmed', reservationId: reservation._id },
      priority: 'high',
    });
  }

  async sendReservationCancelled(reservation: any): Promise<void> {
    await this.sendLocalNotification({
      title: 'Reservation Cancelled ❌',
      message: `Your ${reservation.rescueBag?.title} reservation has been cancelled`,
      data: { type: 'reservation_cancelled', reservationId: reservation._id },
      priority: 'high',
    });
  }

  async sendTestNotification(): Promise<void> {
    await this.sendLocalNotification({
      title: 'Test Notification 🧪',
      message: 'This is a test notification from WasteSaver',
      data: { type: 'test' },
      priority: 'high',
    });
  }

  // Settings management
  async updateSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw new Error('Failed to update notification settings');
    }
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const settings = await AsyncStorage.getItem('notificationSettings');
      
      if (settings) {
        return JSON.parse(settings);
      }
      
      // Return default settings
      return {
        pushNotifications: true,
        emailNotifications: true,
        rescueBagAlerts: true,
        pickupReminders: true,
        priceDrops: true,
        newBusinesses: false,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        pushNotifications: true,
        emailNotifications: true,
        rescueBagAlerts: true,
        pickupReminders: true,
        priceDrops: true,
        newBusinesses: false,
      };
    }
  }

  // FCM Token management
  private async storeFCMToken(token: string): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('fcmToken', token);
      
      // Send token to server
      await this.sendTokenToServer(token);
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // Implementation to send token to your server
      // This would typically be an API call to register the device
      console.log('Sending FCM token to server:', token);
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  private handleNotification(notification: any): void {
    // Handle notification when app is in foreground
    console.log('Handling notification:', notification);
    
    // You can show an alert or update UI based on notification data
    if (notification.userInteraction) {
      // User tapped on notification
      this.handleNotificationTap(notification);
    }
  }

  private handleNotificationAction(notification: any): void {
    // Handle notification actions
    console.log('Handling notification action:', notification);
    
    if (notification.action === 'View') {
      this.handleNotificationTap(notification);
    }
  }

  private handleNotificationTap(notification: any): void {
    // Navigate to appropriate screen based on notification data
    const { type, data } = notification;
    
    switch (type) {
      case 'rescue_bag':
        // Navigate to rescue bag detail
        break;
      case 'pickup_reminder':
        // Navigate to reservation detail
        break;
      case 'price_drop':
        // Navigate to rescue bag detail
        break;
      case 'new_business':
        // Navigate to business profile
        break;
      case 'reservation_confirmed':
        // Navigate to reservation detail
        break;
      case 'reservation_cancelled':
        // Navigate to reservations list
        break;
      default:
        // Navigate to home
        break;
    }
  }

  // Background job for notifications
  async scheduleBackgroundNotifications(): Promise<void> {
    // Schedule recurring notifications for pickup reminders
    // This would typically be done with a background job library
    console.log('Scheduling background notifications');
  }

  async cancelBackgroundNotifications(): Promise<void> {
    // Cancel all background notifications
    await this.cancelAllNotifications();
  }
}

export const notificationService = NotificationService.getInstance();
export { NotificationService };
