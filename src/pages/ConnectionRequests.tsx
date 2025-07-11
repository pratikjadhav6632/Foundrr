import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchService } from '../services/matchService';
import { profileService } from '../services/profileService';
import { Profile, Match } from '../types';
import { toast } from 'react-hot-toast';
import { getAppwriteFilePreviewUrl } from '../lib/appwrite';

interface RequestData {
  match: Match;
  requesterProfile: Profile;
}

export const ConnectionRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
    // eslint-disable-next-line
  }, [user]);

  const loadRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get all matches where user is user2 and user1Liked is true, user2Liked is false, and not matched
      const pendingMatches = await matchService.getPendingRequests(user.$id);
      const requestData: RequestData[] = [];
      for (const match of pendingMatches) {
        const requesterId = match.user1Id;
        const requesterProfile = await profileService.getProfile(requesterId);
        if (requesterProfile) {
          requestData.push({ match, requesterProfile });
        }
      }
      setRequests(requestData);
    } catch (error) {
      toast.error('Failed to load connection requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId: string) => {
    try {
      await matchService.acceptRequest(matchId);
      toast.success('Connection accepted!');
      loadRequests();
      // Dispatch event to refresh notification counts
      window.dispatchEvent(new Event('refresh-notification-counts'));
    } catch (error) {
      toast.error('Failed to accept connection');
    }
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Connection Requests</h1>
        {requests.length === 0 ? (
          <div className="text-center text-gray-500">No pending connection requests.</div>
        ) : (
          <div className="space-y-6">
            {requests.map(({ match, requesterProfile }) => (
              <div key={match.$id} className="bg-white rounded-xl shadow p-6 flex items-center space-x-4">
                <a href={`/profile/${requesterProfile.userId}`} className="hover:underline">
                  <img
                    src={getProfileImageUrl(typeof requesterProfile.profileImage === 'string' ? requesterProfile.profileImage : undefined)}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </a>
                <div className="flex-1">
                  <a href={`/profile/${requesterProfile.userId}`} className="text-xl font-semibold text-gray-800 hover:underline">
                    {requesterProfile.username || requesterProfile.name || 'Anonymous'}
                  </a>
                  <p className="text-gray-600">{requesterProfile.bio}</p>
                </div>
                <button
                  onClick={() => handleAccept(match.$id)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 