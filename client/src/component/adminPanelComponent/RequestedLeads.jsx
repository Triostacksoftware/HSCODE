"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdCheck, MdClose, MdSearch, MdFilterList } from "react-icons/md";
// import { connectUserSocket } from "../../utilities/socket.js";

const RequestedLeads = () => {
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
    fetchPendingLeads();
    fetchGroups();
  }, [selectedGroup]);

  const fetchPendingLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (selectedGroup) {
        params.append("groupId", selectedGroup);
      }
      console.log("params", params.toString());
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/requested-leads/admin/pending?${params.toString()}`,
        { withCredentials: true }
      );
      setRequestedLeads(response.data.requestedLeads || []);
    } catch (error) {
      console.error("Error fetching pending leads:", error);
      setError("Failed to load pending leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/categories/allgroups`,
        { withCredentials: true }
      );

      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleApproveReject = async (leadId, action) => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/requested-leads/admin/${leadId}`,
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
      alert(`Lead ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing lead:`, error);
      setError(`Failed to ${action} lead`);
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700">Requested Leads</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve/reject user submitted leads
        </p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by content, user name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-64">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📝</div>
              <p className="text-gray-500">No pending leads found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || selectedGroup
                  ? "Try adjusting your filters"
                  : "All leads have been processed"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Pending
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-gray-800 mb-2">{lead.content}</p>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">User:</span>{" "}
                        {lead.userId?.name} ({lead.userId?.email})
                      </div>
                      <div>
                        <span className="font-medium">Group:</span>{" "}
                        {lead.groupId?.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      suppressHydrationWarning={true}
                      onClick={() => handleApproveReject(lead._id, "approve")}
                      disabled={loading}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center space-x-1"
                    >
                      <MdCheck size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      suppressHydrationWarning={true}
                      onClick={() => openRejectModal(lead)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center space-x-1"
                    >
                      <MdClose size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Lead</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this lead:
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent mb-4"
              rows="3"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedLead(null);
                  setComment("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveReject(selectedLead._id, "reject")}
                disabled={!comment.trim() || loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
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

export default RequestedLeads;
