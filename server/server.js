// index.js (or server.js)
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { Server as SocketServer } from "socket.io";

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

// Setup socket events
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("send-message", (data) => {
    console.log("📨 Message from client:", data);
    socket.broadcast.emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected successfully");

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`Server started at ${process.env.DOMAIN || "http://localhost:" + PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting with Database");
    console.error(err.message);
  });
