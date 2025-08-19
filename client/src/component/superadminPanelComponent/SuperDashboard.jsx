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
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [countriesWithAdmins, setCountriesWithAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Group admins by country and calculate total leads per country
    const countryMap = new Map();
    
    admins.forEach(admin => {
      if (!countryMap.has(admin.countryCode)) {
        countryMap.set(admin.countryCode, {
          countryCode: admin.countryCode,
          admins: [],
          totalLeads: 0
        });
      }
      
      const country = countryMap.get(admin.countryCode);
      country.admins.push(admin);
      country.totalLeads += (admin.localLeadsCount || 0);
    });
    
    setCountriesWithAdmins(Array.from(countryMap.values()));
  }, [admins]);

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

  const handleCountryClick = (countryCode) => {
    setExpandedCountry(expandedCountry === countryCode ? null : countryCode);
  };

  const getFlagUrl = (countryCode) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  };

  // Filter countries based on search term
  const filteredCountries = countriesWithAdmins.filter(country =>
    country.countryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.admins.some(admin => admin.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {filteredCountries.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MdOutlineAdminPanelSettings className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                {searchTerm ? `No countries found for "${searchTerm}"` : 'No country admins found'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {searchTerm ? 'Try a different search term' : 'Add country admins to manage local content'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCountries.map((country) => (
                <div key={country.countryCode} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Country Card Header */}
                  <div 
                    onClick={() => handleCountryClick(country.countryCode)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Country Flag */}
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={getFlagUrl(country.countryCode)}
                            alt={`${country.countryCode} flag`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/64x48/cccccc/666666?text=${country.countryCode}`;
                            }}
                          />
                        </div>
                        
                        {/* Country Info */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {country.countryCode}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {country.admins.length} Admin{country.admins.length > 1 ? 's' : ''} • {country.totalLeads} Total Leads
                          </p>
                        </div>
                      </div>
                      
                      {/* Expand/Collapse Icon */}
                      <div className={`transform transition-transform duration-200 ${
                        expandedCountry === country.countryCode ? 'rotate-180' : ''
                      }`}>
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedCountry === country.countryCode && (
                    <div className="border-t border-gray-200 bg-gray-50 p-3">
                      {/* Country Total Leads */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-blue-900 text-sm">Total Leads Posted in {country.countryCode}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-900">{country.totalLeads}</p>
                          </div>
                        </div>
                      </div>

                      {/* Admin List */}
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-700 text-sm mb-2">Admins:</h5>
                        {country.admins.map((admin, index) => (
                          <div key={admin._id} className="bg-white rounded p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">{admin.name}</h4>
                                <p className="text-xs text-gray-600">{admin.email}</p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
