import { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

type NotificationButtonProps = {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
}) => {
  const { isSupported, permission, requestPermission, subscribe, isSubscribed } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!isSupported) {
      setStatus('Push notifications not supported in this browser');
    } else if (permission === 'granted') {
      setStatus('Notifications enabled');
    } else if (permission === 'denied') {
      setStatus('Notifications blocked. Please enable them in your browser settings.');
    } else {
      setStatus('Click to enable notifications');
    }
  }, [isSupported, permission, isSubscribed]);

  const handleClick = async () => {
    if (!isSupported) return;
    
    setIsLoading(true);
    try {
      if (permission === 'granted' && isSubscribed) {
        // Already subscribed, maybe show a message
        setStatus('Notifications are already enabled');
      } else if (permission === 'denied') {
        setStatus('Please enable notifications in your browser settings');
      } else {
        const granted = await requestPermission();
        if (granted) {
          await subscribe();
          setStatus('Notifications enabled!');
        } else {
          setStatus('Permission denied');
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setStatus('Error enabling notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      case 'outline':
        return 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50';
      case 'ghost':
        return 'bg-transparent text-blue-500 hover:bg-blue-50';
      case 'primary':
      default:
        return 'bg-blue-500 text-white hover:bg-blue-600';
    }
  };

  const getButtonSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      case 'md':
      default:
        return 'px-4 py-2';
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500">
        Push notifications not supported in this browser
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <button
        onClick={handleClick}
        disabled={isLoading || permission === 'denied'}
        className={`rounded-md font-medium transition-colors ${getButtonVariantClasses()} ${getButtonSizeClasses()} ${
          (isLoading || permission === 'denied') ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {isLoading ? 'Enabling...' : 'Enable Notifications'}
      </button>
      {status && (
        <p className="mt-2 text-sm text-gray-600">
          {status}
        </p>
      )}
    </div>
  );
};
