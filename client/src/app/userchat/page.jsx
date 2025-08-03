"use client";
import React, { useState } from "react";
import Sidebar from "../../component/ChatComponents/Sidebar";
import DomesticChat from "../../component/ChatComponents/DomesticChat";
import GlobalChat from "../../component/ChatComponents/GlobalChat";
import RequestedLeads from "../../component/ChatComponents/RequestedLeads";

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState("local");

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar onTabChange={handleTabChange} activeTab={activeTab} />
      <div className="flex-1 overflow-auto">
        <div className="h-full">{renderActiveComponent()}</div>
      </div>
    </div>
  );
};

export default ChatPage;
