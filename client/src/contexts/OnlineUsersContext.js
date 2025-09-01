"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Context to share online user data across components
export const OnlineUsersContext = createContext({
  onlineCounts: {}, // groupId -> count
  onlineUsers: {}, // groupId -> [ { userId, socketId } ]
  socket: null,
});

export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  if (!context) {
    throw new Error(
      "useOnlineUsers must be used within an OnlineUsersProvider"
    );
  }
  return context;
};

export const OnlineUsersProvider = ({ children }) => {
  const [onlineCounts, setOnlineCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [socket, setSocket] = useState(null);

  const value = {
    onlineCounts,
    onlineUsers,
    socket,
    setOnlineCounts,
    setOnlineUsers,
    setSocket,
  };

  return (
    <OnlineUsersContext.Provider value={value}>
      {children}
    </OnlineUsersContext.Provider>
  );
};
