import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { uploadToCloudinary } from './cloudinaryService';
import { ID } from 'appwrite';
import { Profile } from '../types';

export class ProfileService {
  async uploadProfileImage(file: File): Promise<string> {
    try {
      return await uploadToCloudinary(file);
    } catch (error) {
      console.error('Error uploading profile image to Cloudinary:', error);
      throw error;
    }
  }

  async createProfile(profileData: Omit<Profile, '$id' | '$createdAt' | '$updatedAt'> & { profileImage?: File | string }) {
    try {
      let profileImageUrl = profileData.profileImage;
      if (
        profileData.profileImage &&
        Object.prototype.toString.call(profileData.profileImage) === '[object File]'
      ) {
        profileImageUrl = await this.uploadProfileImage(profileData.profileImage as File);
      }
      const profile = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        ID.unique(),
        { ...profileData, profileImage: profileImageUrl, whoYouAre: profileData.whoYouAre }
      );
      return profile as unknown as Profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      const profiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [Query.equal('userId', userId)]
      );
      return profiles.documents[0] as unknown as Profile || null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  async updateProfile(profileId: string, profileData: Partial<Profile> & { profileImage?: File | string }) {
    try {
      let profileImageUrl = profileData.profileImage;
      if (
        profileData.profileImage &&
        Object.prototype.toString.call(profileData.profileImage) === '[object File]'
      ) {
        profileImageUrl = await this.uploadProfileImage(profileData.profileImage as File);
      }
      const profile = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        profileId,
        { ...profileData, profileImage: profileImageUrl }
      );
      return profile as unknown as Profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getProfilesForMatching(currentUserId: string, limit: number = 100, filters: { location?: string; interestedField?: string } = {}) {
    try {
      const queries = [
        Query.notEqual('userId', currentUserId),
        Query.limit(limit)
      ];
      // Remove location filter from query, will filter in JS for case-insensitivity
      if (filters.interestedField) {
        queries.push(Query.equal('interestedField', filters.interestedField));
      }
      const profiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        queries
      );
      let resultProfiles = profiles.documents as unknown as Profile[];
      // Case-insensitive, partial match location filter in JS
      if (filters.location) {
        const filterLocation = filters.location.trim().toLowerCase();
        resultProfiles = resultProfiles.filter(profile =>
          profile.location && profile.location.trim().toLowerCase().includes(filterLocation)
        );
      }
      return resultProfiles;
    } catch (error) {
      console.error('Error getting profiles for matching:', error);
      return [];
    }
  }

  async searchProfiles(searchTerm: string, filters: any = {}) {
    try {
      const queries = [Query.search('bio', searchTerm)];
      
      if (filters.interestedField) {
        queries.push(Query.equal('interestedField', filters.interestedField));
      }
      
      if (filters.experience) {
        queries.push(Query.equal('experience', filters.experience));
      }

      const profiles = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        queries
      );
      return profiles.documents as unknown as Profile[];
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }

  async updateLastActive(userId: string) {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) throw new Error('Profile not found');
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        profile.$id,
        { lastActive: new Date().toISOString() }
      );
      return true;
    } catch (error) {
      console.error('Error updating lastActive:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const users = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('$id', userId)]
      );
      return users.documents[0] || null;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }
}

export const profileService = new ProfileService();