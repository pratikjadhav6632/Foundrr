import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { validateAppwriteConfig } from '../lib/appwrite';
import { User, Profile } from '../types';
import { toast } from 'react-hot-toast';
// import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, mobile: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  loading: boolean;
  connectionStatus: 'checking' | 'connected' | 'error';
  sendPasswordReset: (params: { email?: string }) => Promise<any>;
  setProfile?: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Validate Appwrite configuration
      if (!validateAppwriteConfig()) {
        setConnectionStatus('error');
        toast.error('App configuration error. Please check environment variables.');
        setLoading(false);
        return;
      }

      // Test connection
      const connectionTest = await authService.testConnection();
      if (!connectionTest.success) {
        console.warn('Connection test failed:', connectionTest.message);
        setConnectionStatus('error');
        // Don't show error toast here as user might not be logged in
      } else {
        setConnectionStatus('connected');
      }

      // Check for existing session
      await checkAuth();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser as User);
        try {
          const userProfile = await profileService.getProfile(currentUser.$id);
          setProfile(userProfile);
        } catch (profileError) {
          console.warn('Failed to load user profile:', profileError);
          // Profile might not exist yet, which is okay
        }
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.log('No active session found');
      setUser(null);
      setProfile(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.login(email, password);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser as User);
        try {
          const userProfile = await profileService.getProfile(currentUser.$id);
          setProfile(userProfile);
        } catch (profileError) {
          console.warn('Profile not found, user may need to complete setup');
        }
        setConnectionStatus('connected');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setConnectionStatus('error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, mobile: string) => {
    try {
      setLoading(true);
      console.log('Starting signup process...');
      await authService.createAccount(email, password, name);
      // Do not log in or set user here; wait for verification
      setConnectionStatus('connected');
      console.log('Signup completed, verification email sent');
      // Profile creation moved to profile setup form
    } catch (error: any) {
      console.error('Signup failed:', error);
      setConnectionStatus('error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if logout request fails
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) return;

    try {
      if (profile) {
        // Update existing profile
        const updatedProfile = await profileService.updateProfile(profile.$id, { ...profileData, name: user.name });
        setProfile(updatedProfile);
      } else {
        // Create new profile
        const newProfile = await profileService.createProfile({
          ...profileData,
          name: user.name,
          userId: user.$id
        });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw new Error('Failed to update profile');
    }
  };

  const sendPasswordReset = async (params: { email?: string }) => {
    return authService.sendPasswordReset(params);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      login, 
      signup, 
      logout, 
      updateProfile, 
      loading,
      connectionStatus,
      sendPasswordReset,
      setProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};