// Notification type literals
export type NotificationType = 'message' | 'match' | 'comment' | 'like' | 'follow' | 'system';

// Notification data that can be extended with custom properties
export interface NotificationData {
  url?: string;
  [key: string]: any;
}

// Base notification interface
export interface BaseNotification {
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}

// Appwrite document fields
export interface AppwriteDocument {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

// Notification stored in the database (Appwrite)
export interface DatabaseNotification extends AppwriteDocument, BaseNotification {
  userId: string;
  read: boolean;
}

// Notification used in the application
export interface Notification extends BaseNotification {
  id: string;
  read: boolean;
  createdAt: string | Date;
  userId?: string;
}

// Type guard to check if an object is a Notification
export function isNotification(obj: any): obj is Notification {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'type' in obj &&
    'title' in obj &&
    'message' in obj &&
    'read' in obj &&
    'createdAt' in obj
  );
}

// Type guard to check if an object is a DatabaseNotification
export function isDatabaseNotification(obj: any): obj is DatabaseNotification {
  return (
    obj &&
    typeof obj === 'object' &&
    '$id' in obj &&
    '$collectionId' in obj &&
    '$createdAt' in obj &&
    'userId' in obj &&
    'read' in obj
  );
}
