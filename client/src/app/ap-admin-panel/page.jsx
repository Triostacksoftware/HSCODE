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
  MdMenu,
  MdClose,
} from "react-icons/md";

const AdminPanel = () => {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleNavigation = (pageName) => {
    setActivePage(pageName);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen montserrat bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative z-50 h-full bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        w-64 md:w-64 lg:w-72
      `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <div className="font-semibold">HSCODE</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Logo and App Name */}
        <div className="p-4 md:p-6 font-semibold hidden md:block">HSCODE</div>

        {/* User Profile Section */}
        <div className="p-4 text-gray-900 text-sm">
          <div className="flex items-center p-3 rounded-lg gap-2">
            <div className="px-3 py-2 rounded-md text-sm border flex-shrink-0">
              IN
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold montserrat truncate">
                James Robert
              </div>
              <div className="text-gray-500 text-xs truncate">
                jamesrobert@gmail.com
              </div>
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
                  onClick={() => handleNavigation(item.name)}
                  className={`w-full text-sm cursor-pointer flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activePage === item.name
                      ? " text-gray-900 font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Support and Community */}
        <div className="p-4 mt-auto text-sm space-y-2 absolute bottom-0 left-0 right-0 text-gray-600">
          <button className="w-full px-3 py-2 rounded-lg transition-colors border hover:bg-gray-300 text-xs sm:text-sm">
            Leads Chat
          </button>
          <button className="w-full px-3 py-2 rounded-lg transition-colors border hover:bg-gray-300 text-xs sm:text-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdMenu className="w-5 h-5" />
          </button>
          <div className="font-semibold">HSCODE</div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default AdminPanel;
