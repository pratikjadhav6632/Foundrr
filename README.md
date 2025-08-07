# Foundrr - Co-founder Matching Platform

## Push Notifications Setup

This guide will help you set up push notifications for the Foundrr platform.

### Prerequisites

1. Node.js 16.x or later
2. npm or yarn package manager
3. A web server with HTTPS (required for service workers and push notifications)

### Setup Instructions

1. **Generate VAPID Keys**

   Push notifications require VAPID (Voluntary Application Server Identification) keys. You can generate these keys using the following command:

   ```bash
   npx web-push generate-vapid-keys
   ```

   This will output a public and private key pair. Copy these values.

2. **Configure Environment Variables**

   Create a `.env` file in the root of your project and add the following:

   ```
   VITE_VAPID_PUBLIC_KEY=your_public_key_here
   VITE_VAPID_PRIVATE_KEY=your_private_key_here
   ```

   Replace `your_public_key_here` and `your_private_key_here` with the keys you generated in step 1.

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

### Using the Notification System

#### Adding the Notification Button

To add a notification subscription button to any component, use the `NotificationButton` component:

```jsx
import { NotificationButton } from './components/NotificationButton';

function MyComponent() {
  return (
    <div>
      <h2>Enable Notifications</h2>
      <NotificationButton />
    </div>
  );
}
```

#### Sending Notifications

To send a notification from anywhere in your application, use the `useNotifications` hook:

```jsx
import { useNotifications } from './contexts/NotificationContext';

function MyComponent() {
  const { sendNotification } = useNotifications();

  const handleClick = () => {
    sendNotification('Hello!', {
      body: 'This is a test notification',
      icon: '/logo192.png',
      data: {
        url: '/some-path' // Optional: URL to navigate to when clicked
      }
    });
  };

  return <button onClick={handleClick}>Send Test Notification</button>;
}
```

### Backend Integration (Optional)

To send push notifications from your server, you'll need to implement server-side code that uses the web-push library. Here's a basic example using Node.js:

```javascript
const webpush = require('web-push');

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VITE_VAPID_PRIVATE_KEY
);

// Example function to send a notification
async function sendPushNotification(subscription, title, options = {}) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        ...options
      })
    );
    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
```

### Testing Notifications

1. Run the development server with HTTPS (required for service workers):
   ```bash
   npm run dev -- --https
   ```

2. Open the app in your browser and click the notification button to enable notifications.

3. Use the browser's developer tools (Application > Service Workers) to verify the service worker is registered correctly.

### Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider.

3. Ensure your server is configured to serve the `service-worker.js` file with the correct MIME type (`application/javascript`).

### Troubleshooting

- **Notifications not working in development?**
  - Make sure you're using HTTPS in development (required for service workers and push notifications).
  - Check the browser's console for any error messages.

- **Service worker not registering?**
  - Clear your browser's cache and reload the page.
  - Check the browser's developer tools (Application > Service Workers) for any registration errors.

- **Not receiving push notifications?**
  - Ensure the browser has granted notification permissions.
  - Check the browser's console for any error messages when sending notifications.
  - Verify that the VAPID keys in your `.env` file match the ones used to subscribe the user.
