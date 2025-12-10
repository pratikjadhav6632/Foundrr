import OneSignal from 'react-onesignal';
import { Client, Account, Databases } from 'appwrite';
import { DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { Notification as NotificationType } from '../types/notification';

// Extend the OneSignal types to include the create method
declare module 'react-onesignal' {
  interface OneSignal {
    Notifications: {
      create: (options: any) => Promise<any>;
    };
  }
}

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

interface SendNotificationOptions {
  userIds: string[];
  title: string;
  message: string;
  data?: Record<string, any>;
  type?: NotificationType['type'];
  url?: string;
}

/**
 * Sends a notification to specified users via OneSignal
 */
export const sendNotification = async (options: SendNotificationOptions) => {
  const { userIds, title, message, data = {}, type = 'system', url } = options;
  
  try {
    // Send push notification via OneSignal
    await OneSignal.Notifications.create({
      contents: { en: message },
      headings: { en: title },
      include_external_user_ids: userIds,
      data: {
        ...data,
        type,
        url,
        sentAt: new Date().toISOString(),
      },
      // Additional options can be added here
      // https://documentation.onesignal.com/reference/create-notification
    } as any); // Using type assertion as a workaround for type issues
    
    // Also save to Appwrite for in-app notifications
    const notificationPromises = userIds.map(userId => {
      return databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        'unique()',
        {
          userId,
          type,
          title,
          message,
          data: JSON.stringify(data),
          read: false,
        }
      );
    });
    
    await Promise.all(notificationPromises);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
};

/**
 * Sends a notification to a specific user
 */
export const sendUserNotification = async (
  userId: string, 
  title: string, 
  message: string, 
  options: Omit<SendNotificationOptions, 'userIds' | 'title' | 'message'> = {}
) => {
  return sendNotification({
    userIds: [userId],
    title,
    message,
    ...options,
  });
};

/**
 * Sends a notification to the current user
 */
export const sendCurrentUserNotification = async (
  title: string, 
  message: string, 
  options: Omit<SendNotificationOptions, 'userIds' | 'title' | 'message'> = {}
) => {
  try {
    const currentUser = await account.get();
    if (!currentUser || !currentUser.$id) {
      throw new Error('User not authenticated');
    }
    
    return sendNotification({
      userIds: [currentUser.$id],
      title,
      message,
      ...options,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return { success: false, error };
  }
};

/**
 * Sends a notification to all users
 */
export const sendBroadcastNotification = async (
  title: string, 
  message: string, 
  options: Omit<SendNotificationOptions, 'userIds' | 'title' | 'message'> = {}
) => {
  // For broadcasting to all users, we can use segments or tags in OneSignal
  // This is a simplified example - you might need to adjust based on your OneSignal setup
  try {
    await OneSignal.Notifications.create({
      contents: { en: message },
      headings: { en: title },
      included_segments: ['Subscribed Users'], // Adjust segment as needed
      data: {
        ...options.data,
        type: options.type || 'system',
        url: options.url,
        sentAt: new Date().toISOString(),
      },
    } as any); // Using type assertion as a workaround for type issues
    
    return { success: true };
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    return { success: false, error };
  }
};
