import { Client, Account, Databases, Storage, Functions, Query } from 'appwrite';

// Check if environment variables are properly set
const checkEnvVars = () => {
  const requiredVars = [
    'VITE_APPWRITE_ENDPOINT',
    'VITE_APPWRITE_PROJECT_ID',
    'VITE_APPWRITE_DATABASE_ID'
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};

// Initialize client with error handling
const initializeClient = () => {
  try {
    checkEnvVars();
    
    const client = new Client();
    
    client
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
    
    return client;
  } catch (error) {
    console.error('Failed to initialize Appwrite client:', error);
    throw error;
  }
};

export const client = initializeClient();
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { Query };

// Database and Collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
export const COLLECTIONS = {
  USERS: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
  PROFILES: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID,
  MATCHES: import.meta.env.VITE_APPWRITE_MATCHES_COLLECTION_ID,
  MESSAGES: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
  FORUM_POSTS: import.meta.env.VITE_APPWRITE_FORUM_POSTS_COLLECTION_ID,
  FORUM_COMMENTS: import.meta.env.VITE_APPWRITE_FORUM_COMMENTS_COLLECTION_ID,
};

// Validate configuration
export const validateAppwriteConfig = () => {
  try {
    checkEnvVars();
    console.log('Appwrite configuration validated successfully');
    return true;
  } catch (error) {
    console.error('Appwrite configuration validation failed:', error);
    return false;
  }
};