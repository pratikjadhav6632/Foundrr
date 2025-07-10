import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  // Helper to check profile completeness
  const isProfileComplete = (profile: any) => {
    if (!profile) return false;
    if (!profile.username || !profile.age || !profile.experience || !profile.interestedField || !profile.bio || !profile.skills?.length || !profile.lookingFor) {
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isProfileComplete(profile) && window.location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};