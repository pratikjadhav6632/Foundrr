importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Initialize OneSignal with the app ID
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '';

// Initialize OneSignal
self.OneSignalDeferred = self.OneSignalDeferred || [];

// Listen for the 'init' event which is triggered when the service worker is installed
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
});

// Listen for the 'activate' event which is triggered after installation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  
  // Take control of all clients (tabs) immediately
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const { title, body, icon, data: notificationData } = data.notification || {};
    
    const options = {
      body: body || '',
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: notificationData || {},
      vibrate: [100, 50, 100],
      requireInteraction: false,
    };
    
    // Show the notification
    event.waitUntil(
      self.registration.showNotification(title || 'New Notification', options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
    
    // Fallback for simple text notifications
    const title = 'New Update';
    const options = {
      body: 'You have new updates',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  // Close the notification
  event.notification.close();
  
  // Get the notification data
  const notificationData = event.notification.data || {};
  
  // Handle the click action
  if (notificationData.url) {
    // Open the URL in a new tab/window
    event.waitUntil(
      clients.openWindow(notificationData.url)
    );
  } else {
    // Focus on the app if it's already open
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If no matching client is found, open a new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');
  
  // This event is fired when the push subscription is about to expire or has expired
  // You can use this to update the subscription on your server
  event.waitUntil(
    self.registration.pushManager.getSubscription()
      .then((subscription) => {
        if (!subscription) {
          return;
        }
        
        // Send the new subscription to your server
        return fetch('/api/update-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription,
          }),
        });
      })
  );
});
