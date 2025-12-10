import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import OneSignal from 'react-onesignal';
import { Client, Account, Databases, Query } from 'appwrite';
import { DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { Notification as AppNotification, isDatabaseNotification } from '../types/notification';

// Define the notification permission type
type NotificationPermission = 'default' | 'granted' | 'denied';

interface OneSignalContextType {
  notifications: AppNotification[];
  unreadCount: number;
  initializePushNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  isInitialized: boolean;
  isLoading: boolean;
  permissionStatus: NotificationPermission;
  requestNotificationPermission: () => Promise<boolean>;
}

// Type for notification data
interface NotificationData {
  type?: string;
  [key: string]: any;
}

declare global {
  namespace OneSignal {
    interface Notification {
      notificationId?: string;
      data?: Record<string, any>;
      title?: string;
      body?: string;
      [key: string]: any;
    }
    
    namespace Notifications {
      interface Event {
        notification: Notification;
        preventDefault: () => void;
      }
      
      function addEventListener(
        event: 'click' | 'foregroundWillDisplay',
        handler: (event: Event) => void
      ): void;
      
      function requestPermission(): Promise<boolean>;
      
      const permission: boolean;
    }
  }
}

const OneSignalContext = createContext<OneSignalContextType | undefined>(undefined);

export const OneSignalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  
  const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
  
  const account = new Account(client);
  const databases = new Databases(client);

  // Initialize OneSignal
  const initializeOneSignal = useCallback(async () => {
    try {
      await OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID || '',
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        notifyButton: {
          enable: true,
          size: 'medium',
          position: 'bottom-left',
          showCredit: false,
          prenotify: true,
          text: {
            'tip.state.unsubscribed': 'Subscribe to notifications',
            'tip.state.subscribed': 'You\'re subscribed to notifications',
            'tip.state.blocked': 'You\'ve blocked notifications',
            'message.prenotify': 'Click to subscribe to notifications',
            'message.action.subscribed': 'Thanks for subscribing!',
            'message.action.subscribing': 'Subscribing...',
            'message.action.resubscribed': 'You\'re subscribed to notifications',
            'message.action.unsubscribed': 'You won\'t receive notifications',
            'dialog.main.title': 'Manage Site Notifications',
            'dialog.main.button.subscribe': 'SUBSCRIBE',
            'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
            'dialog.blocked.title': 'Unblock Notifications',
            'dialog.blocked.message': 'Follow these instructions to allow notifications:'
          } as const,
        } as const,
      });
      
      // Set the external user ID to match Appwrite user ID
      try {
        const user = await account.get();
        if (user && user.$id) {
          await OneSignal.login(user.$id);
        }
      } catch (error) {
        console.error('Error setting OneSignal user ID:', error);
      }
      
      // Set up notification handlers
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
        // Prevent default notification display
        event.preventDefault();
        
        // Get the notification data with proper typing
        const notification = event.notification as OneSignal.Notification & {
          data?: Record<string, any>;
          notificationId?: string;
        };
        
        // Safely extract notification data
        const notificationData = notification.data || {};
        const notificationId = notification.notificationId || `temp-${Date.now()}`;
        
        // Create new notification with proper typing
        const newNotification: AppNotification = {
          id: notificationId,
          type: typeof notificationData.type === 'string' ? 
            (notificationData.type as any) : 'system',
          title: notification.title || 'New Notification',
          message: notification.body || '',
          data: notificationData,
          userId: '', // Will be set when user is available
          read: false,
          createdAt: new Date().toISOString()
        };
        
        // Update state with new notification
        setNotifications(prev => [newNotification, ...prev]);
        
        // You can also show a custom in-app notification here
      });
      
      // Handle notification clicks
      OneSignal.Notifications.addEventListener('click', (event) => {
        const notification = event.notification;
        // Handle notification click (e.g., navigate to a specific page)
        if (notification.data?.url) {
          window.location.href = notification.data.url;
        }
      });
      
          // Set initial permission status
      const hasPermission = await OneSignal.Notifications.permission;
      const initialStatus: NotificationPermission = hasPermission === true ? 'granted' : 'denied';
      setPermissionStatus(initialStatus);
      
      // Register the service worker
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/OneSignalSDKWorker.js');
          console.log('Service Worker registered with scope:', registration.scope);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
      
      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
      setIsInitialized(false);
      return false;
    }
  }, [account]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!isInitialized) return false;
      
      // Request permission and handle the response
      const permissionResult = await OneSignal.Notifications.requestPermission();
      // Check if permission was granted (handle both boolean and void cases)
      const hasPermission = permissionResult === true || permissionResult === undefined;
      const newStatus: NotificationPermission = hasPermission ? 'granted' : 'denied';
      setPermissionStatus(newStatus);
      return hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setPermissionStatus('denied');
      return false;
    }
  }, [isInitialized]);

  // Initialize push notifications
  const initializePushNotifications = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      setIsLoading(true);
      await initializeOneSignal();
      await fetchNotifications();
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initializeOneSignal]);

  // Fetch notifications from Appwrite
  const fetchNotifications = useCallback(async () => {
    try {
      const user = await account.get();
      if (!user || !user.$id) return;
      
      setIsLoading(true);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]
      );
      
      const fetchedNotifications = response.documents
        .filter(isDatabaseNotification)
        .map(doc => ({
          id: doc.$id,
          type: doc.type,
          title: doc.title,
          message: doc.message,
          data: doc.data,
          userId: doc.userId,
          read: doc.read,
          createdAt: doc.$createdAt
        }));
      
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, databases]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        { read: true }
      );
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [databases]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const user = await account.get();
      if (!user || !user.$id) return;
      
      // Get all unread notifications
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal('userId', user.$id),
          Query.equal('read', false)
        ]
      );
      
      // Mark each as read
      const updatePromises = response.documents.map(doc => 
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.NOTIFICATIONS,
          doc.$id,
          { read: true }
        )
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [account, databases]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(notif => !notif.read).length;
  }, [notifications]);

  // Effect to initialize OneSignal on mount
  useEffect(() => {
    // Only initialize if not already initialized and in browser
    if (typeof window !== 'undefined' && !isInitialized) {
      initializePushNotifications();
    }
    
    // Cleanup
    return () => {
      // No need to manually remove event listeners in OneSignal v16+
      // They are automatically cleaned up
    };
  }, [isInitialized, initializePushNotifications]);

  const value = {
    notifications,
    unreadCount,
    initializePushNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isInitialized,
    isLoading,
    permissionStatus,
    requestNotificationPermission,
  };

  return (
    <OneSignalContext.Provider value={value}>
      {children}
    </OneSignalContext.Provider>
  );
};

export const useOneSignal = () => {
  const context = useContext(OneSignalContext);
  if (context === undefined) {
    throw new Error('useOneSignal must be used within a OneSignalProvider');
  }
  return context;
};

export default OneSignalContext;
