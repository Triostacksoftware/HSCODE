"use client";
import React, { useState, useEffect, createContext } from "react";
import Sidebar from "../../component/ChatComponents/Sidebar";
import DomesticChat from "../../component/ChatComponents/DomesticChat";
import GlobalChat from "../../component/ChatComponents/GlobalChat";
import RequestedLeads from "../../component/ChatComponents/RequestedLeads";
import { useUserAuth } from "../../utilities/userAuthMiddleware.js";
import { connectUserSocket } from "../../utilities/socket";

export const OnlineUsersContext = createContext({
  onlineCounts: {},
  onlineUsers: {},
});

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState("local");
  const [onlineCounts, setOnlineCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const { user } = useUserAuth();

  useEffect(() => {
    if (user && user.groupsID && user.groupsID.length > 0) {
      const socket = connectUserSocket(user._id, user.groupsID);
      socket.on(
        "group-online-users",
        ({ groupId, onlineUserIds, onlineUsers: users }) => {
          setOnlineCounts((prev) => ({
            ...prev,
            [groupId]: onlineUserIds.length,
          }));
          setOnlineUsers((prev) => ({
            ...prev,
            [groupId]: users || [],
          }));
        }
      );
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

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
  console.log("onlineUsers", onlineUsers);

  return (
    <OnlineUsersContext.Provider value={{ onlineCounts, onlineUsers }}>
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
