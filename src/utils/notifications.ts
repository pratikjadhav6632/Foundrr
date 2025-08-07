// Check if the browser supports notifications
const isSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request permission from the user
const requestPermission = async (): Promise<boolean> => {
  if (!isSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Register the service worker
const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Subscribe to push notifications
const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  if (!isSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
    });
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
};

// Send a local notification
const sendLocalNotification = (title: string, options?: NotificationOptions) => {
  if (!isSupported() || Notification.permission !== 'granted') {
    console.warn('Cannot send notification: Notifications not supported or permission not granted');
    return;
  }

  const notification = new Notification(title, {
    icon: '/logo192.png', // Update with your app's icon
    badge: '/logo192.png',
    ...options,
  });

  return notification;
};

export const Notifications = {
  isSupported,
  requestPermission,
  registerServiceWorker,
  subscribeToPushNotifications,
  sendLocalNotification,
};
