"use client";
import React, { useState } from "react";
import Dashboard from "@/component/adminPanelComponent/Dashboard";
import HomeContent from "@/component/adminPanelComponent/HomeContent";
import Categories from "@/component/adminPanelComponent/Categories";
import Settings from "@/component/adminPanelComponent/Settings";
import {
  MdOutlineDashboard,
  MdOutlineHomeMax,
  MdOutlineCategory,
  MdOutlineSettings,
} from "react-icons/md";

const AdminPanel = () => {
  const [activePage, setActivePage] = useState("Dashboard");

  const navigationItems = [
    { name: "Dashboard", icon: MdOutlineDashboard, component: Dashboard },
    { name: "Home Content", icon: MdOutlineHomeMax, component: HomeContent },
    { name: "Categories", icon: MdOutlineCategory, component: Categories },
    { name: "Settings", icon: MdOutlineSettings, component: Settings },
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
        <div className="p-6 font-semibold">
            HSCODE
        </div>

        {/* User Profile Section */}
        <div className="p-4 text-gray-900 text-sm">
          <div className="flex items-center p-3 rounded-lg gap-2">
            <div className="px-3 py-2 rounded-md text-sm border">
              IN
            </div>
            <div>
              <div className="font-semibold montserrat">
                James Robert
              </div>
              <div className="text-gray-500">jamesrobert@gmail.com</div>
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
                  className={`w-full text-sm cursor-pointer flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activePage === item.name
                      ? " text-gray-900 font-semibold"
                      : "text-gray-600 hover:text-gray-900"
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
        <div className="p-4 mt-auto text-sm space-y-2 absolute bottom-0 left-0 right-0 text-gray-600">
          <button className="w-full px-3 py-2 rounded-lg transition-colors border  hover:bg-gray-300">
            Leads Chat
          </button>
          <button className="w-full px-3 py-2 rounded-lg transition-colors border  hover:bg-gray-300">
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
