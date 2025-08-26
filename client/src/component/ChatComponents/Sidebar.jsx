"use client";
import React, { useState } from "react";
import { HiCog } from "react-icons/hi";
import { HiBars3 } from "react-icons/hi2";
import { BsGlobeAmericas, BsSendArrowUp } from "react-icons/bs";
import { MdHomeMax } from "react-icons/md";
import { FiBell } from "react-icons/fi";
import { FaComments } from "react-icons/fa";

const Sidebar = ({
  onTabChange,
  activeTab,
  notificationCount = 0,
  user,
  unreadChatCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleTabClick = (tab) => {
    onTabChange(tab);
  };

  const menuItems = [
    {
      id: "local",
      label: "Local Chats",
      icon: <MdHomeMax className="w-[1.1em] h-[1.1em]" />,
    },
    {
      id: "global",
      label: "Global Chats",
      icon: <BsGlobeAmericas className="w-[1.1em] h-[1.1em]" />,
    },
    {
      id: "user-chat",
      label: "Direct Chats",
      icon: <FaComments className="w-[1.1em] h-[1.1em]" />,
      badge: unreadChatCount > 0 ? unreadChatCount : null,
      premium: true,
    },
    {
      id: "leads",
      label: "Requested Leads",
      icon: <BsSendArrowUp className="w-[1.1em] h-[1.1em]" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <FiBell className="w-[1.1em] h-[1.1em]" />,
      badge: notificationCount > 0 ? notificationCount : null,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <HiCog className="w-[1.1em] h-[1.1em]" />,
    },
  ];

  return (
    <div
      className={`h-screen transition-all duration-500 bg-[#f3f3f3] overflow-hidden flex flex-col border-r-1 border-gray-200 ${
        isOpen ? "w-56" : "w-14"
      }`}
    >
      {/* Hamburger Menu */}
      <div className="m-2">
        <button
          onClick={toggleSidebar}
          className="cursor-pointer p-2 px-3 flex items-center justify-center rounded transition-colors hover:bg-gray-200 hover:text-[#656565]"
        >
          <HiBars3 className="w-5 h-5 text-gray-600 " />
        </button>
      </div>

      {/* Menu Items (including Settings at bottom) */}
      <div className="flex flex-col h-[calc(100vh-80px)] ">
        {menuItems.map((item, idx) => {
          // Skip premium items for non-premium users
          if (
            item.premium &&
            (!user || (user.membership !== "premium" && user.role !== "admin"))
          ) {
            return null;
          }

          return (
            <div
              key={item.id}
              className={`m-2${idx === menuItems.length - 1 ? " mt-auto" : ""}`}
            >
              <button
                onClick={() => handleTabClick(item.id)}
                className={
                  `w-full flex items-center space-x-3 p-2 px-3 rounded transition-all duration-300 relative min-h-[40px] text-gray-600` +
                  (activeTab === item.id
                    ? " bg-gray-200 "
                    : " hover:bg-gray-200")
                }
              >
                {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[.2em] rounded-md bg-green-600" />
                )}
                <div className="rounded transition-all duration-300 relative">
                  {item.icon}
                  {/* Notification Badge */}
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                {isOpen && (
                  <span className="text-gray-700 text-sm whitespace-nowrap transition-opacity duration-300 opacity-100">
                    {item.label}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
