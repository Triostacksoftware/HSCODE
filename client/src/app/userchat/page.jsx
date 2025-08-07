"use client";
import React, { useState, useEffect, createContext } from "react";
import Sidebar from "../../component/ChatComponents/Sidebar";
import DomesticChat from "../../component/ChatComponents/DomesticChat";
import GlobalChat from "../../component/ChatComponents/GlobalChat";
import RequestedLeads from "../../component/ChatComponents/RequestedLeads";
import { useUserAuth } from "../../utilities/userAuthMiddleware.js";
import { connectUserSocket } from "../../utilities/socket";

// Context to share online user data across components
export const OnlineUsersContext = createContext({
  onlineCounts: {}, // groupId -> count
  onlineUsers: {}, // groupId -> [ { userId, socketId } ]
  socket: null,
});

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState("local");
  const [onlineCounts, setOnlineCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [socket, setSocket] = useState(null);
  const { user } = useUserAuth();

  useEffect(() => {
    if (!user || (!user.groupsID?.length && !user.globalGroupsID?.length))
      return;

    // Combine local and global group IDs
    const allGroupIds = [
      ...(user.groupsID || []),
      ...(user.globalGroupsID || []),
    ];

    const socket = connectUserSocket(user._id, allGroupIds);
    setSocket(socket);

    const handleGroupOnlineUsers = ({
      groupId,
      onlineUserIds,
      onlineUsers: users,
    }) => {
      setOnlineCounts((prev) => ({
        ...prev,
        [groupId]: onlineUserIds?.length || 0,
      }));
      setOnlineUsers((prev) => ({
        ...prev,
        [groupId]: users || [],
      }));
    };

    socket.on("group-online-users", handleGroupOnlineUsers);

    return () => {
      socket.off("group-online-users", handleGroupOnlineUsers);
      socket.disconnect();
    };
  }, [
    user?._id,
    JSON.stringify(user?.groupsID),
    JSON.stringify(user?.globalGroupsID),
  ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "local":
        return <DomesticChat />;
      case "global":
        return <GlobalChat />;
      case "leads":
        return <RequestedLeads />;
      case "settings":
        return <div className="p-8">Settings Component</div>;
      default:
        return <DomesticChat />;
    }
  };

  return (
    <OnlineUsersContext.Provider value={{ onlineCounts, onlineUsers, socket }}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar onTabChange={handleTabChange} activeTab={activeTab} />
        <div className="flex-1 overflow-auto">
          <div className="h-full">{renderActiveComponent()}</div>
        </div>
      </div>
    </OnlineUsersContext.Provider>
  );
};

export default ChatPage;
