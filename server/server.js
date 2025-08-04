// index.js (or server.js)
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { Server as SocketServer } from "socket.io";
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

// Store userId -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userId) {
    console.log('Connection rejected: no userId');
    socket.disconnect();
    return;
  }

  console.log(`${userId} connected`);

  // Save user as online
  onlineUsers.set(userId, socket.id);

  // Send current list of online users to the new user
  socket.emit('online-users-list', Array.from(onlineUsers.keys()));

  // Notify others
  socket.broadcast.emit('user-online', userId);

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`${userId} disconnected`);
    onlineUsers.delete(userId);
    socket.broadcast.emit('user-offline', userId);
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
