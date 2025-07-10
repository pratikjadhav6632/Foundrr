import { account } from '../lib/appwrite';
import { ID } from 'appwrite';

export class AuthService {
  async createAccount(email: string, password: string, name: string) {
    try {
      console.log('Creating account for:', email);
      const user = await account.create(ID.unique(), email, password, name);
      console.log('Account created successfully:', user);
      // Log the user in to get a session
      await account.createEmailPasswordSession(email, password);
      // Send verification email
      await account.createVerification(window.location.origin + '/verify');
      // Log the user out to force verification before proceeding
      await account.deleteSession('current');
      return user;
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      // Handle specific Appwrite errors
      if (error.code === 409) {
        throw new Error('An account with this email already exists');
      } else if (error.code === 400) {
        throw new Error('Invalid email or password format');
      } else if (error.message?.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else if (error.message?.includes('CORS')) {
        throw new Error('Server configuration error. Please contact support.');
      }
      
      throw new Error(error.message || 'Failed to create account');
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('Attempting login for:', email);
      
      // First, try to delete any existing session
      try {
        await account.deleteSession('current');
      } catch (e) {
        // Ignore if no session exists
      }
      
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Login successful:', session);
      return session;
    } catch (error: any) {
      console.error('Error logging in:', error);
      
      // Handle specific Appwrite errors
      if (error.code === 401) {
        throw new Error('Invalid email or password');
      } else if (error.message?.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else if (error.message?.includes('CORS')) {
        throw new Error('Server configuration error. Please contact support.');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout() {
    try {
      await account.deleteSession('current');
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Error logging out:', error);
      // Don't throw error for logout failures
    }
  }

async getCurrentUser() {
  try {
    const session = await account.getSession('current');
    if (!session) throw new Error("No session found");

    const user = await account.get();
    console.log('Current user retrieved:', user);
    return user;
  } catch (error: any) {
    console.log('No current user session:', error.message);
    return null;
  }
}


  async updatePassword(password: string, oldPassword: string) {
    try {
      return await account.updatePassword(password, oldPassword);
    } catch (error: any) {
      console.error('Error updating password:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }

  /**
   * Send password reset instructions (email only)
   */
  async sendPasswordReset({ email }: { email?: string }) {
    try {
      if (email) {
        await account.createRecovery(email, window.location.origin + '/reset-password');
      } else {
        throw new Error('Email required');
      }
      return true;
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      throw new Error(error.message || 'Failed to send password reset');
    }
  }

  /**
   * Send OTP to phone using Appwrite's createPhoneToken
   */
  async sendPhoneOtp(phone: string) {
    try {
      const { ID } = await import('appwrite');
      const userId = ID.unique();
      const token = await account.createPhoneToken(userId, phone);
      // token contains: userId, secret, expire
      return { userId, secret: token.secret, expire: token.expire };
    } catch (error: any) {
      console.error('Error sending phone OTP:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Verify OTP and create session using Appwrite's createSession
   */
  async verifyPhoneOtp(userId: string, otp: string) {
    try {
      const session = await account.createSession(userId, otp);
      return session;
    } catch (error: any) {
      console.error('Error verifying phone OTP:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  /**
   * Send OTP to email using Appwrite's createEmailToken
   */
  async sendEmailOtp(userId: string, email: string) {
    try {
      const token = await account.createEmailToken(userId, email);
      return { userId, secret: token.secret, expire: token.expire };
    } catch (error: any) {
      console.error('Error sending email OTP:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Verify email OTP and create session using Appwrite's createSession
   */
  async verifyEmailOtp(userId: string, otp: string) {
    try {
      const session = await account.createSession(userId, otp);
      return session;
    } catch (error: any) {
      console.error('Error verifying email OTP:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  // Test connection method
  async testConnection() {
    try {
      // Attempt a simple request to verify the API is reachable. We purposefully
      // call an endpoint that *can* fail with 401 when the user is not logged in
      // (guest). A 401 still means the backend is reachable, so we treat that as
      // a successful connectivity check.
      await account.get();
      return { success: true, message: 'Connection successful' };
    } catch (error: any) {
      // If we receive an unauthorised error, the server is still reachable. Only
      // raise a failure for network-level issues (fetch, timeout, etc.)
      if (error?.code === 401) {
        return { success: true, message: 'Server reachable – user unauthorised' };
      }
      return {
        success: false,
        message: error?.message || 'Connection failed',
        error,
      };
    }
  }

}

export const authService = new AuthService();