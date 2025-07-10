import { databases, DATABASE_ID, COLLECTIONS, Query, client } from '../lib/appwrite';
import { ID } from 'appwrite';
import { Message } from '../types';

export class MessageService {
  async sendMessage(matchId: string, senderId: string, receiverId: string, content: string) {
    try {
      const message = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        ID.unique(),
        {
          matchId,
          senderId,
          receiverId,
          content,
          isRead: false
        }
      );
      return message as unknown as Message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getMessages(matchId: string) {
    try {
      const messages = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('matchId', matchId),
          Query.orderAsc('$createdAt')
        ]
      );
      return messages.documents as unknown as Message[];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async markMessageAsRead(messageId: string) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        messageId,
        { isRead: true }
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string) {
    try {
      const messages = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('receiverId', userId),
          Query.equal('isRead', false)
        ]
      );
      return messages.total;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  subscribeToMessages(matchId: string, callback: (event: any) => void) {
    return client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`,
      (response) => {
        if ((response.payload as any).matchId === matchId) {
          callback(response);
        }
      }
    );
  }

  async deleteMessage(messageId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        messageId
      );
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  async updateMessage(messageId: string, newContent: string) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        messageId,
        { content: newContent }
      );
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();