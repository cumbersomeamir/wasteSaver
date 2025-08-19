// Mock Notification Service for development
// In production, implement actual push notification functionality

export const NotificationService = {
  requestPermissions: async () => {
    // Mock permission request
    return Promise.resolve(true);
  },

  scheduleLocalNotification: (notification) => {
    // Mock local notification scheduling
    console.log('Mock: Scheduling notification:', notification);
    return Promise.resolve('mock-notification-id');
  },

  cancelLocalNotification: (notificationId) => {
    // Mock local notification cancellation
    console.log('Mock: Cancelling notification:', notificationId);
    return Promise.resolve();
  },

  sendPushNotification: (title, body, data) => {
    // Mock push notification
    console.log('Mock: Sending push notification:', { title, body, data });
    return Promise.resolve();
  },
};
