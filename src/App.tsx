import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import VerifyCallback from './pages/VerifyCallback';

// Fix lazy imports for named exports
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup').then(module => ({ default: module.ProfileSetup })));
const CoFounderMatch = lazy(() => import('./pages/CoFounderMatch').then(module => ({ default: module.CoFounderMatch })));
const Messages = lazy(() => import('./pages/Messages').then(module => ({ default: module.Messages })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const Forum = lazy(() => import('./pages/Forum').then(module => ({ default: module.Forum })));
const ConnectionRequests = lazy(() => import('./pages/ConnectionRequests').then(module => ({ default: module.ConnectionRequests })));
const Notifications = lazy(() => import('./pages/Notifications').then(module => ({ default: module.Notifications })));
const AboutFoundrr = lazy(() => import('./pages/AboutFoundrr').then(module => ({ default: module.default })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(module => ({ default: module.default })));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
          <Navbar />
          <Suspense fallback={<div className="flex justify-center items-center h-96"><span>Loading...</span></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/verify" element={<VerifyCallback />} />
              <Route path="/match" element={
                <ProtectedRoute>
                  <CoFounderMatch />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/forum" element={
                <ProtectedRoute>
                  <Forum />
                </ProtectedRoute>
              } />
              <Route path="/requests" element={
                <ProtectedRoute>
                  <ConnectionRequests />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/about" element={<AboutFoundrr />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Suspense>
          <Toaster position="top-right" />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;