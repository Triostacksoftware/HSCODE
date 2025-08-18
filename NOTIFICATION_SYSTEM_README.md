# Push Notification System

A comprehensive push notification system for the HSCODE application that allows admins to send notifications to users based on various targeting criteria.

## Features

### 🎯 **Targeting Options**

- **Local Notifications**: Target users by specific country/region
- **Global Notifications**: Target all global group subscribers
- **Individual Notifications**: Target specific users

### 📱 **Notification Types**

- **Announcements**: General announcements and updates
- **Updates**: System and feature updates
- **Reminders**: Time-sensitive reminders
- **Alerts**: Important alerts and warnings
- **News**: News and information

### ⚡ **Priority Levels**

- **Low**: Non-urgent notifications
- **Normal**: Standard notifications
- **High**: Important notifications
- **Urgent**: Critical notifications

### 🕐 **Scheduling**

- Send notifications immediately
- Schedule notifications for future delivery
- Automatic processing of scheduled notifications

### 📊 **Analytics & Tracking**

- Delivery statistics
- Read/unread tracking
- Success/failure monitoring
- User engagement metrics

## Architecture

### Backend Components

#### 1. **Models**

- `Notification.js`: Main notification schema
- `UserNotification.js`: User-specific notification tracking
- Updated `User.js`: Added notification preferences

#### 2. **Controllers**

- `notification.ctrls.js`: Admin notification management
- `userNotification.ctrls.js`: User notification operations

#### 3. **Routes**

- `/api/v1/notifications/admin/*`: Admin endpoints
- `/api/v1/notifications/user/*`: User endpoints

#### 4. **Utilities**

- `scheduledNotifications.util.js`: Scheduled notification processor

### Frontend Components

#### 1. **Admin Panel**

- `NotificationManager.jsx`: Complete notification management interface
- Integrated into superadmin panel

#### 2. **User Interface**

- `NotificationTab.jsx`: User notification center
- Integrated into user chat interface

#### 3. **Real-time Updates**

- WebSocket integration for instant notifications
- Toast notifications for new messages

## API Endpoints

### Admin Endpoints

#### Create Notification

```http
POST /api/v1/notifications/admin/create
Content-Type: application/json

{
  "title": "Notification Title",
  "message": "Notification message content",
  "type": "local|global|individual",
  "targetCountry": "India", // Required for local type
  "priority": "normal",
  "category": "announcement",
  "actionUrl": "https://example.com",
  "actionText": "View Details",
  "imageUrl": "https://example.com/image.jpg",
  "scheduledFor": "2024-01-15T10:00:00Z" // Optional
}
```

#### Get All Notifications

```http
GET /api/v1/notifications/admin/all?page=1&limit=10&status=sent&type=local
```

#### Get Notification Statistics

```http
GET /api/v1/notifications/admin/stats/overview
```

#### Update/Delete Notifications

```http
PUT /api/v1/notifications/admin/:id
DELETE /api/v1/notifications/admin/:id
```

### User Endpoints

#### Get User Notifications

```http
GET /api/v1/notifications/user/all?page=1&limit=20&unreadOnly=true
```

#### Mark as Read

```http
PUT /api/v1/notifications/user/read/:notificationId
```

#### Update Preferences

```http
PUT /api/v1/notifications/user/preferences
Content-Type: application/json

{
  "email": true,
  "push": true,
  "inApp": true,
  "local": true,
  "global": true,
  "individual": true
}
```

## Database Schema

### Notification Collection

