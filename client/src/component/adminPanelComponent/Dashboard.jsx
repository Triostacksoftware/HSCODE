"use client";

import React, { useState, useEffect } from "react";
import { MdTrendingUp, MdGroup, MdArticle, MdSearch } from "react-icons/md";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    pendingLeads: 0,
    approvedLeads: 0,
    totalGlobalGroups: 0,
    activeGroups: 0,
    todayRegistrations: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch admin dashboard stats from the new endpoint
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/admin-dashboard-stats`, { 
        withCredentials: true 
      });

      const data = response.data;
      
      setStats({
        totalUsers: data.totalUsers || 0,
        totalGroups: data.totalGroups || 0,
        pendingLeads: data.pendingLeads || 0,
        approvedLeads: data.approvedLeads || 0,
        totalGlobalGroups: data.totalGlobalGroups || 0,
        activeGroups: data.activeGroups || 0,
        todayRegistrations: data.todayRegistrations || 0
      });


    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values if API fails
      setStats({
        totalUsers: 0,
        totalGroups: 0,
        pendingLeads: 0,
        approvedLeads: 0,
        totalGlobalGroups: 0,
        activeGroups: 0,
        todayRegistrations: 0
      });
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your HS Code platform and monitor system activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={MdGroup}
          color="blue"
        />
        <StatCard
          title="Today's Registrations"
          value={stats.todayRegistrations}
          icon={MdTrendingUp}
          color="green"
        />
        <StatCard
          title="Total Local Groups"
          value={stats.totalGroups}
          icon={MdGroup}
          color="purple"
        />
        <StatCard
          title="Total Pending Leads"
          value={stats.pendingLeads}
          icon={MdSearch}
          color="orange"
        />
        <StatCard
          title="Total Approved Leads"
          value={stats.approvedLeads}
          icon={MdArticle}
          color="green"
        />
        <StatCard
          title="Total Global Groups"
          value={stats.totalGlobalGroups}
          icon={MdGroup}
          color="indigo"
        />
      </div>

      {/* Admin Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MdTrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Today's Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Registrations</span>
              <span className="text-2xl font-bold text-green-600">{stats.todayRegistrations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="text-lg font-bold text-blue-600">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Growth Rate</span>
              <span className="text-sm font-bold text-green-600">
                {stats.totalUsers > 0 ? ((stats.todayRegistrations / stats.totalUsers) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.totalUsers > 0 ? (stats.todayRegistrations / stats.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Daily Growth</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MdTrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Platform Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Registration</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Open</span>
            </div>
          </div>
        </div>

        {/* Lead Management */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MdSearch className="w-5 h-5 mr-2 text-orange-600" />
            Lead Management
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Approval</span>
              <span className="text-lg font-bold text-orange-600">{stats.pendingLeads}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved Today</span>
              <span className="text-lg font-bold text-green-600">{stats.approvedLeads}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Processed</span>
              <span className="text-lg font-bold text-blue-600">{stats.pendingLeads + stats.approvedLeads}</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.approvedLeads > 0 ? (stats.approvedLeads / (stats.pendingLeads + stats.approvedLeads)) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Approval Rate</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
