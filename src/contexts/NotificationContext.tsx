import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Client, Account, Databases, Query } from 'appwrite';
import OneSignal from 'react-onesignal';
import { DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { 
  Notification as NotificationType,
  DatabaseNotification,
  isDatabaseNotification
} from '../types/notification';

interface AppNotification extends Omit<NotificationType, 'id' | 'createdAt' | 'read' | 'userId'> {
  id: string;
  createdAt: string;
  read: boolean;
  userId: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  initializePushNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'userId'>) => AppNotification;
  isInitialized: boolean;
  isLoading: boolean;
  permissionStatus: NotificationPermission;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Save that we've requested permission
const setPermissionRequested = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('notificationPermissionRequested', 'true');
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  
  const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
  
  const databases = new Databases(client);

  // Calculate unread count
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Fetch notifications from Appwrite
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const account = new Account(client);
      const user = await account.get();
      
      if (!user) return;
      
      // Fetch notifications from your notifications collection
      const response = await databases.listDocuments<DatabaseNotification>(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(50) // Limit to 50 most recent notifications
        ]
      );
      
      // Transform the response to match the AppNotification interface
      const fetchedNotifications = response.documents
        .filter(isDatabaseNotification)
        .map(doc => ({
          id: doc.$id,
          type: doc.type,
          title: doc.title,
          message: doc.message,
          read: Boolean(doc.read),
          createdAt: doc.$createdAt,
          data: doc.data || {},
          userId: doc.userId
        } as AppNotification));
      
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [client, databases]);

  // Check notification permission status
  const checkNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('OneSignal' in window)) {
      console.log('OneSignal is not available');
      return false;
    }

    try {
      // Check OneSignal's internal permission state
      const permission = await OneSignal.Notifications.permission;
      setPermissionStatus(permission ? 'granted' : 'denied');
      
      // If permission is already granted, initialize OneSignal
      if (permission === true) {
        await initializeOneSignal();
        return true;
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
    
    return false;
  }, []);

  // Request notification permission through OneSignal
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.OneSignal) return false;
    
    try {
      // This will show the native browser permission prompt
      const permission = await OneSignal.Notifications.permission;
      setPermissionStatus(permission ? 'granted' : 'denied');
      setPermissionRequested();
      
      if (permission) {
        await initializeOneSignal();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Initialize OneSignal
  const initializeOneSignal = async () => {
    if (isInitialized || typeof window === 'undefined' || !window.OneSignal) return;

    try {
      // Initialize OneSignal if not already done
      await OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
      });

      console.log('OneSignal initialized successfully');
      setIsInitialized(true);
      
      // Set up notification permission change listener
      OneSignal.Notifications.addEventListener('permissionChange', (permission: boolean) => {
        console.log('Notification permission changed:', permission);
        setPermissionStatus(permission ? 'granted' : 'denied');
      });
      
      // Set up notification click handler
      OneSignal.Notifications.addEventListener('click', (event) => {
        console.log('Notification clicked:', event);
        // Handle notification click if needed
      });
      
      // Fetch initial notifications
      await fetchNotifications();
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  };

  const initializePushNotifications = useCallback(async () => {
    await checkNotificationPermission();

    try {
      // Initialize OneSignal with minimal configuration
      await OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
      });

      // Request notification permission
      const permission = await OneSignal.Notifications.requestPermission();
      console.log('Notification permission:', permission);
      
      // Get the current user
      const account = new Account(
        new Client()
          .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
          .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)
      );

      try {
        const user = await account.get();
        await OneSignal.login(user.$id);
        console.log('OneSignal user ID set:', user.$id);
      } catch (error) {
        console.log('User not logged in or error getting user:', error);
      }

      // Set up notification click handler
      OneSignal.Notifications.addEventListener('click', (event: any) => {
        console.log('Notification clicked:', event);
        // Handle notification click, e.g., navigate to a specific page
        const notification = event.notification;
        if (notification?.data?.url) {
          window.open(notification.data.url, '_blank');
        } else if (notification?.url) {
          window.open(notification.url, '_blank');
        }
      });

      // Handle foreground notifications
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: any) => {
        console.log('Notification will display in foreground:', event);
        // You can customize the notification display here
        // event.preventDefault(); // Prevent default notification display
        // const notification = event.notification;
        // showCustomNotification(notification);
      });

      // Fetch notifications when OneSignal is initialized
      await fetchNotifications();
      
      setIsInitialized(true);
      console.log('OneSignal initialized successfully');
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  }, [isInitialized, fetchNotifications]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId && !notification.read
          ? { ...notification, read: true }
          : notification
      )
    );
    
    try {
      // Update the notification in the database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        { read: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert the local state if the API call fails
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: false }
            : notification
        )
      );
    }
  }, [databases]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;
    
    // Optimistically update the UI
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        read: true,
      }))
    );
    
    try {
      // Get the current user
      const account = new Account(client);
      const user = await account.get();
      
      // Update all unread notifications for this user one by one
      // since Appwrite doesn't support batch updates in the client SDK
      await Promise.all(
        unreadNotifications.map(notification => 
          databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.NOTIFICATIONS,
            notification.id,
            { read: true }
          )
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert the local state if the API call fails
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read: unreadNotifications.some(n => n.id === notification.id) 
            ? false 
            : notification.read,
        }))
      );
    }
  }, [notifications, databases]);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'userId'>): AppNotification => {
    const newNotification: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
      data: notification.data || {},
      userId: '' // Will be set when saving to the database
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  }, []);

  // Fetch notifications when component mounts and when user changes
  useEffect(() => {
    if (isInitialized) {
      fetchNotifications();

      // Set up a refresh interval (e.g., every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);
      
      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [isInitialized, fetchNotifications]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      checkNotificationPermission();
    }
  }, [checkNotificationPermission]);

  const contextValue = {
    notifications,
    unreadCount,
    initializePushNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    isInitialized,
    isLoading,
    permissionStatus,
    requestNotificationPermission
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
