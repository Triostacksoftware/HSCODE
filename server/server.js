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
      { _id: 1, name: 1 }
    ).lean();

    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
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
    });
  })
  .catch((err) => {
    console.log("❌ Database connection error");
    console.error(err.message);
  });
