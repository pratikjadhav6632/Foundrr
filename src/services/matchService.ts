import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { ID } from 'appwrite';
import { Match } from '../types';

export class MatchService {
  async createMatch(user1Id: string, user2Id: string, user1Liked: boolean) {
    try {
      // Check if match already exists
      const existingMatch = await this.getExistingMatch(user1Id, user2Id);
      
      if (existingMatch) {
        // Update existing match
        const isMatched = user1Liked && existingMatch.user2Liked;
        return await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.MATCHES,
          existingMatch.$id,
          {
            user1Liked,
            isMatched
          }
        ) as unknown as Match;
      } else {
        // Create new match
        const match = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.MATCHES,
          ID.unique(),
          {
            user1Id,
            user2Id,
            user1Liked,
            user2Liked: false,
            isMatched: false
          }
        );
        return match as unknown as Match;
      }
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  async getExistingMatch(user1Id: string, user2Id: string) {
    try {
      const matches = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MATCHES,
        [
          Query.or([
            Query.and([
              Query.equal('user1Id', user1Id),
              Query.equal('user2Id', user2Id)
            ]),
            Query.and([
              Query.equal('user1Id', user2Id),
              Query.equal('user2Id', user1Id)
            ])
          ])
        ]
      );
      return matches.documents[0] as unknown as Match || null;
    } catch (error) {
      console.error('Error getting existing match:', error);
      return null;
    }
  }

  async getUserMatches(userId: string) {
    try {
      const matches = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MATCHES,
        [
          Query.or([
            Query.equal('user1Id', userId),
            Query.equal('user2Id', userId)
          ]),
          Query.equal('isMatched', true)
        ]
      );
      return matches.documents as unknown as Match[];
    } catch (error) {
      console.error('Error getting user matches:', error);
      return [];
    }
  }

  async handleSwipe(currentUserId: string, targetUserId: string, liked: boolean) {
    try {
      if (!liked) {
        // Just record the dislike, no match created
        return null;
      }

      // Check if a match exists in either direction
      const existingMatch = await this.getExistingMatch(currentUserId, targetUserId);
      
      if (existingMatch) {
        // If the current user is user1
        if (existingMatch.user1Id === currentUserId) {
          const isMatched = existingMatch.user2Liked;
          return await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.MATCHES,
            existingMatch.$id,
            {
              user1Liked: true,
              isMatched
            }
          ) as unknown as Match;
        }
        // If the current user is user2
        else if (existingMatch.user2Id === currentUserId) {
          const isMatched = existingMatch.user1Liked;
          return await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.MATCHES,
            existingMatch.$id,
            {
              user2Liked: true,
              isMatched
            }
          ) as unknown as Match;
        }
      }

      // Create new match record
      return await this.createMatch(currentUserId, targetUserId, true);
    } catch (error) {
      console.error('Error handling swipe:', error);
      throw error;
    }
  }

  async getPendingRequests(userId: string) {
    try {
      // Find matches where the current user is user2 and user1Liked is true, user2Liked is false, isMatched is false
      const matches1 = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MATCHES,
        [
          Query.equal('user2Id', userId),
          Query.equal('user1Liked', true),
          Query.equal('user2Liked', false),
          Query.equal('isMatched', false)
        ]
      );
      // Also find matches where the current user is user1 and user2Liked is true, user1Liked is false, isMatched is false
      const matches2 = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MATCHES,
        [
          Query.equal('user1Id', userId),
          Query.equal('user2Liked', true),
          Query.equal('user1Liked', false),
          Query.equal('isMatched', false)
        ]
      );
      return [
        ...matches1.documents as unknown as Match[],
        ...matches2.documents as unknown as Match[]
      ];
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  }

  async acceptRequest(matchId: string) {
    try {
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MATCHES,
        matchId,
        {
          user2Liked: true,
          isMatched: true
        }
      );
      return updated as unknown as Match;
    } catch (error) {
      console.error('Error accepting request:', error);
      throw error;
    }
  }

  async deleteMatch(matchId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MATCHES,
        matchId
      );
      return true;
    } catch (error) {
      console.error('Error deleting match:', error);
      throw error;
    }
  }
}

export const matchService = new MatchService();