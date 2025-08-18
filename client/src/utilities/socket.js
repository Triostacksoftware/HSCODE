// frontend/src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectUserSocket = (userId, groupIds) => {
  if (socket) socket.disconnect();
  socket = io("http://localhost:8000", {
    query: {
      userId,
      groupIds: JSON.stringify(groupIds),
    },
    withCredentials: true,
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

export default socket;
