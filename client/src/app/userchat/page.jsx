"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../component/ChatComponents/Sidebar";
import DomesticChat from "../../component/ChatComponents/DomesticChat";
import GlobalChat from "../../component/ChatComponents/GlobalChat";
import RequestedLeads from "../../component/ChatComponents/RequestedLeads";
import UserChatSettings from "../../component/ChatComponents/UserChatSettings";
import NotificationTab from "../../component/ChatComponents/NotificationTab";
import UserChatPage from "../user-chat/page";
import { useUserAuth } from "../../utilities/userAuthMiddleware.js";
import { connectUserSocket } from "../../utilities/socket";
import { OnlineUsersContext } from "../../contexts/OnlineUsersContext";
import axios from "axios";

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState("local");
  const [onlineCounts, setOnlineCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [socket, setSocket] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const { user, refreshUser } = useUserAuth();

  // Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/user/count`,
        {
          withCredentials: true,
        }
      );
      if (response.data?.data?.unread) {
        setNotificationCount(response.data.data.unread);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  // Fetch unread chat count for premium users
  useEffect(() => {
    if (user && (user.membership === "premium" || user.role === "admin")) {
      fetchUnreadChatCount();
    }
  }, [user]);

  const fetchUnreadChatCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-chat/unread/count`,
        { withCredentials: true }
      );
      if (response.data?.success) {
        setUnreadChatCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread chat count:", error);
    }
  };

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

  // Fetch notification count when user is available
  useEffect(() => {
    if (user) {
      fetchNotificationCount();
    }
  }, [user]);

  // Listen for new notifications via WebSocket
  useEffect(() => {
    const handleNewNotification = () => {
      // Increment the notification count when a new notification arrives
      setNotificationCount((prev) => prev + 1);
    };

    window.addEventListener("newNotification", handleNewNotification);

    return () => {
      window.removeEventListener("newNotification", handleNewNotification);
    };
  }, []);

  // Listen for new messages to update unread chat count in real-time
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (data) => {
      console.log("New message received in main chat page:", data);

      // Update unread chat count if user is premium and not in the current chat
      if (user.membership === "premium" || user.role === "admin") {
        // Only increment if not in the current chat
        if (activeTab !== "user-chat") {
          setUnreadChatCount((prev) => prev + 1);
        }
      }
    };

    // Listen for new user messages
    socket.on("new-user-message", handleNewMessage);

    return () => {
      socket.off("new-user-message", handleNewMessage);
    };
  }, [socket, user, activeTab]);

  // Periodic refresh of notification count
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Refresh notification count when switching to notifications tab
    if (tab === "notifications") {
      fetchNotificationCount();
    }

    // Clear unread chat count when switching to user-chat tab
    if (tab === "user-chat") {
      setUnreadChatCount(0);
    }
  };

  const handleChatOpened = () => {
    // Decrease unread count when a chat is opened
    setUnreadChatCount((prev) => Math.max(0, prev - 1));
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "local":
        return <DomesticChat user={user} refreshUser={refreshUser} />;
      case "global":
        return <GlobalChat user={user} refreshUser={refreshUser} />;
      case "leads":
        return <RequestedLeads />;
      case "notifications":
        return <NotificationTab onNotificationRead={fetchNotificationCount} />;
      case "settings":
        return <UserChatSettings />;
      case "user-chat":
        return <UserChatPage onChatOpened={handleChatOpened} />;
      default:
        return <DomesticChat />;
    }
  };

  return (
    <OnlineUsersContext.Provider value={{ onlineCounts, onlineUsers, socket }}>
      <div className="flex h-screen bg-[#FEFEFE] ">
        <Sidebar
          onTabChange={setActiveTab}
          activeTab={activeTab}
          notificationCount={notificationCount}
          user={user}
          unreadChatCount={unreadChatCount}
        />
        <div className="flex-1 overflow-auto">
          <div className="h-full">{renderActiveComponent()}</div>
        </div>
      </div>
    </OnlineUsersContext.Provider>
  );
};

export default ChatPage;
