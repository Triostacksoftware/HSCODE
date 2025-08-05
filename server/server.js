// index.js (or server.js)
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { Server as SocketServer } from "socket.io";
import UserModel from "./models/user.js";
// import redisClient from "./configurations/redis.js";

dotenv.config();

// Create HTTP server from app
const server = http.createServer(app);

// Create Socket.IO instance
const io = new SocketServer(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});
export { io };

// Store user data and group rooms
const onlineUsers = new Map(); // userId -> { socketId, name, groupId }
const groupRooms = new Map(); // groupId -> Set of userIds
const typingUsers = new Map(); // groupId -> Set of typing userIds

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  let groupIds = [];
  try {
    groupIds = JSON.parse(socket.handshake.query.groupIds || "[]");
  } catch {
    groupIds = [];
  }

  if (!userId || !Array.isArray(groupIds)) {
    socket.disconnect();
    return;
  }

  // Join all group rooms
  groupIds.forEach((groupId) => socket.join(`group-${groupId}`));

  // Broadcast to each group that this user is online
  groupIds.forEach(async (groupId) => {
    const clients =
      io.sockets.adapter.rooms.get(`group-${groupId}`) || new Set();
    const onlineUserIds = Array.from(clients)
      .map((sid) => {
        const s = io.sockets.sockets.get(sid);
        return s?.handshake.query.userId;
      })
      .filter(Boolean);

    // Get unique user IDs and fetch user names
    const uniqueUserIds = [...new Set(onlineUserIds)];

    try {
      const onlineUsers = await UserModel.find(
        { _id: { $in: uniqueUserIds } },
        { _id: 1, name: 1 }
      ).lean();

      const onlineUsersData = onlineUsers.map((user) => ({
        id: user._id.toString(),
        name: user.name,
      }));

      io.to(`group-${groupId}`).emit("group-online-users", {
        groupId,
        onlineUserIds: uniqueUserIds,
        onlineUsers: onlineUsersData,
      });
    } catch (error) {
      console.error("Error fetching online users:", error);
      io.to(`group-${groupId}`).emit("group-online-users", {
        groupId,
        onlineUserIds: uniqueUserIds,
        onlineUsers: [],
      });
    }
  });

  // On disconnect, update all groups
  socket.on("disconnect", () => {
    groupIds.forEach(async (groupId) => {
      const clients =
        io.sockets.adapter.rooms.get(`group-${groupId}`) || new Set();
      const onlineUserIds = Array.from(clients)
        .map((sid) => {
          const s = io.sockets.sockets.get(sid);
          return s?.handshake.query.userId;
        })
        .filter(Boolean);

      // Get unique user IDs and fetch user names
      const uniqueUserIds = [...new Set(onlineUserIds)];

      try {
        const onlineUsers = await UserModel.find(
          { _id: { $in: uniqueUserIds } },
          { _id: 1, name: 1 }
        ).lean();

        const onlineUsersData = onlineUsers.map((user) => ({
          id: user._id.toString(),
          name: user.name,
        }));

        io.to(`group-${groupId}`).emit("group-online-users", {
          groupId,
          onlineUserIds: uniqueUserIds,
          onlineUsers: onlineUsersData,
        });
      } catch (error) {
        console.error("Error fetching online users:", error);
        io.to(`group-${groupId}`).emit("group-online-users", {
          groupId,
          onlineUserIds: uniqueUserIds,
          onlineUsers: [],
        });
      }
    });
  });

  // Admin approval event (already present)
  socket.on("new-approved-lead", (data) => {
    const { groupId, lead } = data;
    io.to(`group-${groupId}`).emit("new-approved-lead", lead);
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected successfully");

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(
        `Server started at ${process.env.DOMAIN || "http://localhost:" + PORT}`
      );
    });
  })
  .catch((err) => {
    console.log("Error connecting with Database");
    console.error(err.message);
  });
