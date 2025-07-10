import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { account } from '../lib/appwrite';
import { toast } from 'react-hot-toast';

const getQueryParam = (search: string, key: string) => {
  const params = new URLSearchParams(search);
  return params.get(key) || '';
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getQueryParam(location.search, 'userId');
  const secret = getQueryParam(location.search, 'secret');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await account.updateRecovery(userId, secret, password);
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!userId || !secret) {
    return <div className="min-h-screen flex items-center justify-center">Invalid reset link.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter new password"
              minLength={8}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirm new password"
              minLength={8}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 