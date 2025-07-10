import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageCircle, Heart, Share, TrendingUp, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { forumService } from '../services/forumService';
import { profileService } from '../services/profileService';
import { ForumPost, Profile, ForumComment } from '../types';
import { uploadPostImageToCloudinary } from '../services/cloudinaryService';
import { useNavigate } from 'react-router-dom';
import { matchService } from '../services/matchService';
import { messageService } from '../services/messageService';
import { div } from 'framer-motion/client';

interface PostWithProfile extends ForumPost {
  authorProfile?: Profile;
}

interface CommentWithProfile extends ForumComment {
  authorProfile?: Profile | null;
}

export const Forum: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPostData, setNewPostData] = useState({
    content: '',
    category: '',
    image: '',
  });
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [commentModalPost, setCommentModalPost] = useState<PostWithProfile | null>(null);
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [shareModalPost, setShareModalPost] = useState<PostWithProfile | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const categories = ['Product', 'Funding', 'Personal', 'Technical', 'Marketing'];

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await forumService.getPosts(selectedCategory);
      
      // Load author profiles for each post
      const postsWithProfiles = await Promise.all(
        postsData.map(async (post) => {
          const authorProfile = await profileService.getProfile(post.authorId) || undefined;
          return { ...post, authorProfile };
        })
      );
      
      setPosts(postsWithProfiles);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostImageFile(file);
    try {
      const imageUrl = await uploadPostImageToCloudinary(file);
      console.log('Cloudinary image URL:', imageUrl);
      setNewPostData(prev => ({ ...prev, image: imageUrl }));
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPostData.content || !newPostData.category) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await forumService.createPost(
        user.$id,
        '', // No title
        newPostData.content,
        newPostData.category,
        newPostData.image
      );
      setShowNewPost(false);
      setNewPostData({ content: '', category: '', image: '' });
      setPostImageFile(null);
      toast.success('Post created successfully!');
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    // Optimistic UI update
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.$id !== postId) return post;
      const hasLiked = post.likes?.includes(user.$id);
      return {
        ...post,
        likes: hasLiked
          ? post.likes?.filter(id => id !== user.$id)
          : [...(post.likes || []), user.$id],
      };
    }));
    try {
      await forumService.likePost(postId, user.$id);
      toast.success('Post liked!');
    } catch (error) {
      // Revert like on error
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.$id !== postId) return post;
        const hasLiked = post.likes?.includes(user.$id);
        return {
          ...post,
          likes: hasLiked
            ? post.likes?.filter(id => id !== user.$id)
            : [...(post.likes || []), user.$id],
        };
      }));
      toast.error('Failed to like post');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const openCommentModal = async (post: PostWithProfile) => {
    setCommentModalPost(post);
    setCommentLoading(true);
    try {
      const fetchedComments = await forumService.getComments(post.$id);
      // Fetch all unique author profiles for the comments
      const uniqueAuthorIds = Array.from(new Set(fetchedComments.map(c => c.authorId)));
      const authorProfiles = await Promise.all(
        uniqueAuthorIds.map(id => profileService.getProfile(id))
      );
      const authorMap: { [userId: string]: Profile | null } = {};
      uniqueAuthorIds.forEach((id, idx) => {
        authorMap[id] = authorProfiles[idx];
      });
      const commentsWithProfiles: CommentWithProfile[] = fetchedComments.map(c => ({
        ...c,
        authorProfile: authorMap[c.authorId] || null
      }));
      setComments(commentsWithProfiles);
    } catch {
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !commentModalPost || !newComment.trim()) return;
    setCommentLoading(true);
    // Optimistic UI update
    const tempComment = {
      $id: 'temp-' + Date.now(),
      postId: commentModalPost.$id,
      authorId: user.$id,
      content: newComment.trim(),
      likes: [],
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      authorProfile: commentModalPost.authorProfile || null, // Use the post's authorProfile as a fallback
    };
    setComments(prev => [...prev, tempComment]);
    setNewComment('');
    try {
      const realComment = await forumService.createComment(commentModalPost.$id, user.$id, tempComment.content);
      // Fetch author profile for the real comment
      const authorProfile = tempComment.authorProfile;
      setComments(prev => prev.map(c => c.$id === tempComment.$id ? { ...realComment, authorProfile } : c));
      toast.success('Comment added!');
    } catch {
      setComments(prev => prev.filter(c => c.$id !== tempComment.$id));
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = (post: PostWithProfile) => {
    setShareModalPost(post);
    setCopySuccess(false);
    setSendSuccess(null);
    if (user) {
      setFriendsLoading(true);
      matchService.getUserMatches(user.$id).then(async (matches) => {
        // Get the other user's profile for each match
        const friendsList = await Promise.all(matches.map(async (match: any) => {
          const otherUserId = match.user1Id === user.$id ? match.user2Id : match.user1Id;
          const profile = await profileService.getProfile(otherUserId);
          return { matchId: match.$id, profile, otherUserId };
        }));
        setFriends(friendsList.filter(f => f.profile));
        setFriendsLoading(false);
      });
    }
  };

  const handleCopyLink = async () => {
    if (!shareModalPost) return;
    const url = `${window.location.origin}/post/${shareModalPost.$id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      toast.success('Post link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleSendToFriend = async (friend: any) => {
    if (!shareModalPost || !user) return;
    const url = `${window.location.origin}/post/${shareModalPost.$id}`;
    try {
      await messageService.sendMessage(friend.matchId, user.$id, friend.otherUserId, url);
      setSendSuccess(friend.profile.username || friend.profile.name || 'Sent!');
      toast.success('Post shared in chat!');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await forumService.deletePost(postId);
      setPosts(prev => prev.filter(p => p.$id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (commentId.startsWith('temp-')) return; // Don't try to delete temp comments
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await forumService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.$id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-2 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Community </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Share your unfiltered thoughts and experiences</p>
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            <span>New Post</span>
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="space-y-4 sm:space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500">No posts found. Be the first to share your thoughts!</p>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <a href={`/profile/${post.authorProfile?.userId}`} className="hover:underline">
                    <img 
                      src={post.authorProfile?.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                      alt="Author"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      loading="lazy"
                    />
                  </a>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-2">
                      <a href={`/profile/${post.authorProfile?.userId}`} className="font-semibold text-gray-800 hover:underline text-sm sm:text-base">
                        {post.authorProfile?.username || post.authorProfile?.name || 'Anonymous'}
                      </a>
                      <span className="text-gray-500 text-xs sm:text-sm">•</span>
                      <span className="text-gray-500 text-xs sm:text-sm">{formatTime(post.$createdAt)}</span>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs ml-0 sm:ml-2">
                        {post.category}
                      </span>
                    </div>
                  
                    <p className="text-gray-700 mb-2 sm:mb-4 line-clamp-3 text-sm sm:text-base">{post.content}</p>
                    {post.image && (
                      

                      <img
                        src={post.image}
                        alt="Post"
                        className="rounded-lg h-full sm:max-h-60 mb-2 w-full object-contain "
                       
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                   
                    )}
                    <div className="flex items-center space-x-6 text-gray-500 text-xs sm:text-sm">
                      <button
                        onClick={() => handleLike(post.$id)}
                        className={`flex items-center space-x-1 transition-colors ${
                          post.likes?.includes(user?.$id || '') 
                            ? 'text-red-500' 
                            : 'hover:text-red-500'
                        }`}
                      >
                        <Heart className="w-5 h-5" />
                        <span>{post.likes?.length || 0}</span>
                      </button>
                      <button
                        className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                        onClick={() => openCommentModal(post)}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.commentsCount || 0}</span>
                      </button>
                      <button
                        className="flex items-center space-x-1 hover:text-green-500 transition-colors"
                        onClick={() => handleShare(post)}
                      >
                        <Share className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                      {user?.$id === post.authorId && (
                      <button
                        className="ml-2 text-red-500 hover:text-red-700 "
                        title="Delete post"
                        onClick={() => handleDeletePost(post.$id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    </div>
                    
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        

        {/* New Post Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-2">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-lg relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPost(false)}
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Create New Post</h2>
              <select
                value={newPostData.category}
                onChange={e => setNewPostData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full mb-2 sm:mb-4 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
              >
                <option value="" disabled>Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <textarea
                placeholder="What's on your mind? (max 210 words)"
                value={newPostData.content}
                onChange={e => {
                  const words = e.target.value.split(/\s+/).filter(Boolean);
                  if (words.length <= 210) {
                    setNewPostData(prev => ({ ...prev, content: e.target.value }));
                  } else {
                    setNewPostData(prev => ({ ...prev, content: words.slice(0, 210).join(' ') }));
                  }
                }}
                className="w-full mb-2 sm:mb-4 px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                rows={3}
              />
              <div className="text-xs text-gray-500 mb-2">{newPostData.content.trim() ? `${newPostData.content.trim().split(/\s+/).filter(Boolean).length} / 210 words` : '0 / 210 words'}</div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2 sm:mb-4">
                <input
                  type="file"
                  accept="image/*"
                  className="flex-1 text-sm"
                  onChange={handlePostImageChange}
                />
              </div>
              {newPostData.image && (
                <img src={newPostData.image} alt="Preview" className="rounded-lg max-h-32 sm:max-h-60 mb-2 w-full object-cover" loading="lazy" />
              )}
              <button
                onClick={handleCreatePost}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {commentModalPost && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-2">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-lg relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setCommentModalPost(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <img src={commentModalPost.authorProfile?.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt="Author" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base">{commentModalPost.authorProfile?.username || commentModalPost.authorProfile?.name}</span>
                <span className="text-gray-500 text-xs sm:text-sm">{formatTime(commentModalPost.$createdAt)}</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs ml-auto">{commentModalPost.category}</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold mb-1">{commentModalPost.title}</h4>
              <p className="text-gray-700 mb-2 text-sm sm:text-base">{commentModalPost.content}</p>
              {commentModalPost.image && <img src={commentModalPost.image} alt="Post" className="rounded-lg max-h-32 sm:max-h-60 mb-2 w-full object-cover" loading="lazy" />}
              <h5 className="font-semibold mb-2 text-sm sm:text-base">Comments</h5>
              {commentLoading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No comments yet.</div>
              ) : (
                <div className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto pr-1">
                  {comments.map((c) => (
                    <div key={c.$id} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2">
                      <img src={c.authorProfile?.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt="Author" className="w-7 h-7 rounded-full object-cover" loading="lazy" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-xs sm:text-sm text-gray-800">{c.authorProfile?.username || c.authorProfile?.name}</span>
                          <span className="text-gray-400 text-xs">{formatTime(c.$createdAt)}</span>
                        </div>
                        <div className="text-gray-700 text-xs sm:text-sm">{c.content}</div>
                      </div>
                      {user?.$id === c.authorId && (
                        <button
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="Delete comment"
                          onClick={() => handleDeleteComment(c.$id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                  placeholder="Add a comment..."
                  disabled={commentLoading}
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !newComment.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-xs sm:text-base"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {shareModalPost && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setShareModalPost(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Share Post</h2>
              <div className="mb-4">
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all mb-2"
                >
                  {copySuccess ? 'Link Copied!' : 'Copy Link'}
                </button>
                <div className="mt-4">
                  <div className="font-semibold mb-2">Share with a friend in chat:</div>
                  {friendsLoading ? (
                    <div className="text-gray-500">Loading friends...</div>
                  ) : friends.length === 0 ? (
                    <div className="text-gray-400">No friends found.</div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {friends.map(friend => (
                        <button
                          key={friend.matchId}
                          onClick={() => handleSendToFriend(friend)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium transition-all"
                          disabled={!!sendSuccess}
                        >
                          <img src={friend.profile.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt="Friend" className="w-7 h-7 rounded-full object-cover" loading="lazy" />
                          <span>{friend.profile.username || friend.profile.name || 'Unknown'}</span>
                          {sendSuccess === (friend.profile.username || friend.profile.name) && <span className="ml-auto text-green-600">Sent!</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-gray-500 text-sm break-all">
                {`${window.location.origin}/post/${shareModalPost.$id}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};