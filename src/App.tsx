import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OneSignalProvider } from './contexts/OneSignalContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import VerifyCallback from './pages/VerifyCallback';
import PostDetail from './pages/PostDetail';
import Feedback from './pages/Feedback';
import PrivacyPolicy from './pages/PrivacyPolicy';
import HelpSupport from './pages/HelpSupport';
import TermsCondition from './pages/TermsCondition';
import OneSignal from 'react-onesignal';

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
const OtpVerification = lazy(() => import('./pages/OtpVerification').then(module => ({ default: module.default })));

// Component to initialize OneSignal after authentication
const OneSignalInitializer = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize OneSignal when user is authenticated
      OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        notifyButton: {
          enable: true,
        },
      }).then(() => {
        console.log('OneSignal initialized');
      }).catch(error => {
        console.error('Error initializing OneSignal:', error);
      });
    }
  }, [isAuthenticated]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <OneSignalProvider>
        <OneSignalInitializer />
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
                <Route path="/otp-verification" element={<OtpVerification />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/help-support" element={<HelpSupport />} />
                <Route path="/terms-condition" element={<TermsCondition />} />
              </Routes>
            </Suspense>
            <Toaster position="top-right" />
            <Footer />
          </div>
        </Router>
      </OneSignalProvider>
    </AuthProvider>
  );
}

export default App;