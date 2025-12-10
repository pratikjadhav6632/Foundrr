import { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { useOneSignal } from '../contexts/OneSignalContext';

const NotificationButton = () => {
  const { 
    unreadCount,
    permissionStatus,
    requestNotificationPermission,
    isInitialized
  } = useOneSignal();
  
  const [isLoading, setIsLoading] = useState(true);
  const isSubscribed = permissionStatus === 'granted';
  const isDenied = permissionStatus === 'denied';

  useEffect(() => {
    // Set loading to false once we know the permission status
    if (permissionStatus !== 'default') {
      setIsLoading(false);
    }
  }, [permissionStatus]);

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      // Cannot programmatically revoke notification permission
      // We'll just show a message to the user
      console.log('To disable notifications, please update your browser settings');
      return;
    }
    
    // Request notification permission
    setIsLoading(true);
    try {
      await requestNotificationPermission();
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (!isInitialized || isLoading) {
    return (
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        disabled
      >
        <Bell className="w-6 h-6 text-gray-400 animate-pulse" />
      </button>
    );
  }

  if (isSubscribed) {
    return (
      <button 
        onClick={handleToggleNotifications}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="Notifications enabled"
      >
        <div className="relative">
          <BellRing className="w-6 h-6 text-blue-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>
    );
  }
  
  if (isDenied) {
    return (
      <button 
        onClick={handleToggleNotifications}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="Notifications blocked"
        title="Notifications are blocked. Click to manage in browser settings."
      >
        <BellOff className="w-6 h-6 text-gray-400" />
      </button>
    );
  }

  // Default state - notifications not yet requested
  return (
    <button
      onClick={handleToggleNotifications}
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
      aria-label="Enable notifications"
      title="Click to enable notifications"
    >
      <Bell className="w-6 h-6 text-gray-400" />
    </button>
  );
};

export default NotificationButton;
