import React, { useState } from 'react';
import { account } from '../lib/appwrite';

const Verification: React.FC = () => {
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await account.createVerification(window.location.origin + '/verify');
      setResent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Verify Your Email</h2>
        <p className="mb-4 text-center">A verification link has been sent to your email address. Please check your inbox and click the link to verify your account.</p>
        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleResend}
          disabled={loading || resent}
        >
          {loading ? 'Resending...' : resent ? 'Verification Email Sent!' : 'Resend Verification Email'}
        </button>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Verification; 