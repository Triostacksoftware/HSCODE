"use client";
import React, { useState } from "react";
import { HiMenu, HiGlobe, HiUserGroup, HiCog } from "react-icons/hi";

import { BsGlobeAmericas } from "react-icons/bs";
import { TbMessage2Question } from "react-icons/tb";
import { LuMapPinHouse } from "react-icons/lu";

const Sidebar = ({ onTabChange, activeTab }) => {
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
      label: "Local Chat",
      icon: <LuMapPinHouse className="w-6 h-6" />,
      color: "bg-white text-black ",
    },
    {
      id: "global",
      label: "Global Chat",
      icon: <BsGlobeAmericas className="w-6 h-6" />,
      color: "bg-white text-black ",
    },
    {
      id: "leads",
      label: "Requested Leads",
      icon: <TbMessage2Question className="w-6 h-6" />,
      color: "bg-white text-black ",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <HiCog className="w-6 h-6" />,
      color: "bg-white text-black ",
    },
  ];

  return (
    <div
      className={`h-screen bg-white border-r border-4 border-gray-200 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Hamburger Menu */}
      <div className="p-4 ">
        <button
          onClick={toggleSidebar}
          className="cursor-pointer w-8 h-8 flex items-center justify-center bg-blue-100 rounded hover:bg-blue-200 transition-colors"
        >
          <HiMenu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1">
          {menuItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className={`${isOpen ? "py-2 px-4" : "py-1 px-2"}`}
            >
              <button
                onClick={() => handleTabClick(item.id)}
                className={`cursor-pointer w-full flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 hover:bg-gray-100`}
              >
                <div
                  className={`w-6 h-6  flex items-center justify-center rounded transition-all duration-300 ${
                    activeTab === item.id ? "bg-black text-white" : item.color
                  }`}
                >
                  {item.icon}
                </div>
                {isOpen && (
                  <span className="text-gray-700 font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Settings at bottom */}
        <div className={`${isOpen ? "py-2 px-4" : "py-1 px-2"}`}>
          <button
            onClick={() => handleTabClick(menuItems[3].id)}
            className={`cursor-pointer w-full flex items-center space-x-3 p-2 rounded-lg transition-all duration-300 hover:bg-gray-100`}
          >
            <div
              className={`w-6 h-6 flex items-center justify-center rounded transition-all duration-300 ${
                activeTab === menuItems[3].id
                  ? "bg-amber-700 text-white"
                  : menuItems[3].color
              }`}
            >
              {menuItems[3].icon}
            </div>
            {isOpen && (
              <span className="text-gray-700 font-medium whitespace-nowrap">
                {menuItems[3].label}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
