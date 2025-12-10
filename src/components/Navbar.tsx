import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {  MessageCircle, User,  Users, Home, UserPlus, Bell,  Handshake,  } from 'lucide-react';
import { matchService } from '../services/matchService';
import { messageService } from '../services/messageService';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();


  const [pendingRequests, setPendingRequests] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState(0);

  React.useEffect(() => {
    const refreshCounts = () => {
      if (!user) {
        setPendingRequests(0);
        setUnreadMessages(0);
        return;
      }
      matchService.getPendingRequests(user.$id).then(reqs => setPendingRequests(reqs.length));
      messageService.getUnreadCount(user.$id).then(count => setUnreadMessages(count));
    };
    refreshCounts(); // Fetch counts on mount/user change
    window.addEventListener('refresh-notification-counts', refreshCounts);
    return () => window.removeEventListener('refresh-notification-counts', refreshCounts);
  }, [user]);



  const isActive = (path: string) => location.pathname === path;

  // Menu links for reuse
  const menuLinks = (
    <>
      <Link 
        to="/" 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
          isActive('/') ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        <Home size={20} />
        <span className="inline">Home</span>
      </Link>
      <Link 
        to="/match" 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
          isActive('/match') ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        < Handshake size={20} />
        <span className="inline">Match</span>
      </Link>
      <Link 
        to="/requests" 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
          isActive('/requests') ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        <UserPlus size={20} />
        <span className="inline">Requests</span>
        {pendingRequests > 0 && (
          <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{pendingRequests}</span>
        )}
      </Link>
      <Link 
        to="/messages" 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
          isActive('/messages') ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        <MessageCircle size={20} />
        <span className="inline">Messages</span>
        {unreadMessages > 0 && (
          <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadMessages}</span>
        )}
      </Link>
      {/* <Link 
        to="/forum" 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
          isActive('/forum') ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        <Users size={20} />
        <span className="inline">Community</span>
      </Link> */}
      <Link 
        to="/notifications" 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
          isActive('/notifications') ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        <Bell size={20} />
        <span className="inline">Notifications</span>
        {pendingRequests > 0 || unreadMessages > 0 && (
          <span className="ml-1 bg-red-500 rounded-full w-2 h-2 inline-block"></span>
        )}
      </Link>
      <Link 
        to="/profile" 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
          isActive('/profile') ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        <User size={20} />
        <span className="inline">Profile</span>
      </Link>
     
    </>
  );

  // Bottom mobile navbar (only icons, evenly spaced)
  const BottomMobileNav: React.FC<{ isActive: (path: string) => boolean }> = ({ isActive }) => {
    if (!user) {
      // Only show Home icon if not logged in
      return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow md:hidden flex justify-between px-2 py-1">
          <Link to="/" className="flex-1 flex flex-col items-center justify-center py-2" aria-label="Home">
            <Home size={24} className={isActive('/') ? 'text-purple-600' : 'text-gray-400'} />
          </Link>
        </nav>
      );
    }
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow md:hidden flex justify-between px-2 py-1">
        <Link to="/" className="flex-1 flex flex-col items-center justify-center py-2" aria-label="Home">
          <Home size={24} className={isActive('/') ? 'text-purple-600' : 'text-gray-400'} />
        </Link>
        <Link to="/match" className="flex-1 flex flex-col items-center justify-center py-2" aria-label="Match">
          < Handshake  size={24} className={isActive('/match') ? 'text-purple-600' : 'text-gray-400'} />
        </Link>
        <Link to="/messages" className="flex-1 flex flex-col items-center justify-center py-2 relative" aria-label="Messages">
          <MessageCircle size={24} className={isActive('/messages') ? 'text-purple-600' : 'text-gray-400'} />
          {unreadMessages > 0 && (
            <span className="absolute top-1 left-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow" style={{fontSize: '10px'}}>{unreadMessages}</span>
          )}
        </Link>
        <Link to="/forum" className="flex-1 flex flex-col items-center justify-center py-2" aria-label="Community">
          <Users size={24} className={isActive('/forum') ? 'text-purple-600' : 'text-gray-400'} />
        </Link>
        <Link to="/profile" className="flex-1 flex flex-col items-center justify-center py-2" aria-label="Profile">
          <User size={24} className={isActive('/profile') ? 'text-purple-600' : 'text-gray-400'} />
        </Link>
      </nav>
    );
  };

  if (!user) {
    return (
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
             Foundrr
            </Link>
            <div className="space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-purple-600 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
             Foundrr
            </Link>
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? menuLinks : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-purple-600 transition-colors">Login</Link>
                  <Link to="/signup" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all">Sign Up</Link>
                </>
              )}
            </div>
            
            {/* Mobile notification icon */}
            <div className="md:hidden flex items-center">
            <Link 
        to="/requests" 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
          isActive('/requests') ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'
        }`}
      >
        <UserPlus size={20} />
   
        {pendingRequests > 0 && (
          <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{pendingRequests}</span>
        )}
      </Link>
              <Link to="/notifications" className="relative p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" aria-label="Notifications">
                <Bell size={28} className="text-gray-600" />
                {(pendingRequests > 0 || unreadMessages > 0) && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow" style={{fontSize: '10px'}}>
                    {pendingRequests + unreadMessages}
                  </span>
                )}
              </Link>
             
            </div>
          </div>
        </div>
      </nav>
      {/* Bottom mobile navbar */}
      <BottomMobileNav isActive={isActive} />
    </>
  );
};