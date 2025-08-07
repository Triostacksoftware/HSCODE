"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdCheck, MdClose, MdSearch, MdFilterList } from "react-icons/md";

const GlobalRequestedLeads = () => {
  const [requestedLeads, setRequestedLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchPendingGlobalLeads();
    fetchGlobalGroups();
  }, [selectedGroup]);

  const fetchPendingGlobalLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (selectedGroup) {
        params.append("groupId", selectedGroup);
      }
      console.log("Global params", params.toString());
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/global-leads/admin/pending?${params.toString()}`,
        { withCredentials: true }
      );
      console.log("global leads", response.data.requestedLeads);
      setRequestedLeads(response.data.requestedLeads || []);
    } catch (error) {
      console.error("Error fetching pending global leads:", error);
      setError("Failed to load pending global leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalGroups = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-categories`,
        { withCredentials: true }
      );
      console.log("global gorups", response.data);
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching global groups:", error);
    }
  };

  const handleApproveReject = async (leadId, action) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/global-leads/admin/${leadId}`,
        {
          action,
          comment: action === "reject" ? comment : null,
        },
        { withCredentials: true }
      );
      setRequestedLeads((prevLeads) =>
        prevLeads.filter((lead) => lead._id !== leadId)
      );
      setShowCommentModal(false);
      setSelectedLead(null);
      setComment("");
      alert(`Global lead ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing global lead:`, error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        setError(`Failed to ${action} global lead`);
      }
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (lead) => {
    setSelectedLead(lead);
    setShowCommentModal(true);
  };

  const filteredLeads = requestedLeads.filter((lead) => {
    const matchesSearch =
      lead.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Global Requested Leads
        </h2>
        <p className="text-gray-600">
          Manage global leads from your country only
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-400" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Global Groups</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading global leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No global leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {lead.userId?.image ? (
                            <img
                              src={
                                lead.userId.image.includes("https")
                                  ? lead.userId.image
                                  : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${lead.userId.image}`
                              }
                              alt={lead.userId.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-sm text-gray-600 font-medium">
                              {lead.userId?.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.userId?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.userId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.groupId?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {lead.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleApproveReject(lead._id, "approve")
                          }
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Approve"
                        >
                          <MdCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openRejectModal(lead)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Reject"
                        >
                          <MdClose className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Lead</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="3"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedLead(null);
                  setComment("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveReject(selectedLead._id, "reject")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalRequestedLeads;
