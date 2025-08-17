"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../utilities/authMiddleware";
import Dashboard from "@/component/adminPanelComponent/Dashboard";
import HomeContent from "@/component/adminPanelComponent/HomeContent";
import Categories from "@/component/adminPanelComponent/Categories";
import Settings from "@/component/adminPanelComponent/Settings";
import RequestedLeads from "@/component/adminPanelComponent/RequestedLeads";
import GlobalRequestedLeads from "@/component/adminPanelComponent/GlobalRequestedLeads";
import {
  MdOutlineDashboard,
  MdOutlineHomeMax,
  MdOutlineCategory,
  MdOutlineSettings,
  MdMenu,
  MdClose,
  MdLogout,
  MdOutlineRequestPage,
  MdOutlinePublic,
} from "react-icons/md";

const AdminPanel = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  const navigationItems = [
    { name: "Dashboard", icon: MdOutlineDashboard, component: Dashboard },
    { name: "Home Content", icon: MdOutlineHomeMax, component: HomeContent },
    { name: "Categories", icon: MdOutlineCategory, component: Categories },
    {
      name: "Local Leads",
      icon: MdOutlineRequestPage,
      component: RequestedLeads,
    },
    {
      name: "Global Leads",
      icon: MdOutlinePublic,
      component: GlobalRequestedLeads,
    },
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Clear the auth token cookie by setting it to expire
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      // Redirect to TOTP admin auth page
      router.push("/ap-admin-auth-totp");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login page
      router.push("/ap-admin-auth-totp");
    } finally {
      setIsLoggingOut(false);
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
          <div className="font-semibold">
            <img
              src="/hscode.png"
              alt="HS CODES"
              className="h-8 w-auto"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Logo and App Name */}
        <div className="p-4 md:p-6 hidden md:block">
          <img
            src="/hscode.png"
            alt="HS CODES"
            className="h-10 w-auto"
          />
        </div>

        {/* User Profile Section */}
        <div className="p-4 text-gray-900 text-sm">
          <div className="flex items-center p-3 rounded-lg gap-2">
            <div className="px-3 py-2 rounded-md text-sm border flex-shrink-0">
              {user?.countryCode || "IN"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold montserrat truncate">
                {user?.name || "Admin User"}
              </div>
              <div className="text-gray-500 text-xs truncate">
                {user?.email || "admin@example.com"}
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
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-3 py-2 rounded-lg transition-colors border hover:bg-gray-300 text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdLogout className="w-4 h-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
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
          <div className="font-semibold">
            <img
              src="/hscode.png"
              alt="HS CODES"
              className="h-8 w-auto"
            />
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default AdminPanel;
