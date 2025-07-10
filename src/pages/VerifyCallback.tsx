import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { account } from '../lib/appwrite';

const VerifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    const secret = params.get('secret');
    if (!userId || !secret) {
      setStatus('error');
      setError('Invalid verification link.');
      return;
    }
    account.updateVerification(userId, secret)
      .then(() => {
        setStatus('success');
        setTimeout(() => {
          navigate('/login', { state: { verified: true } });
        }, 2000);
      })
      .catch((err: any) => {
        setStatus('error');
        setError(err.message || 'Verification failed.');
      });
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        {status === 'pending' && <p>Verifying your email...</p>}
        {status === 'success' && <>
          <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
          <p>Redirecting to login...</p>
        </>}
        {status === 'error' && <>
          <h2 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h2>
          <p className="text-red-500">{error}</p>
        </>}
      </div>
    </div>
  );
};

export default VerifyCallback; 