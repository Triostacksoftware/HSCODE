"use client";
import React, { useState } from "react";
import Dashboard from "@/component/adminPanelComponent/Dashboard";
import HomeContent from "@/component/adminPanelComponent/HomeContent";
import Categories from "@/component/adminPanelComponent/Categories";
import Settings from "@/component/adminPanelComponent/Settings";
import {
  MdDashboard,
  MdReceipt,
  MdSwapHoriz,
  MdPayment,
  MdInbox,
  MdSettings,
  MdHistory,
  MdHeadphones,
  MdPublic,
} from "react-icons/md";

const AdminPanel = () => {
  const [activePage, setActivePage] = useState("Dashboard");

  const navigationItems = [
    { name: "Dashboard", icon: MdDashboard, component: Dashboard },
    { name: "Home Content", icon: MdReceipt, component: HomeContent },
    { name: "Categories", icon: MdReceipt, component: Categories },
    { name: "Settings", icon: MdSettings, component: Settings },
  ];

  const renderComponent = () => {
    const currentItem = navigationItems.find(
      (item) => item.name === activePage
    );
    if (currentItem && currentItem.component) {
      const Component = currentItem.component;
      return <Component />;
    }
    return <Dashboard />;
  };

  return (
    <div className="flex h-screen montserrat bg-gray-50">
      {/* Sidebar */}
      <div className="relative w-64 bg-white border-r border-gray-200">
        {/* Logo and App Name */}
        <div className="p-6 ">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
              <div className="w-4 h-4 border  border-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-black">Sinvoice</span>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 ">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-gray-50 border font-semibold">
              IN
            </div>
            <div>
              <div className="font-semibold montserrat text-black">
                James Robert
              </div>
              <div className="text-sm text-gray-500">jamesrobert@gmail.com</div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="p-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActivePage(item.name)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activePage === item.name
                      ? " text-black font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Support and Community */}
        <div className="p-4 mt-auto space-y-2 absolute bottom-0 left-0 right-0">
          <button className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors bg-black text-white">
            Leads Chat
          </button>
          <button className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors bg-black text-white">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default AdminPanel;
