import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { ID } from 'appwrite';
import { ForumPost, ForumComment } from '../types';

export class ForumService {
  async createPost(authorId: string, title: string, content: string, category: string, image?: string) {
    try {
      const post = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        ID.unique(),
        {
          authorId,
          title,
          content,
          category,
          image: image || '',
          likes: [],
          commentsCount: 0
        }
      );
      return post as unknown as ForumPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPosts(category?: string, limit: number = 20) {
    try {
      const queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ];

      if (category && category !== 'All') {
        queries.push(Query.equal('category', category));
      }

      const posts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        queries
      );
      return posts.documents as unknown as ForumPost[];
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  async likePost(postId: string, userId: string) {
    try {
      const post = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId
      ) as unknown as ForumPost;

      const likes = post.likes || [];
      const hasLiked = likes.includes(userId);

      const updatedLikes = hasLiked
        ? likes.filter(id => id !== userId)
        : [...likes, userId];

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId,
        { likes: updatedLikes }
      );
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async createComment(postId: string, authorId: string, content: string) {
    try {
      const comment = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_COMMENTS,
        ID.unique(),
        {
          postId,
          authorId,
          content,
          likes: ''
        }
      );

      // Update post comments count
      const post = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId
      ) as unknown as ForumPost;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId,
        { commentsCount: (post.commentsCount || 0) + 1 }
      );

      return comment as unknown as ForumComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async getComments(postId: string) {
    try {
      const comments = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_COMMENTS,
        [
          Query.equal('postId', postId),
          Query.orderAsc('$createdAt')
        ]
      );
      return comments.documents as unknown as ForumComment[];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  async getPostsByUser(authorId: string, limit: number = 20) {
    try {
      const queries = [
        Query.equal('authorId', authorId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ];
      const posts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        queries
      );
      return posts.documents as unknown as ForumPost[];
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  }

  async getPostById(postId: string) {
    try {
      const post = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId
      );
      return post as unknown as ForumPost;
    } catch (error) {
      console.error('Error getting post by id:', error);
      return null;
    }
  }

  async deletePost(postId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_POSTS,
        postId
      );
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.FORUM_COMMENTS,
        commentId
      );
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export const forumService = new ForumService();