import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';

const OtpVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get state passed from signup
  const { userId, email, username, password, mobile } = (location.state || {}) as {
    userId: string;
    email: string;
    username: string;
    password: string;
    mobile: string;
  };
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyEmailOtp(userId, otp);
      toast.success('Email verified and account created!');
      window.location.href = "/profile-setup"; // Force reload to update AuthContext
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const result = await authService.sendEmailOtp(userId, email);
      toast.success('OTP resent to your email!');
      setResendCooldown(30); // 30 seconds cooldown
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!userId || !email) {
    return <div className="flex items-center justify-center min-h-screen">Invalid OTP session. Please sign up again.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
        <p className="mb-4 text-center">Enter the OTP sent to <span className="font-semibold">{email}</span></p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="Enter OTP"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
          >
            {resendLoading ? 'Resending...' : resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification; 