```javascript
{
  _id: ObjectId,
  title: String,           // Required
  message: String,          // Required
  type: String,            // local|global|individual
  targetCountry: String,   // Required for local type
  targetUsers: [ObjectId], // For individual type
  targetGroups: [ObjectId], // For local type
  globalGroups: [ObjectId], // For global type
  priority: String,        // low|normal|high|urgent
  category: String,        // announcement|update|reminder|alert|news
  actionUrl: String,       // Optional action URL
  actionText: String,      // Optional action button text
  imageUrl: String,        // Optional image URL
  scheduledFor: Date,      // Optional scheduling
  sentBy: ObjectId,        // SuperAdmin reference
  status: String,          // draft|scheduled|sending|sent|failed
  deliveryStats: {
    totalTargets: Number,
    delivered: Number,
    failed: Number,
    read: Number
  },
  metadata: Map,           // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

### UserNotification Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,          // User reference
  notification: ObjectId,  // Notification reference
  status: String,          // pending|delivered|failed|read
  deliveredAt: Date,       // When delivered
  readAt: Date,            // When read
  deliveryMethod: String,  // websocket|email|push
  failureReason: String,   // If delivery failed
  userPreferences: {       // User's notification preferences
    email: Boolean,
    push: Boolean,
    inApp: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## WebSocket Events

### Server to Client

```javascript
// New notification
socket.emit("notification", {
  id: "notification_id",
  title: "Notification Title",
  message: "Notification message",
  type: "local",
  category: "announcement",
  priority: "normal",
  actionUrl: "https://example.com",
  actionText: "View Details",
  imageUrl: "https://example.com/image.jpg",
  timestamp: "2024-01-15T10:00:00Z",
});
```

### Client to Server

```javascript
// Notification delivery confirmation
socket.emit("notification-delivered", {
  notificationId: "notification_id",
  userId: "user_id",
});
```

## Usage Examples

### 1. Send Local Notification

```javascript
// Admin creates a local notification for India
const notification = {
  title: "New HS Code Updates",
  message: "Updated HS codes for textile products are now available",
  type: "local",
  targetCountry: "India",
  priority: "high",
  category: "update",
};

// Send immediately
await fetch("/api/v1/notifications/admin/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(notification),
});
```

### 2. Schedule Global Notification

```javascript
// Admin schedules a global announcement
const notification = {
  title: "System Maintenance",
  message: "Scheduled maintenance on Sunday 2-4 AM",
  type: "global",
  priority: "normal",
  category: "announcement",
  scheduledFor: "2024-01-21T02:00:00Z",
};
```

### 3. User Receives Notification

```javascript
// User receives real-time notification
socket.on("notification", (notification) => {
  // Show toast notification
  toast.success(notification.title, {
    description: notification.message,
  });

  // Update notification count
  updateNotificationCount();
});
```

## Configuration

### Environment Variables

```bash
# Notification settings
NOTIFICATION_BATCH_SIZE=100
NOTIFICATION_CHECK_INTERVAL=60000  # 1 minute
MAX_RETRY_ATTEMPTS=3
```

### User Preferences

Users can customize their notification preferences:

- **Delivery Methods**: Email, Push, In-app
- **Content Types**: Local, Global, Individual
- **Categories**: Choose which notification types to receive

## Security Features

- **Authentication Required**: All endpoints require proper authentication
- **Role-based Access**: Only superadmins can send notifications
- **Input Validation**: Comprehensive validation of all inputs
- **Rate Limiting**: Prevents abuse of notification system
- **Audit Trail**: Complete tracking of all notification activities

## Performance Optimizations

- **Database Indexing**: Optimized queries for fast retrieval
- **Batch Processing**: Efficient handling of large user bases
- **WebSocket**: Real-time delivery without polling
- **Caching**: Notification preferences and user data caching
- **Async Processing**: Non-blocking notification delivery

## Monitoring & Analytics

### Metrics Tracked

- Total notifications sent
- Delivery success rates
- User engagement (read rates)
- Notification performance by type/category
- System performance metrics

### Health Checks

- Database connectivity
- WebSocket connection status
- Scheduled notification processor status
- Error rates and failure reasons

## Troubleshooting

### Common Issues

#### 1. Notifications Not Delivering

- Check WebSocket connections
- Verify user notification preferences
- Check database connectivity
- Review server logs for errors

#### 2. Scheduled Notifications Not Processing

- Verify scheduled notification processor is running
- Check server timezone settings
- Review cron job logs
- Ensure database indexes are properly set

#### 3. High Memory Usage

- Monitor notification queue size
- Check for memory leaks in WebSocket connections
- Optimize database queries
- Implement notification cleanup policies

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=notifications:*
```

## Future Enhancements

### Planned Features

- **Email Integration**: Send notifications via email
- **Push Notifications**: Mobile push notification support
- **Rich Media**: Support for images, videos, and attachments
- **A/B Testing**: Test different notification formats
- **Advanced Targeting**: Demographic and behavioral targeting
- **Analytics Dashboard**: Comprehensive reporting interface

### Scalability Improvements

- **Queue System**: Redis-based job queue for high-volume notifications
- **Microservices**: Separate notification service
- **CDN Integration**: Global notification delivery optimization
- **Multi-tenant Support**: Support for multiple organizations

## Support

For technical support or questions about the notification system:

- Check the server logs for error details
- Review the API documentation
- Contact the development team
- Submit issues through the project repository

---

**Note**: This notification system is designed to be scalable, secure, and user-friendly. It integrates seamlessly with the existing HSCODE application architecture and provides a robust foundation for user communication.
