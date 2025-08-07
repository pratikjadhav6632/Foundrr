import React, { createContext, useContext, useEffect, useState } from 'react';
import { Notifications } from '../utils/notifications';

type NotificationContextType = {
  isSupported: boolean;
  permission: NotificationPermission | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<PushSubscription | null>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  isSubscribed: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const isSupported = Notifications.isSupported();

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, [isSupported]);

  const checkSubscription = async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notifications.requestPermission();
      setPermission(Notification.permission);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribe = async (): Promise<PushSubscription | null> => {
    if (!isSupported || !permission || permission !== 'granted') {
      await requestPermission();
      if (Notification.permission !== 'granted') {
        return null;
      }
    }

    try {
      await Notifications.registerServiceWorker();
      const subscription = await Notifications.subscribeToPushNotifications();
      setIsSubscribed(!!subscription);
      
      // Here you would typically send the subscription to your backend
      // await sendSubscriptionToBackend(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    Notifications.sendLocalNotification(title, options);
  };

  return (
    <NotificationContext.Provider
      value={{
        isSupported,
        permission,
        requestPermission,
        subscribe,
        sendNotification,
        isSubscribed,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
