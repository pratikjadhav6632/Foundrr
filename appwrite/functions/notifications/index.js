const OneSignal = require('onesignal-node');
const { Client, Databases, Query } = require('node-appwrite');

// Initialize OneSignal client
const oneSignalClient = new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID,
  process.env.ONESIGNAL_API_KEY
);

// Initialize Appwrite client
const appwriteClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(appwriteClient);

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.json({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const { type, title, message, userIds, data = {} } = JSON.parse(req.payload);

    if (!type || !title || !message || !userIds || !Array.isArray(userIds)) {
      return res.json({ 
        success: false, 
        error: 'Missing required fields: type, title, message, or userIds' 
      }, 400);
    }

    // Get the user's notification preferences and OneSignal player IDs
    const users = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const userDoc = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID,
            'user_settings',
            userId
          );
          
          return {
            id: userId,
            playerId: userDoc.oneSignalPlayerId,
            preferences: userDoc.notificationPreferences || {}
          };
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return null;
        }
      })
    );

    // Filter out users who don't have OneSignal player IDs or have disabled this notification type
    const validUsers = users.filter(
      user => user && 
              user.playerId && 
              (user.preferences[type] !== false) // Default to true if preference not set
    );

    if (validUsers.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No valid users to send notifications to' 
      });
    }

    // Create notification in OneSignal
    const notification = {
      headings: { en: title },
      contents: { en: message },
      include_player_ids: validUsers.map(user => user.playerId),
      data: {
        type,
        ...data,
        timestamp: new Date().toISOString()
      },
      // Configure web push notification
      web_push_topic: 'foundrr-notifications',
      // Configure mobile push notification
      android_channel_id: process.env.ONESIGNAL_ANDROID_CHANNEL_ID,
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
    };

    // Send the notification
    const oneSignalResponse = await oneSignalClient.createNotification(notification);

    // Log the notification in the database
    try {
      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        'notifications',
        'unique()',
        {
          type,
          title,
          message,
          recipients: validUsers.map(user => user.id),
          data: JSON.stringify(data),
          status: 'sent',
          oneSignalId: oneSignalResponse.body.id
        }
      );
    } catch (dbError) {
      console.error('Error logging notification to database:', dbError);
      // Don't fail the request if logging fails
    }

    return res.json({
      success: true,
      data: oneSignalResponse.body,
      sentTo: validUsers.map(user => user.id)
    });

  } catch (error) {
    console.error('Error in notification function:', error);
    return res.json({
      success: false,
      error: error.message || 'Internal server error'
    }, 500);
  }
};
