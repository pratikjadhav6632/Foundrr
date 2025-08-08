import { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationButton = () => {
  const { 
    unreadCount,
    permissionStatus,
    requestNotificationPermission
  } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(true);
  const isSubscribed = permissionStatus === 'granted';

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
  if (isLoading) {
    return (
      <button 
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        disabled
      >
        <Bell className="w-6 h-6 text-gray-400 animate-pulse" />
      </button>
    );
  }

  // Show appropriate icon based on permission status
  let icon;
  let label;
  
  if (isSubscribed) {
    icon = (
      <>
        <BellRing className="w-6 h-6 text-blue-500" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </>
    );
    label = 'Notifications enabled';
  } else if (permissionStatus === 'denied') {
    icon = <BellOff className="w-6 h-6 text-gray-400" />;
    label = 'Notifications blocked. Click to enable in browser settings.';
  } else {
    icon = <Bell className="w-6 h-6 text-gray-400" />;
    label = 'Enable notifications';
  }

  return (
    <button
      onClick={handleToggleNotifications}
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
      aria-label={label}
      title={label}
      disabled={permissionStatus === 'denied'}
    >
      {icon}
    </button>
  );
};

export default NotificationButton;
