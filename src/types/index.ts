export interface User {
  $id: string;
  email: string;
  name: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Profile {
  $id: string;
  userId: string;
  username: string;
  name?: string;
  age: number;
  experience: string;
  interestedField: string;
  bio: string;
  skills: string[];
  lookingFor: string;
  isFounder: boolean;
  companyName?: string;
  profileImage?: string | File;
  location?: string;
  $createdAt: string;
  $updatedAt: string;
  lastActive?: string;
  qualification?: string;
  linkedin?: string;
  github?: string;
  mobile?: string;
}

export interface Match {
  $id: string;
  user1Id: string;
  user2Id: string;
  user1Liked: boolean;
  user2Liked: boolean;
  isMatched: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface Message {
  $id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface ForumPost {
  $id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  likes: string[];
  commentsCount: number;
  $createdAt: string;
  $updatedAt: string;
  image?: string;
}

export interface ForumComment {
  $id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: string[];
  $createdAt: string;
  $updatedAt: string;
}