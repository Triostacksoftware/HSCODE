"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdOutlinePublic,
  MdOutlinePeople,
  MdOutlineCategory,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";

const SuperDashboard = () => {
  const [stats, setStats] = useState({
    totalGlobalLeads: 0,
    totalGlobalUsers: 0,
    totalGlobalCategories: 0,
    totalGlobalGroups: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch global statistics
      const statsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/dashboard-stats`,
        { withCredentials: true }
      );
      setStats(statsResponse.data);

      // Fetch admins
      const adminsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/admins`,
        { withCredentials: true }
      );
      setAdmins(adminsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          SuperAdmin Dashboard
        </h2>
        <p className="text-gray-600">Global overview and admin management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <MdOutlinePublic className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Global Leads
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalGlobalLeads}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <MdOutlinePeople className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Global Users
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalGlobalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <MdOutlineCategory className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Global Categories
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalGlobalCategories}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <MdOutlineAdminPanelSettings className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalAdmins}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Country Admins Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Country Admins
          </h3>
          <p className="text-sm text-gray-600">
            Manage country-specific administrators
          </p>
        </div>

        <div className="p-6">
          {admins.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MdOutlineAdminPanelSettings className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No country admins found</p>
              <p className="text-gray-400 text-xs mt-1">
                Add country admins to manage local content
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {admins.map((admin) => (
                <div
                  key={admin._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {admin.countryCode}
                      </span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {admin.name}
                      </p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                    </div>

                    <div className="text-xs text-gray-500">
                      <p>Country: {admin.countryCode}</p>
                      <p>Local Leads: {admin.localLeadsCount || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperDashboard;
