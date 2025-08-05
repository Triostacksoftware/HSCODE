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
  return socket;
};

export default socket;
