// frontend/src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectUserSocket = (userId, groupIds) => {
  if (socket) socket.disconnect();

  // Use environment variable for socket URL, fallback to localhost for development
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (process.env.NODE_ENV === "production"
      ? window.location.origin.replace(/^https?:\/\//, "wss://")
      : "http://localhost:8000");

  // Debug mode for production troubleshooting
  const isDebug =
    process.env.NODE_ENV === "development" ||
    localStorage.getItem("socket-debug") === "true";

  if (isDebug) {
    console.log("🔌 Socket Debug Mode Enabled");
    console.log("🌍 Environment:", process.env.NODE_ENV);
    console.log("🔗 Socket URL:", socketUrl);
    console.log("👤 User ID:", userId);
    console.log("👥 Group IDs:", groupIds);
  }

  socket = io(socketUrl, {
    query: {
      userId,
      groupIds: JSON.stringify(groupIds),
    },
    withCredentials: true,
    transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
    timeout: 20000, // 20 second timeout
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    forceNew: true, // Force new connection
  });

  // Connection event handlers
  socket.on("connect", () => {
    if (isDebug) console.log("✅ Socket connected successfully");

    // Store connection status in localStorage for debugging
    localStorage.setItem("socket-status", "connected");
    localStorage.setItem("socket-id", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
    localStorage.setItem("socket-status", "error");
    localStorage.setItem("socket-error", error.message);

    // Log detailed error info in production
    if (isDebug) {
      console.error("🔍 Connection Error Details:", {
        error: error.message,
        type: error.type,
        description: error.description,
        context: error.context,
        url: socketUrl,
        userId,
        groupIds,
      });
    }
  });

  socket.on("disconnect", (reason) => {
    if (isDebug) console.log("🔌 Socket disconnected:", reason);
    localStorage.setItem("socket-status", "disconnected");
    localStorage.setItem("socket-disconnect-reason", reason);
  });

  socket.on("reconnect", (attemptNumber) => {
    if (isDebug)
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    localStorage.setItem("socket-status", "reconnected");
  });

  socket.on("reconnect_error", (error) => {
    console.error("❌ Socket reconnection error:", error);
    localStorage.setItem("socket-status", "reconnect-error");
  });

  // Listen for notifications
  socket.on("notification", (notification) => {
    // Emit a custom event that components can listen to
    const event = new CustomEvent("newNotification", { detail: notification });
    window.dispatchEvent(event);

    // Show toast notification
    if (window.toast) {
      window.toast.success(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    }
  });

  return socket;
};

// Debug helper function
export const getSocketDebugInfo = () => {
  return {
    status: localStorage.getItem("socket-status") || "unknown",
    socketId: localStorage.getItem("socket-id") || "none",
    error: localStorage.getItem("socket-error") || "none",
    disconnectReason:
      localStorage.getItem("socket-disconnect-reason") || "none",
    isConnected: socket?.connected || false,
    transport: socket?.io?.engine?.transport?.name || "unknown",
  };
};

// Enable debug mode manually
export const enableSocketDebug = () => {
  localStorage.setItem("socket-debug", "true");
  console.log("🔌 Socket debug mode enabled. Refresh page to see debug logs.");
};

export default socket;
