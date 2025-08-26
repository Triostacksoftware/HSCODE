import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { Server as SocketServer } from "socket.io";
import UserModel from "./models/user.js";

dotenv.config();

// Create HTTP server from Express app
const server = http.createServer(app);

// Create Socket.IO instance
const io = new SocketServer(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});

export { io };

// Socket.IO Connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  let groupIds = [];

  try {
    groupIds = JSON.parse(socket.handshake.query.groupIds || "[]");
  } catch {
    groupIds = [];
  }

  if (!userId || !Array.isArray(groupIds)) {
    console.log("Invalid socket connection. Disconnecting.");
    socket.disconnect();
    return;
  }

  // Join user to all group rooms
  groupIds.forEach((groupId) => {
    socket.join(`group-${groupId}`);
  });

  // Join user to their personal room for notifications
  socket.join(`user-${userId}`);

  // Broadcast updated online users list to each group
  groupIds.forEach((groupId) => {
    broadcastGroupOnlineUsers(groupId);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected from socket ${socket.id}`);
    groupIds.forEach((groupId) => {
      broadcastGroupOnlineUsers(groupId);
    });
  });

  // Forward lead approval to group
  socket.on("new-approved-lead", ({ groupId, lead }) => {
    io.to(`group-${groupId}`).emit("new-approved-lead", lead);
  });

  // Handle notification delivery confirmation
  socket.on("notification-delivered", ({ notificationId, userId }) => {
    // This will be handled by the notification system
    console.log(`Notification ${notificationId} delivered to user ${userId}`);
  });

  // User-to-User Chat Events
  socket.on("join-user-chat", ({ chatId }) => {
    socket.join(`user-chat-${chatId}`);
    console.log(`User ${userId} joined user chat ${chatId}`);
  });

  socket.on("leave-user-chat", ({ chatId }) => {
    socket.leave(`user-chat-${chatId}`);
    console.log(`User ${userId} left user chat ${chatId}`);
  });

  socket.on("user-typing", ({ chatId, isTyping }) => {
    socket.to(`user-chat-${chatId}`).emit("user-typing", {
      chatId,
      userId,
      isTyping,
    });
  });

  socket.on("user-message", ({ chatId, message, receiverId }) => {
    // Emit to the specific user chat room
    io.to(`user-chat-${chatId}`).emit("new-user-message", {
      chatId,
      message,
      senderId: userId,
    });

    // Also emit to the receiver's personal room for notifications
    io.to(`user-${receiverId}`).emit("new-user-message-notification", {
      chatId,
      message,
      senderId: userId,
    });
  });
});

// Utility: Emit list of online users in a group
async function broadcastGroupOnlineUsers(groupId) {
  const clients = io.sockets.adapter.rooms.get(`group-${groupId}`) || new Set();

  const userIds = Array.from(clients)
    .map((sid) => {
      const socket = io.sockets.sockets.get(sid);
      return socket?.handshake.query.userId;
    })
    .filter(Boolean);

  const uniqueUserIds = [...new Set(userIds)];

  try {
    const users = await UserModel.find(
      { _id: { $in: uniqueUserIds } },
      { _id: 1, name: 1, role: 1 }
    ).lean();

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      role: user.role,
    }));

    io.to(`group-${groupId}`).emit("group-online-users", {
      groupId,
      onlineUserIds: uniqueUserIds,
      onlineUsers: formattedUsers,
    });
  } catch (error) {
    console.error(
      `Error broadcasting online users for group ${groupId}:`,
      error
    );
    io.to(`group-${groupId}`).emit("group-online-users", {
      groupId,
      onlineUserIds: [],
      onlineUsers: [],
    });
  }
}

// Import scheduled notifications utility
import { startScheduledNotificationsProcessor } from "./utilities/scheduledNotifications.util.js";

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Database connected successfully");

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running at ${
          process.env.DOMAIN || "http://localhost:" + PORT
        }`
      );

      // Start the scheduled notifications processor
      startScheduledNotificationsProcessor();
    });
  })
  .catch((err) => {
    console.log("❌ Database connection error");
    console.error(err.message);
  });
