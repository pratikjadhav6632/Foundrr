import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Handshake, X, MapPin, Briefcase, Star, User, Info} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { databases, DATABASE_ID, COLLECTIONS, Query, getAppwriteFilePreviewUrl } from '../lib/appwrite';
import { matchService } from '../services/matchService';
import { Profile } from '../types';
import { useNavigate } from 'react-router-dom';

export const CoFounderMatch: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  // Filter state
  const [locationFilter, setLocationFilter] = useState('');
  const [interestedFieldFilter, setInterestedFieldFilter] = useState('');

  useEffect(() => {
    // Redirect to profile setup if user is logged in but has no profile
    if (user && !profile) {
      navigate('/profile-setup');
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line
  }, [user]);

  // Reload profiles when filters change
  useEffect(() => {
    if (user) {
      loadProfiles();
    }
    // eslint-disable-next-line
  }, [locationFilter, interestedFieldFilter]);

  const loadProfiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const rawProfiles = await profileService.getProfilesForMatching(
        user.$id,
        10,
        {
          location: locationFilter || undefined,
          interestedField: interestedFieldFilter || undefined
        }
      );
      const USERS_COLLECTION = COLLECTIONS?.USERS || 'users';
      // const PROFILES_COLLECTION = COLLECTIONS?.PROFILES || 'profiles';

      const profilesData: Profile[] = await Promise.all(
        rawProfiles.map(async (p) => {
          let name: string | undefined = p.name;
          // Always try to fetch the latest name from USERS collection
          try {
            const userDoc = await databases.getDocument(
              DATABASE_ID,
              USERS_COLLECTION,
              p.userId
            );
            if ((userDoc as any).name) {
              name = (userDoc as any).name;
            }
          } catch {
            // fallback: query by userId field inside collection
            try {
              const docs = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION,
                [Query.equal('userId', p.userId), Query.limit(1)]
              );
              if (docs.total > 0 && (docs.documents[0] as any).name) {
                name = (docs.documents[0] as any).name;
              }
            } catch {}
          }
          return { ...p, name } as Profile;
        })
      );
      // Filter out company, advertisement, newspage profiles
      const filteredProfiles = profilesData.filter(
        (profile) =>
          profile.whoYouAre !== 'company' &&
          profile.whoYouAre !== 'advertisement' &&
          profile.whoYouAre !== 'newspage'
      );
      // Shuffle the filteredProfiles array using Fisher-Yates algorithm
      for (let i = filteredProfiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredProfiles[i], filteredProfiles[j]] = [filteredProfiles[j], filteredProfiles[i]];
      }
      setProfiles(filteredProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || !profiles[currentIndex]) return;

    const targetProfile = profiles[currentIndex];
    const liked = direction === 'right';

    try {
      if (liked) {
        const match = await matchService.handleSwipe(user.$id, targetProfile.userId, true);
        if (match?.isMatched) {
          toast.success(`It's a match with ${targetProfile.username || targetProfile.name || "Anonymous"}! 🎉`);
        } else {
          toast.success(`You liked ${targetProfile.username || targetProfile.name || "Anonymous"}!`);
        }
      } else {
        toast(`You passed on ${targetProfile.username || targetProfile.name || "Anonymous"}`);
      }
    } catch (error) {
      console.error('Error handling swipe:', error);
      toast.error('Failed to process swipe');
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const getProfileImageUrl = (url?: string) => {
    if (!url) return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    if (typeof url !== 'string') return 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return getAppwriteFilePreviewUrl(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Filter UI */}
          <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col gap-3 border border-purple-100">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="Filter by location"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Interested Field</label>
              <select
                value={interestedFieldFilter}
                onChange={e => setInterestedFieldFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="">All Fields</option>
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
          </div>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Filter UI */}
          <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col gap-3 border border-purple-100">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="Filter by location"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Interested Field</label>
              <select
                value={interestedFieldFilter}
                onChange={e => setInterestedFieldFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="">All Fields</option>
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
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No profiles found matching your filters.</h2>
            <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for more co-founders.</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Filter UI */}
          <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col gap-3 border border-purple-100">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="Filter by location"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Interested Field</label>
              <select
                value={interestedFieldFilter}
                onChange={e => setInterestedFieldFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="">All Fields</option>
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
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No more profiles!</h2>
            <p className="text-gray-600 mb-6">Check back later for more co-founders in your area.</p>
            <button 
              onClick={() => {
                setCurrentIndex(0);
                loadProfiles();
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Reload Profiles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Progress bar calculation
  const progress = profiles.length > 0 ? ((currentIndex + 1) / profiles.length) * 100 : 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Filter UI */}
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col gap-3 border border-purple-100">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              placeholder="Filter by location"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Interested Field</label>
            <select
              value={interestedFieldFilter}
              onChange={e => setInterestedFieldFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
              <option value="">All Fields</option>
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
        </div>
        {/* Progress Bar */}
        <div className="h-2 mb-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.$id}
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100"
          >
            {/* Profile Image with badge overlay */}
            <div className="relative h-72 bg-gradient-to-br from-purple-400 via-blue-400 to-blue-600 animate-gradient-x flex flex-col items-center justify-center">
              <a href={`/profile/${currentProfile.userId}`} className="hover:underline flex flex-col items-center">
                <img 
                  src={getProfileImageUrl(typeof currentProfile.profileImage === 'string' ? currentProfile.profileImage : undefined)} 
                  alt="Profile"
                  className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-2xl transition-transform duration-300 hover:scale-105"
                />
                {currentProfile.isFounder && (
                  <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce z-10">
                    <Star className="w-4 h-4" /> Founder
                  </span>
                )}
              </a>
              <div className="absolute bottom-4 left-4 right-4 text-center ">
                <a href={`/profile/${currentProfile.userId}`} className=" text-2xl font-bold text-white mt-1 hover:underline block drop-shadow-lg">
                  {currentProfile.username || currentProfile.name || "Anonymous"}
                </a>
                <div className="flex items-center justify-center text-white/90 text-sm gap-2">
                  <MapPin className="w-4 h-4" />
                  {currentProfile.location || 'Location not specified'}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Age</span>
                  <span className="text-lg font-semibold">{currentProfile.age}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{currentProfile.experience}</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 mb-2">
                  <Info className="w-4 h-4 text-blue-400" /> About
                </h3>
                <p className="text-gray-700">{currentProfile.bio}</p>
              </div>

              <div className="mb-4">
                <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 mb-2">
                  <Star className="w-4 h-4 text-purple-400" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold shadow hover:bg-purple-200 transition-all cursor-pointer hover:scale-105"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 mb-2">
                  <Handshake className="w-4 h-4 text-blue-400" /> Looking For
                </h3>
                <p className="text-gray-700">{currentProfile.lookingFor}</p>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-1 text-sm font-medium text-gray-500 mb-2">
                  <Briefcase className="w-4 h-4 text-green-400" /> Interested Field
                </h3>
                <p className="text-gray-700">{currentProfile.interestedField}</p>
              </div>

              {currentProfile.isFounder && (
                <div className="mb-6 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Founder at {currentProfile.companyName || 'Startup'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all shadow-lg border border-gray-200"
                  title="Pass"
                >
                  <X className="w-8 h-8 text-gray-600" />
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center hover:shadow-2xl active:scale-90 transition-all shadow-lg border-2 border-purple-300"
                  title="Like"
                >
                  <Handshake className="w-8 h-8 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};