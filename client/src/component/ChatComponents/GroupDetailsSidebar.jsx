import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";

const GroupDetailsSidebar = ({
  isOpen,
  onClose,
  group,
  groupType = "local", // "local" or "global"
  onlineCount = 0, // Live member count
}) => {
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && group) {
      fetchGroupDetails();
    }
  }, [isOpen, group]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        groupType === "local"
          ? `/groups/${group._id}/details`
          : `/global-groups/${group._id}/details`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`,
        { withCredentials: true }
      );

      setGroupDetails(response.data.data);
    } catch (error) {
      console.error("Error fetching group details:", error);
      console.error("Error response:", error.response?.data);
      setError("Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Group Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoMdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchGroupDetails}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : groupDetails ? (
            <div className="space-y-6">
              {/* Group Header */}
              <div className="text-center border-b border-gray-200 pb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {groupDetails.image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/${groupDetails.image}`}
                      alt={groupDetails.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-gray-700">
                      {groupDetails.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {groupDetails.name}
                </h3>
                {groupDetails.heading && (
                  <p className="text-sm text-gray-600">
                    {groupDetails.heading}
                  </p>
                )}
              </div>

              {/* Statistics */}
              <div className="flex justify-between text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {groupDetails.memberCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">
                    Members ({onlineCount} online)
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {groupDetails.leadCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">Leads</div>
                </div>
              </div>

              {/* Group Information */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Chapter</span>
                  <span className="text-sm text-gray-900">
                    {groupDetails.chapterNumber}
                  </span>
                </div>
                {groupDetails.countryCode && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Country</span>
                    <span className="text-sm text-gray-900">
                      {groupDetails.countryCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Recent Members */}
              {groupDetails.recentMembers &&
                groupDetails.recentMembers.length > 0 && (
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Members
                    </h4>
                    <div className="space-y-1">
                      {groupDetails.recentMembers
                        .slice(0, 5)
                        .map((member, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {member.image ? (
                                <img
                                  src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/${member.image}`}
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">
                                  {member.name?.charAt(0)?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-900 truncate">
                                {member.name}
                              </div>
                            </div>
                            {member.role === "admin" && (
                              <span className="text-xs text-gray-500">
                                Admin
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                    {groupDetails.memberCount > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{groupDetails.memberCount - 5} more
                      </p>
                    )}
                  </div>
                )}

              {/* Recent Leads */}
              {groupDetails.recentLeads &&
                groupDetails.recentLeads.length > 0 && (
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Recent Leads
                    </h4>
                    <div className="space-y-0">
                      {groupDetails.recentLeads
                        .slice(0, 3)
                        .map((lead, index) => (
                          <div
                            key={index}
                            className="text-sm border-b border-gray-100 pb-2 last:border-b-0"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">
                                {lead.type?.toUpperCase() || "LEAD"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 truncate">
                              {lead.description ||
                                lead.content ||
                                "No description"}
                            </p>
                            {lead.hscode && (
                              <p className="text-xs text-gray-600">
                                HS: {lead.hscode}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No group details available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsSidebar;
