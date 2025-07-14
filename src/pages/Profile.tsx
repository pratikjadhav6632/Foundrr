import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Edit3, MapPin, Briefcase, Star, Mail, User, Save, X, Image as ImageIcon,Trash2,  BookOpen, Search, Building2, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { profileService } from '../services/profileService';
import { matchService } from '../services/matchService';
import { forumService } from '../services/forumService';
import './Profile.css'
import { account, getAppwriteFilePreviewUrl } from '../lib/appwrite';

const getProfileImageUrl = (url?: string) => {
  if (!url) return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  if (typeof url !== 'string') return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Otherwise, treat as Appwrite file ID
  return getAppwriteFilePreviewUrl(url);
};

export const Profile: React.FC = () => {
  const { user, profile, updateProfile, logout } = useAuth();
  const { userId } = useParams();
  const [publicProfile, setPublicProfile] = React.useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    lookingFor: profile?.lookingFor || '',
    interestedField: profile?.interestedField || '',
    location: profile?.location || '',
    profileImage: profile?.profileImage || '',
    qualification: profile?.qualification || '',
    age: profile?.age || '',
    experience: profile?.experience || '',
    isFounder: profile?.isFounder || false,
    companyName: profile?.companyName || '',
  });
  const [newSkill, setNewSkill] = useState('');
  const navigate = useNavigate();
  const [isFriend, setIsFriend] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false); // NEW
  const [friendLoading, setFriendLoading] = React.useState(false);
  const [matchId, setMatchId] = React.useState<string | null>(null);
  const [publicEmail, setPublicEmail] = React.useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [hasMatch, setHasMatch] = React.useState<boolean>(false); // NEW

  useEffect(() => {
    if (userId) {
      profileService.getProfile(userId).then(profile => {
        setPublicProfile(profile);
        console.log('Loaded publicProfile:', profile); // Debug log
      });
      if (user && userId === user.$id) {
        account.get().then(appwriteUser => setPublicEmail(appwriteUser.email)).catch(() => setPublicEmail(null));
      } else {
        profileService.getUserById(userId).then(userDoc => setPublicEmail(userDoc?.email || null));
      }
      if (user) {
        matchService.getExistingMatch(user.$id, userId).then(match => {
          setIsFriend(!!(match && match.isMatched));
          setMatchId(match ? match.$id : null);
          setHasMatch(!!match); // NEW: track if any match exists
          setIsPending(
            !!(
              match &&
              !match.isMatched &&
              ((match.user1Id === user.$id && match.user1Liked) || (match.user2Id === user.$id && match.user2Liked))
            )
          );
        });
      }
    }
  }, [userId, user]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const posts = await forumService.getPostsByUser(userId ?? user?.$id ?? '');
        setUserPosts(posts);
      } catch (e) {
        setUserPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };
    if (userId || user?.$id) {
      fetchUserPosts();
    }
  }, [userId, user]);

  const handleSave = async () => {
    try {
      await updateProfile(editData); // username is included in editData
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    try {
      await logout();
      navigate('/');
    } catch (e) {
      toast.error('Logout failed');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadToCloudinary(file);
      setEditData(prev => ({ ...prev, profileImage: imageUrl }));
      toast.success('Profile image uploaded!');
    } catch (err) {
      toast.error('Failed to upload image');
    }
  };

  const handleAddFriend = async () => {
    if (!user || !userId) return;
    setFriendLoading(true);
    try {
      await matchService.handleSwipe(user.$id, userId, true);
      // Re-check match status
      const match = await matchService.getExistingMatch(user.$id, userId);
      setIsFriend(!!(match && match.isMatched));
      setMatchId(match ? match.$id : null);
      setHasMatch(!!match); // NEW
      setIsPending(
        !!(
          match &&
          !match.isMatched &&
          ((match.user1Id === user.$id && match.user1Liked) || (match.user2Id === user.$id && match.user2Liked))
        )
      );
      toast.success('Friend request sent!');
    } catch (error) {
      toast.error('Failed to send friend request.');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!matchId) return;
    setFriendLoading(true);
    try {
      await matchService.deleteMatch(matchId);
      setIsFriend(false);
      setMatchId(null);
      setHasMatch(false); // NEW
      setIsPending(false); // NEW
    } finally {
      setFriendLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await forumService.deletePost(postId);
      setUserPosts(posts => posts.filter(p => p.$id !== postId));
      toast.success('Post deleted');
    } catch (e) {
      toast.error('Failed to delete post');
    }
  };

  if (userId && publicProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-white to-blue-100 py-4 px-1 sm:py-8 sm:px-0">
        <div className="max-w-md mx-auto profile-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-8 flex flex-col items-center profile-section">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3 sm:mb-4 profile-header">
              <img src={getProfileImageUrl(typeof publicProfile.profileImage === 'string' ? publicProfile.profileImage : undefined)} alt={publicProfile.username || publicProfile.name} className="w-full h-full rounded-full object-cover border-4 border-purple-200 shadow-lg profile-image" loading="lazy" />
            </div>
            <h2 className="text-2xl font-bold mb-1 text-center">{publicProfile.username || publicProfile.name}</h2>
            <div className="flex justify-center mb-4">
              
            </div>
           
            {/* Info chips */}
            <div className="flex flex-wrap gap-2 justify-center mb-4 profile-info-chips">
              {publicProfile.location && <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center gap-1"><MapPin className="w-4 h-4" />{publicProfile.location}</span>}
              {publicProfile.qualification && <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center gap-1"><BookOpen className="w-4 h-4" />{publicProfile.qualification}</span>}
              {publicProfile.interestedField && <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs flex items-center gap-1"><Star className="w-4 h-4" />{publicProfile.interestedField}</span>}
              {publicProfile.experience && <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center gap-1"><Briefcase className="w-4 h-4" />{publicProfile.experience}</span>}
              {publicProfile.lookingFor && <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs flex items-center gap-1"><Search className="w-4 h-4" />{publicProfile.lookingFor}</span>}
              {publicProfile.companyName && <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center gap-1"><Building2 className="w-4 h-4" />{publicProfile.companyName}</span>}
            </div>
            {publicProfile.bio && <div className="w-full text-center text-gray-700 text-sm mb-4 px-2">{publicProfile.bio}</div>}
            {/* Friend/Unfriend button */}
            {user && user.$id !== userId && (
              <div className="w-full flex flex-col gap-2 mb-4 profile-action-buttons">
                {hasMatch ? (
                  <button onClick={handleUnfriend} disabled={friendLoading} className="w-full py-2 rounded-full bg-red-100 text-red-700 font-semibold shadow hover:bg-red-200 transition-all">Unfriend</button>
                ) : (
                  <button onClick={handleAddFriend} disabled={friendLoading} className="w-full py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow hover:from-purple-700 hover:to-blue-700 transition-all">Add Friend</button>
                )}
              </div>
            )}
            {/* User Posts Section */}
            <div className="w-full mt-4 profile-section">
              <div className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1 profile-section-title">User Posts</div>
              {postsLoading ? (
                <div className="text-center text-gray-400 py-6">Loading posts...</div>
              ) : userPosts.length === 0 ? (
                <div className="text-center text-gray-400 py-6 flex flex-col items-center gap-2">
                  <span className="text-4xl">📝</span>
                  <span>You haven't posted anything yet.</span>
                </div>
              ) : (
                <div className="space-y-3 profile-user-posts">
                  {userPosts.map(post => (
                    <div key={post.$id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 shadow flex flex-col gap-1">
                      {/* User info above post, similar to forum style */}
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={getProfileImageUrl(publicProfile?.profileImage)}
                          alt={publicProfile?.username || publicProfile?.name}
                          className="w-8 h-8 rounded-full object-cover"
                          loading="lazy"
                        />
                        <span className="font-semibold text-gray-800">{publicProfile?.username || publicProfile?.name}</span>
                      </div>
                      <div className="font-semibold text-purple-800 text-base line-clamp-1">{post.content?.slice(0, 80) || 'Untitled Post'}</div>
                      <div className="w-full h-40 ">{post.image && (
                        <img
                          src={post.image}
                          alt="Post"
                          className="rounded-lg h-full sm:max-h-60 mb-2 w-full object-contain "
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Heart className="w-4 h-4" /> {post.likes?.length || 0}
                        <MessageCircle className="w-4 h-4 ml-2" /> {post.commentsCount || 0}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600 profile-c">
            <div className="absolute inset-0 bg-black/20 prof-position1" style={{ pointerEvents: 'none' }} ></div>
            <div className="absolute bottom-6 left-6 right-6 flex items-end  justify-between prof-position ">
              <div className="flex items-end space-x-4 prof-container ">
                <div className='profile-head flex gap-5'>

                  <div className="w-24 h-24 rounded-full bg-white   relative prof-img">
                    <img
                      src={
                        getProfileImageUrl(typeof editData.profileImage === 'string' ? editData.profileImage : undefined)
                          ? getProfileImageUrl(typeof editData.profileImage === 'string' ? editData.profileImage : undefined)
                          : getProfileImageUrl(typeof profile?.profileImage === 'string' ? profile?.profileImage : undefined)
                      }
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover profile-img"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                        <ImageIcon className="w-5 h-5 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                  <div className="text-white profile-card">
                    <h1 className="text-2xl font-bold">{profile?.username || user.name || profile?.name || "notfound"}</h1>

                    <div className="flex items-center space-x-2 text-purple-100">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span> <br />

                    </div>
                  </div>
                </div>



                {/* Additional user info */}
                <div className="flex flex-wrap gap-5 mt-2 space-y-1 text-sm user-info">
                  {profile?.lookingFor && (
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 px-2 py-1 rounded text-white">Looking for: {profile.lookingFor}</span>
                    </div>
                  )}
                  {profile?.companyName && (
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 px-2 py-1 rounded text-white">Company: {profile.companyName}</span>
                    </div>
                  )}
                  {profile?.interestedField && (
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 px-2 py-1 rounded text-white">Interested in: {profile.interestedField}</span>
                    </div>
                  )}
                  {profile?.experience && (
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 px-2 py-1 rounded text-white">Experience : {profile.experience}</span>
                    </div>
                  )}
                  {profile?.qualification && (
                    <div className="flex items-center space-x-2">
                      <span className="bg-white/20 px-2 py-1 rounded text-white">Qualification : {profile.qualification}</span>
                    </div>
                  )}
                </div>


              </div>

            </div>

            <div className='ml-5 flex  justify-between prof-btn'>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors flex items-center space-x-2 mt-5 h-10  ml-8"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4 " />}
                <span className=''>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
          

            </div>

          </div>

          {/* Content - only show when editing */}
          {isEditing ? (
            <div className="p-6 space-y-6">
              {/* Username (editable) */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={e => setEditData(prev => ({ ...prev, username: e.target.value }))}
                    className="font-semibold w-32 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
              {/* Basic Info */}
              <div className="grid md:grid-cols-3 gap-4 ">
                {/* Age */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <input
                      type="number"
                      min="0"
                      value={editData.age}
                      onChange={e => setEditData(prev => ({ ...prev, age: e.target.value }))}
                      className="font-semibold w-20 px-2 py-1 border border-gray-300 rounded"
                      placeholder="Not set"
                    />
                  </div>
                </div>
                {/* Experience */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <input
                      type="text"
                      value={editData.experience}
                      onChange={e => setEditData(prev => ({ ...prev, experience: e.target.value }))}
                      className="font-semibold w-28 px-2 py-1 border border-gray-300 rounded"
                      placeholder="Not set"
                    />
                  </div>
                </div>
                {/* Status */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <select
                      value={editData.isFounder ? 'Founder' : 'Looking for Co-founder'}
                      onChange={e => setEditData(prev => ({ ...prev, isFounder: e.target.value === 'Founder' }))}
                      className="font-semibold px-2 py-1 border border-gray-300 rounded"
                    >
                      <option value="Founder">Founder</option>
                      <option value="Looking for Co-founder">Looking for Co-founder</option>
                    </select>
                  </div>
                </div>
                {/* Qualification */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Qualification</p>
                    <input
                      type="text"
                      value={editData.qualification}
                      onChange={e => setEditData(prev => ({ ...prev, qualification: e.target.value }))}
                      className="font-semibold w-32 px-2 py-1 border border-gray-300 rounded"
                      placeholder="Not set"
                    />
                  </div>
                </div>
                {/* Company Name */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <input
                      type="text"
                      value={editData.companyName || ''}
                      onChange={e => setEditData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="font-semibold w-32 px-2 py-1 border border-gray-300 rounded"
                      placeholder="Not set"
                    />
                  </div>
                </div>
                {/* location Name */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      className="font-semibold w-32 px-2 py-1 border border-gray-300 rounded"
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
              </div>

              
              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">About Me</h3>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills</h3>
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a skill"
                    />
                    <button
                      onClick={addSkill}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Looking For */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Looking For</h3>
                <select
                  value={editData.lookingFor}
                  onChange={(e) => setEditData(prev => ({ ...prev, lookingFor: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select what you're looking for</option>
                  <option value="Technical Co-founder">Technical Co-founder</option>
                  <option value="Business Co-founder">Business Co-founder</option>
                  <option value="Marketing Co-founder">Marketing Co-founder</option>
                  <option value="Product Co-founder">Product Co-founder</option>
                  <option value="Any Co-founder">Any Co-founder</option>
                  <option value="Any Co-founder">Team</option>
                  <option value="Any Co-founder">Figuring out *</option>
                </select>
              </div>

              {/* Interested Field */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Interested Field</h3>
                <select
                  value={editData.interestedField}
                  onChange={(e) => setEditData(prev => ({ ...prev, interestedField: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select field</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Education">Education</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="Other">Other</option>
                </select>
                
              </div>

              {/* Company Info */}
              {profile?.isFounder && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Company</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">
                        {profile.companyName || 'Company name not set'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Posts</h3>
              {postsLoading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>
              ) : userPosts.length === 0 ? (
                <div className="text-gray-500 text-center py-8">You haven't posted anything yet.</div>
              ) : (
                <div className="grid grid-cols-2 gap-6 posts">
                  {userPosts.map((post) => (
                    <motion.div
                      key={post.$id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 rounded-xl shadow p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img src={typeof profile?.profileImage === 'string' ? getProfileImageUrl(profile?.profileImage) : getProfileImageUrl(undefined)} alt="Author" className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                        <span className="font-semibold text-gray-800">{profile?.username || profile?.name}</span>
                        <span className="text-gray-500 text-xs">{new Date(post.$createdAt).toLocaleString()}</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs ml-auto">{post.category}</span>
                        <button
                          title="Delete post"
                          onClick={() => handleDeletePost(post.$id)}
                          className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full transition-colors"
                        >
                         <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <h4 className="text-lg font-bold mb-1">{post.title}</h4>
                      <p className="text-gray-700 mb-2">{post.content}</p>
                      {post.image && <img src={post.image} alt="Post" className="rounded-lg max-h-60 mb-2" loading="lazy" />}
                      <div className="flex items-center gap-6 text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{post.likes?.length || 0}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post.commentsCount || 0}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          )}

        </motion.div>
        {/* Only show menu section if not viewing public profile */}
        {(!userId || userId === user?.$id) && (
          <div className="p-6 flex flex-col items-center justify-center min-h-[100px]">
            <div className="w-full max-w-xs space-y-4">
              <button
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700"
                type="button"
                onClick={() => navigate('/privacy-policy')}
              >
                Company Policy
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700"
                type="button"
                onClick={() => navigate('/help-support')}
              >
                Help & Support
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-700"
                type="button"
                onClick={() => navigate('/feedback')}
              >
                Feedback
              </button>
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-100 hover:bg-red-200 transition-colors font-medium text-red-700"
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
            <ul className="space-y-2 text-sm mt-5 flex flex-row gap-4">
              {/* Social icons stylish */}
              <li className='flex '>
                <a href="#" aria-label="LinkedIn" className="bg-white/80 hover:bg-blue-100 transition-colors rounded-full p-2 shadow flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M16 8a6 6 0 0 1 6 6v5h-4v-5a2 2 0 0 0-4 0v5h-4v-9h4v1.5A4 4 0 0 1 16 8z" stroke="#0A66C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="2" y="9" width="4" height="9" rx="2" stroke="#0A66C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="4" cy="4" r="2" stroke="#0A66C2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Twitter" className="bg-white/80 hover:bg-blue-100 transition-colors rounded-full p-2 shadow flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4 1.64a9.09 9.09 0 0 1-2.88 1.1A4.48 4.48 0 0 0 16.5 1c-2.5 0-4.5 2.01-4.5 4.5 0 .35.04.69.1 1.02A12.94 12.94 0 0 1 3 2.1a4.48 4.48 0 0 0-.61 2.27c0 1.56.8 2.94 2.02 3.75A4.48 4.48 0 0 1 2 7.13v.06c0 2.18 1.55 4 3.8 4.42a4.48 4.48 0 0 1-2.02.08c.57 1.78 2.23 3.08 4.2 3.12A9 9 0 0 1 1 19.54a12.94 12.94 0 0 0 7 2.05c8.4 0 13-6.96 13-13v-.59A9.18 9.18 0 0 0 23 3z" stroke="#1DA1F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" aria-label="Instagram" className="bg-white/80 hover:bg-pink-100 transition-colors rounded-full p-2 shadow flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="1.5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#E1306C" strokeWidth="1.5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="#E1306C"/>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

};