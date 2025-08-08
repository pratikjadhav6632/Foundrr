import { useCallback } from 'react';
import { Client, Account } from 'appwrite';

type NotificationType = 'message' | 'match' | 'comment' | 'like' | 'follow';

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userIds: string[]; // Array of user IDs to send the notification to
  data?: Record<string, any>; // Additional data to pass with the notification
}

export const useSendNotification = () => {
  const sendNotification = useCallback(async (notification: NotificationData) => {
    try {
      const client = new Client()
        .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
        .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
      
      const account = new Account(client);
      
      // Get the current session
      const session = await account.getSession('current');
      
      if (!session) {
        console.error('No active session found');
        return { success: false, error: 'Not authenticated' };
      }

      // Call the Appwrite function to send the notification
      const response = await fetch(
        `${import.meta.env.VITE_APPWRITE_ENDPOINT}/functions/notifications`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': import.meta.env.VITE_APPWRITE_PROJECT_ID,
            'X-Appwrite-Key': import.meta.env.VITE_APPWRITE_API_KEY,
          },
          body: JSON.stringify({
            type: notification.type,
            title: notification.title,
            message: notification.message,
            userIds: notification.userIds,
            data: notification.data || {},
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send notification');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }, []);

  return { sendNotification };
};
