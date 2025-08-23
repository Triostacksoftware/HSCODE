"use client";

import React, { useState, useEffect } from "react";
import { MdTrendingUp, MdCategory, MdGroup, MdArticle, MdSearch } from "react-icons/md";
import axios from "axios";
import hsCodeData from "../../../hs_code_structure.json";

const Dashboard = () => {
  const [stats, setStats] = useState({
    sections: 0,
    chapters: 0,
    groups: 0,
    news: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate HS code stats from JSON data
      const totalSections = hsCodeData.sections.length;
      const totalChapters = hsCodeData.sections.reduce((acc, section) => 
        acc + (section.chapters?.length || 0), 0
      );

      // Fetch groups and news stats
      const [groupsRes, newsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/categories/groups/all`, { withCredentials: true }),
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`, { withCredentials: true })
      ]);

      setStats({
        sections: totalSections,
        chapters: totalChapters,
        groups: groupsRes.data?.length || 0,
        news: newsRes.data?.data?.news?.length || 0
      });

      // Set recent activity (simplified for now)
      setRecentActivity([
        { type: 'section', action: 'viewed', name: 'Section 1 - Live Animals', time: '2 hours ago' },
        { type: 'chapter', action: 'accessed', name: 'Chapter 01 - Live Animals', time: '4 hours ago' },
        { type: 'group', action: 'created', name: 'New Group', time: '1 day ago' }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`w-2 h-2 rounded-full bg-${
        activity.type === 'section' ? 'blue' : 
        activity.type === 'chapter' ? 'green' : 
        activity.type === 'group' ? 'purple' : 'orange'
      }-500`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{activity.action}</span> {activity.type}: {activity.name}
        </p>
        <p className="text-xs text-gray-500">{activity.time}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your HS Code management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="HS Code Sections"
          value={stats.sections}
          icon={MdCategory}
          color="blue"
        />
        <StatCard
          title="HS Code Chapters"
          value={stats.chapters}
          icon={MdGroup}
          color="green"
        />
        <StatCard
          title="Total Groups"
          value={stats.groups}
          icon={MdGroup}
          color="purple"
        />
        <StatCard
          title="News Articles"
          value={stats.news}
          icon={MdArticle}
          color="orange"
        />
      </div>

      {/* HS Code Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sections Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MdCategory className="w-5 h-5 mr-2 text-blue-600" />
            HS Code Sections
          </h3>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-blue-600">{stats.sections}</p>
            <p className="text-sm text-gray-600">Total sections available</p>
            {hsCodeData.sections.slice(0, 5).map((section, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  Section {section.section}. {section.title}
                </span>
                <span className="text-gray-500">
                  {section.chapters?.length || 0} chapters
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chapters Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MdGroup className="w-5 h-5 mr-2 text-green-600" />
            HS Code Chapters
          </h3>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">{stats.chapters}</p>
            <p className="text-sm text-gray-600">Total chapters available</p>
            {hsCodeData.sections.slice(0, 3).map((section, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-gray-700">
                  Section {section.section}: {section.chapters?.length || 0} chapters
                </div>
                {section.chapters?.slice(0, 2).map((chapter, cIndex) => (
                  <div key={cIndex} className="text-xs text-gray-500 ml-2">
                    Chapter {chapter.chapter}: {chapter.heading}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <MdCategory className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Browse Sections</p>
            <p className="text-sm text-gray-600">View HS code sections</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <MdGroup className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Add Group</p>
            <p className="text-sm text-gray-600">Create a new group</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <MdArticle className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Manage News</p>
            <p className="text-sm text-gray-600">Publish news articles</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
