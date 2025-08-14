import { createContext } from "react";

// Context to share online user data across components
export const OnlineUsersContext = createContext({
  onlineCounts: {}, // groupId -> count
  onlineUsers: {}, // groupId -> [ { userId, socketId } ]
  socket: null,
});
