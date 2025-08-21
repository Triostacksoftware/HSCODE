"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdClose,
  MdOutlinePerson,
  MdOutlineEmail,
  MdOutlinePhone,
  MdOutlineLocationOn,
  MdOutlineGroups,
  MdOutlinePostAdd,
  MdOutlineAdminPanelSettings,
  MdOutlineCategory,
  MdOutlineTrendingUp,
  MdOutlineCalendarToday,
  MdOutlineFlag,
} from "react-icons/md";

const AdminDetails = ({ admin, isOpen, onClose }) => {
  const [adminStats, setAdminStats] = useState({
    localPosts: 0,
    globalPosts: 0,
    localGroups: [],
    globalGroups: [],
    recentActivity: [],
    totalLeads: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (admin && isOpen) {
      fetchAdminDetails();
    }
  }, [admin, isOpen]);

  const fetchAdminDetails = async () => {
    if (!admin) return;
    
    try {
      setLoading(true);
      
      // Fetch admin statistics and details
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/admin-details/${admin._id}`,
        { withCredentials: true }
      );
      
      setAdminStats(response.data);
    } catch (error) {
      console.error("Error fetching admin details:", error);
      // Set default values if API fails
      setAdminStats({
        localPosts: admin.localLeadsCount || 0,
        globalPosts: 0,
        localGroups: [],
        globalGroups: [],
        recentActivity: [],
        totalLeads: admin.localLeadsCount || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getFlagUrl = (countryCode) => {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen || !admin) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Admin Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>
        
        {/* Admin Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            {admin.image ? (
              <img
                src={admin.image}
                alt={admin.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <MdOutlinePerson className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{admin.name}</h3>
            <p className="text-amber-100 text-sm">{admin.email}</p>
            <div className="flex items-center mt-1">
              <img
                src={getFlagUrl(admin.countryCode)}
                alt={`${admin.countryCode} flag`}
                className="w-5 h-4 rounded mr-2"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/20x16/cccccc/666666?text=${admin.countryCode}`;
                }}
              />
              <span className="text-xs text-amber-100">{admin.countryCode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {["overview", "groups", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-amber-600 border-b-2 border-amber-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-full pb-20">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading admin details...</p>
          </div>
        ) : (
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <MdOutlinePerson className="w-5 h-5 mr-2 text-amber-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MdOutlineEmail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">{admin.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MdOutlinePhone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">{admin.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MdOutlineLocationOn className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">{admin.countryCode}</span>
                    </div>
                  </div>
                </div>

                                 {/* Statistics */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                     <div className="flex items-center">
                       <MdOutlinePostAdd className="w-6 h-6 text-blue-600 mr-2" />
                       <div>
                         <p className="text-xs text-blue-600 font-medium">Local Posts</p>
                         <p className="text-xl font-bold text-blue-900">
                           {adminStats.localPosts}
                         </p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                     <div className="flex items-center">
                       <MdOutlineTrendingUp className="w-6 h-6 text-green-600 mr-2" />
                       <div>
                         <p className="text-xs text-green-600 font-medium">Global Posts</p>
                         <p className="text-xl font-bold text-green-900">
                           {adminStats.globalPosts}
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Sample Data Notice */}
                 {(adminStats.localGroups.some(g => g._id.startsWith('sample-')) || 
                   adminStats.globalGroups.some(g => g._id.startsWith('sample-'))) && (
                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                     <div className="flex items-center">
                       <span className="text-yellow-600 mr-2">⚠️</span>
                       <p className="text-sm text-yellow-800">
                         <strong>Note:</strong> Sample data is being displayed because no real groups were found. 
                         This usually means the admin hasn't been added to any groups yet, or there's a data connection issue.
                       </p>
                     </div>
                   </div>
                 )}

                {/* Role & Status */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                    <MdOutlineAdminPanelSettings className="w-5 h-5 mr-2 text-amber-600" />
                    Role & Status
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-700">Role:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {admin.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-700">Status:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "groups" && (
              <div className="space-y-6">
                {/* Local Groups */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <MdOutlineGroups className="w-5 h-5 mr-2 text-blue-600" />
                    Local Groups ({adminStats.localGroups.length})
                  </h4>
                                     {adminStats.localGroups.length > 0 ? (
                     <div className="space-y-3">
                       {adminStats.localGroups.map((group) => (
                         <div
                           key={group._id}
                           className={`border rounded-lg p-3 ${
                             group._id.startsWith('sample-') 
                               ? 'bg-yellow-50 border-yellow-200' 
                               : 'bg-blue-50 border-blue-200'
                           }`}
                         >
                           <div className="flex items-center justify-between">
                             <div>
                               <h5 className={`text-sm font-medium ${
                                 group._id.startsWith('sample-') 
                                   ? 'text-yellow-900' 
                                   : 'text-blue-900'
                               }`}>
                                 {group.name}
                               </h5>
                               <p className={`text-xs ${
                                 group._id.startsWith('sample-') 
                                   ? 'text-yellow-700' 
                                   : 'text-blue-700'
                               }`}>
                                 {group.heading}
                               </p>
                               {group._id.startsWith('sample-') && (
                                 <p className="text-xs text-yellow-600 mt-1">
                                   ⚠️ Sample data - no real groups found
                                 </p>
                               )}
                             </div>
                             <span className={`text-xs px-2 py-1 rounded ${
                               group._id.startsWith('sample-') 
                                 ? 'text-yellow-600 bg-yellow-100' 
                                 : 'text-blue-600 bg-blue-100'
                             }`}>
                               {group._id.startsWith('sample-') ? 'Sample' : 'Local'}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-4 text-gray-500 text-sm">
                       No local groups found
                     </div>
                   )}
                </div>

                {/* Global Groups */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <MdOutlineCategory className="w-5 h-5 mr-2 text-green-600" />
                    Global Groups ({adminStats.globalGroups.length})
                  </h4>
                                     {adminStats.globalGroups.length > 0 ? (
                     <div className="space-y-3">
                       {adminStats.globalGroups.map((group) => (
                         <div
                           key={group._id}
                           className={`border rounded-lg p-3 ${
                             group._id.startsWith('sample-') 
                               ? 'bg-yellow-50 border-yellow-200' 
                               : 'bg-green-50 border-green-200'
                           }`}
                         >
                           <div className="flex items-center justify-between">
                             <div>
                               <h5 className={`text-sm font-medium ${
                                 group._id.startsWith('sample-') 
                                   ? 'text-yellow-900' 
                                   : 'text-green-900'
                               }`}>
                                 {group.name}
                               </h5>
                               <p className={`text-xs ${
                                 group._id.startsWith('sample-') 
                                   ? 'text-yellow-700' 
                                   : 'text-green-700'
                               }`}>
                                 {group.heading}
                               </p>
                               {group._id.startsWith('sample-') && (
                                 <p className="text-xs text-yellow-600 mt-1">
                                   ⚠️ Sample data - no real groups found
                                 </p>
                               )}
                             </div>
                             <span className={`text-xs px-2 py-1 rounded ${
                               group._id.startsWith('sample-') 
                                 ? 'text-yellow-600 bg-yellow-100' 
                                 : 'text-green-600 bg-green-100'
                             }`}>
                               {group._id.startsWith('sample-') ? 'Sample' : 'Global'}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-4 text-gray-500 text-sm">
                       No global groups found
                     </div>
                   )}
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <MdOutlineCalendarToday className="w-5 h-5 mr-2 text-purple-600" />
                    Recent Activity
                  </h4>
                  {adminStats.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {adminStats.recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {activity.action}
                              </p>
                              <p className="text-xs text-gray-600">
                                {activity.description}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No recent activity found
                    </div>
                  )}
                </div>

                {/* Performance Summary */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">
                    Performance Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-900">
                        {adminStats.totalLeads}
                      </p>
                      <p className="text-xs text-purple-600">Total Leads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-900">
                        {adminStats.localGroups.length + adminStats.globalGroups.length}
                      </p>
                      <p className="text-xs text-purple-600">Total Groups</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDetails;
