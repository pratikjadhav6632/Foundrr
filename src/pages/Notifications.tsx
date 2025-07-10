import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Heart, Users, MessageCircle, UserPlus } from 'lucide-react';
import { matchService } from '../services/matchService';
import { forumService } from '../services/forumService';
import { messageService } from '../services/messageService';
import { Link } from 'react-router-dom';


interface Notification {
  id: string;
  type: 'connection' | 'match' | 'forum' | 'message';
  title: string;
  description: string;
  createdAt: string;
  link?: string;
  icon?: React.ReactNode;
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      const notifs: Notification[] = [];
      // Connection requests
      const pending = await matchService.getPendingRequests(user.$id);
      for (const req of pending) {
        notifs.push({
          id: `conn-${req.$id}`,
          type: 'connection',
          title: 'New Connection Request',
          description: `You have a new connection request!`,
          createdAt: req.$createdAt,
          link: '/requests',
          icon: <UserPlus className="w-6 h-6 text-blue-600" />,
        });
      }
      // Matches
      const matches = await matchService.getUserMatches(user.$id);
      for (const match of matches) {
        notifs.push({
          id: `match-${match.$id}`,
          type: 'match',
          title: "It's a Match!",
          description: `You matched with a new co-founder!`,
          createdAt: match.$createdAt,
          link: '/messages',
          icon: <Heart className="w-6 h-6 text-pink-500" />,
        });
      }
      // Unread messages
      const unreadCount = await messageService.getUnreadCount(user.$id);
      if (unreadCount > 0) {
        notifs.push({
          id: `msg-unread`,
          type: 'message',
          title: 'New Messages',
          description: `You have ${unreadCount} unread message(s).`,
          createdAt: new Date().toISOString(),
          link: '/messages',
          icon: <MessageCircle className="w-6 h-6 text-green-600" />,
        });
      }
      // Recent forum posts (last 5)
      const posts = await forumService.getPosts(undefined, 5);
      for (const post of posts) {
        notifs.push({
          id: `forum-${post.$id}`,
          type: 'forum',
          title: 'New Forum Post',
          description: `${post.title}`,
          createdAt: post.$createdAt,
          link: '/forum',
          icon: <Users className="w-6 h-6 text-purple-600" />,
        });
      }
      // Sort by createdAt desc
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(notifs);
      setLoading(false);
    })();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto px-2 sm:px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center gap-2">
          <Bell className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" /> Notifications
        </h1>
        {loading ? (
          <div className="text-center text-gray-500 text-sm sm:text-base">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 text-sm sm:text-base">No notifications yet.</div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                to={notif.link || '#'}
                className="block bg-white rounded-xl shadow p-3 sm:p-5 flex items-center space-x-3 sm:space-x-4 hover:bg-purple-50 transition"
                onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
              >
                <div>{notif.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-xs sm:text-base truncate">{notif.title}</div>
                  <div className="text-gray-600 text-xs sm:text-sm truncate">{notif.description}</div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">{formatTime(notif.createdAt)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 