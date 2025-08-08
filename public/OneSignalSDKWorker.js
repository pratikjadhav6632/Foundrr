importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// This is the service worker that handles push notifications
// It's automatically registered by OneSignal's SDK

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  // Close the notification popup
  event.notification.close();
  
  // Get the URL from the notification's data or use a default
  const urlToOpen = event.notification.data?.url || '/';
  
  // This looks to see if the current tab is already open and focuses it if it is
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no matching tab is found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('Push subscription changed:', event);
  // You can add code here to update the subscription on your server
  // if the push subscription changes
});
