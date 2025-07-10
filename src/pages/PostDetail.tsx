import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { forumService } from '../services/forumService';
import { profileService } from '../services/profileService';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { getAppwriteFilePreviewUrl } from '../lib/appwrite';
import { useAuth } from '../contexts/AuthContext';

const getProfileImageUrl = (img: string | undefined) => {
  if (!img) return '/src/asset/Foundrr-icon.png';
  if (img.startsWith('http')) return img;
  return getAppwriteFilePreviewUrl(img);
};

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError('');
      try {
        const postData = await forumService.getPostById(id!);
        if (!postData) {
          setError('Post not found or failed to load.');
          setPost(null);
          setAuthor(null);
          return;
        }
        setPost(postData);
        if (postData.authorId) {
          const authorProfile = await profileService.getProfile(postData.authorId);
          setAuthor(authorProfile);
        }
      } catch (err) {
        setError('Post not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      setCommentsError('');
      try {
        if (id) {
          const commentsData = await forumService.getComments(id);
          setComments(commentsData);
        }
      } catch (err) {
        setCommentsError('Failed to load comments.');
      } finally {
        setCommentsLoading(false);
      }
    };
    if (id) fetchComments();
  }, [id]);

  // Add comment handler
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newComment.trim()) return;
    setAddingComment(true);
    try {
      const comment = await forumService.createComment(id, user.$id, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch {
      alert('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    setDeletingCommentId(commentId);
    try {
      await forumService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.$id !== commentId));
    } catch {
      alert('Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96">Loading...</div>;
  if (error) return <div className="flex flex-col items-center h-96 justify-center text-gray-500">{error}<button className="mt-4 px-4 py-2 bg-purple-100 rounded" onClick={() => navigate(-1)}>Go Back</button></div>;
  if (!post) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mt-8">
      <div className="flex items-center gap-4 mb-4">
        <img src={getProfileImageUrl(author?.profileImage)} alt="Author" className="w-12 h-12 rounded-full object-cover" />
        <div>
          <div className="font-semibold text-gray-800">{author?.username || author?.name || 'Anonymous'}</div>
          <div className="text-xs text-gray-500">{new Date(post.$createdAt).toLocaleString()}</div>
        </div>
      </div>
      <div className="mb-4">
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">{post.category}</span>
      </div>
      <h2 className="text-xl font-bold mb-2">{post.title || 'Untitled Post'}</h2>
      <p className="text-gray-700 mb-4 whitespace-pre-line">{post.content}</p>
      {post.image && (
        <img src={post.image} alt="Post" className="rounded-lg max-h-96 mb-4 w-full object-contain" loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} />
      )}
      <div className="flex items-center gap-6 text-gray-500 text-sm mt-2">
        <span className="flex items-center gap-1"><Heart className="w-5 h-5" />{post.likes?.length || 0}</span>
        <span className="flex items-center gap-1"><MessageCircle className="w-5 h-5" />{post.commentsCount || 0}</span>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Comments</h3>
        {commentsLoading ? (
          <div className="text-gray-400">Loading comments...</div>
        ) : commentsError ? (
          <div className="text-red-400">{commentsError}</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-400">No comments yet.</div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.$id} className="bg-gray-50 rounded-lg p-3 flex items-start gap-2">
                <img src={getProfileImageUrl(comment.authorProfile?.profileImage)} alt="Author" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{comment.authorProfile?.username || comment.authorProfile?.name || 'Anonymous'}</span>
                    <span className="text-gray-500 text-xs">{new Date(comment.$createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-gray-700 text-sm whitespace-pre-line">{comment.content}</div>
                </div>
                {user?.$id === comment.authorId && (
                  <button
                    className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full transition-colors"
                    title="Delete comment"
                    onClick={() => handleDeleteComment(comment.$id)}
                    disabled={deletingCommentId === comment.$id}
                  >
                    {deletingCommentId === comment.$id ? (
                      <span className="w-4 h-4 animate-spin border-2 border-red-500 border-t-transparent rounded-full inline-block"></span>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleAddComment} className="mt-6 flex flex-col gap-2">
            <textarea
              className="border rounded-lg p-2 w-full min-h-[60px] resize-y"
              placeholder="Add a comment..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              disabled={addingComment}
              maxLength={500}
              required
            />
            <button
              type="submit"
              className="self-end bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-60"
              disabled={addingComment || !newComment.trim()}
            >
              {addingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="mt-4 text-gray-500">Log in to add a comment.</div>
        )}
      </div>
    </div>
  );
};

export default PostDetail; 