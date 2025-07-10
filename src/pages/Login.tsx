import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { account } from '../lib/appwrite';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, connectionStatus, user, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmailOrMobile, setResetEmailOrMobile] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Clear error on mount and when user logs in
  React.useEffect(() => {
    setLoginError(null);
  }, [user]);

  // Only allow email+password login for existing users
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (connectionStatus === 'error') {
      toast.error('Unable to connect to server. Please check your internet connection.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      setLoginError(null);
      toast.success('Welcome back!');
      navigate('/match');
    } catch (error: any) {
      setLoginError(error.message || 'Invalid email or password');
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmailOrMobile.trim()) {
      toast.error('Enter your email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset({ email: resetEmailOrMobile });
      setResetSent(true);
      toast.success('Password reset instructions sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-8 sm:py-12">
      <motion.div 
        className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-sm sm:text-base">Sign in to find your perfect co-founder</p>
          {connectionStatus === 'error' && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-xs sm:text-sm text-red-700">
                Connection issue detected. Please check your internet connection.
              </span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" style={{ display: forgotPassword ? 'none' : 'block' }}>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (loginError) setLoginError(null); }}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (loginError) setLoginError(null); }}
                className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
              onClick={() => { setForgotPassword(true); setResetSent(false); setResetEmailOrMobile(''); }}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
          {loginError && (
            <div className="text-red-600 text-sm text-center font-medium">{loginError}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {/* Forgot Password Form */}
        {forgotPassword && (
          <form onSubmit={handleForgotPassword} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Enter your email to reset password
              </label>
              <input
                type="email"
                value={resetEmailOrMobile}
                onChange={(e) => setResetEmailOrMobile(e.target.value)}
                className="w-full pl-4 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Enter your email"
                required
                disabled={loading || resetSent}
              />
            </div>
            {resetSent && (
              <div className="text-green-600 text-sm text-center font-medium">Password reset instructions sent! Check your email.</div>
            )}
            <div className="flex justify-between">
              <button
                type="button"
                className="text-xs text-gray-500 hover:underline"
                onClick={() => setForgotPassword(false)}
                disabled={loading}
              >
                Back to Login
              </button>
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                disabled={loading || resetSent}
              >
                {resetSent ? 'Sent' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-gray-600 text-xs sm:text-base">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};