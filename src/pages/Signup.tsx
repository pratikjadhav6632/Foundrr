import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Phone } from 'lucide-react';
import { authService } from '../services/authService';
import { ID } from 'appwrite';

export const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpUserId, setOtpUserId] = useState<string | null>(null);
  const [otpPhone, setOtpPhone] = useState<string | null>(null);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [policyError, setPolicyError] = useState('');
  const { signup, connectionStatus } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Policy acceptance validation
    if (!acceptPolicy) {
      setPolicyError('You must accept the Privacy Policy and Terms & Conditions to sign up.');
      setLoading(false);
      return;
    } else {
      setPolicyError('');
    }

    // Basic validation
    if (!username.trim() || !email.trim() || !password.trim() || !mobile.trim()) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    if (connectionStatus === 'error') {
      toast.error('Unable to connect to server. Please check your internet connection.');
      setLoading(false);
      return;
    }
    try {
      // Generate userId and send OTP to email
      const userId = ID.unique();
      const { userId: returnedUserId } = await authService.sendEmailOtp(userId, email);
      setOtpSent(true);
      setOtpUserId(userId);
      toast.success('OTP sent to your email!');
      // Redirect to OTP verification page, pass userId and email as state
      navigate('/otp-verification', { state: { userId, email, username, password, mobile } });
    } catch (error: any) {
      let message = error.message || 'Failed to create account';
      if (message.includes('already exists')) {
        message = 'An account with this email already exists.';
      } else if (message.includes('Invalid email')) {
        message = 'Please enter a valid email address.';
      } else if (message.includes('password')) {
        message = 'Password must be at least 8 characters.';
      } else if (message.includes('connect')) {
        message = 'Unable to connect to server. Please try again later.';
      }
      toast.error(message);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Join CoFounderMatch</h1>
          <p className="text-gray-600 text-sm sm:text-base">Create your account and start your journey</p>
          {connectionStatus === 'error' && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-xs sm:text-sm text-red-700">
                Connection issue detected. Please check your internet connection.
              </span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Enter your username"
                required
                disabled={loading || connectionStatus === 'error'}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Enter your email"
                required
                disabled={loading || connectionStatus === 'error'}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Mobile Number
            </label>
            <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Enter your mobile number"
                required
                disabled={loading || connectionStatus === 'error'}
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
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Enter your password (min 8 characters)"
                required
                minLength={8}
                disabled={loading || connectionStatus === 'error'}
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
          {/* Policy acceptance checkbox */}
          <div className="flex items-start">
            <input
              id="acceptPolicy"
              type="checkbox"
              checked={acceptPolicy}
              onChange={e => setAcceptPolicy(e.target.checked)}
              className="mt-1 mr-2 accent-purple-600"
              disabled={loading}
              required
            />
            <label htmlFor="acceptPolicy" className="text-xs sm:text-sm text-gray-700 select-none">
              I accept the{' '}
              <Link to="/privacy-policy" className="text-purple-600 underline hover:text-purple-800" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>{' '}and{' '}
              <Link to="/privacy-policy" className="text-purple-600 underline hover:text-purple-800" target="_blank" rel="noopener noreferrer">
                Terms & Conditions
              </Link>
            </label>
          </div>
          {policyError && (
            <div className="text-xs text-red-600 mb-2">{policyError}</div>
          )}
        
          <button
            type="submit"
            disabled={loading || connectionStatus === 'error'}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-gray-600 text-xs sm:text-base">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};