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
      const response = await axios.get(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/global-leads/admin/pending?${params.toString()}`,
        { withCredentials: true }
      );
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
    const hay = (lead.description || lead.content || "").toLowerCase();
    const hs = (lead.hscode || "").toLowerCase();
    const name = (lead.userId?.name || "").toLowerCase();
    const email = (lead.userId?.email || "").toLowerCase();
    const q = searchTerm.toLowerCase();
    return (
      hay.includes(q) || hs.includes(q) || name.includes(q) || email.includes(q)
    );
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

      {/* Leads Card Grid */}
      <div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className="relative p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                style={{
                  borderLeft: `4px solid ${
                    lead.type === "buy"
                      ? "#3b82f6"
                      : lead.type === "sell"
                      ? "#22c55e"
                      : lead.type === "high-sea-buy"
                      ? "#6366f1"
                      : lead.type === "high-sea-sell"
                      ? "#a855f7"
                      : "#e5e7eb"
                  }`,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded ${
                        lead.type === "buy"
                          ? "bg-blue-100 text-blue-800"
                          : lead.type === "sell"
                          ? "bg-green-100 text-green-800"
                          : lead.type === "high-sea-buy"
                          ? "bg-indigo-100 text-indigo-800"
                          : lead.type === "high-sea-sell"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(lead.type || "lead").toUpperCase()}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      HS: {lead.hscode || "-"}
                    </span>
                    {lead.leadCode && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        ID: {lead.leadCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(lead.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="text-sm space-y-2">
                  {lead.description && (
                    <div className="text-gray-900 font-medium leading-6">
                      {lead.description}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-700">
                    {lead.quantity && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100">
                        Qty: {lead.quantity}
                      </span>
                    )}
                    {lead.packing && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100">
                        Packing: {lead.packing}
                      </span>
                    )}
                    {(lead.targetPrice || lead.negotiable !== undefined) && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100">
                        Target: {lead.targetPrice || "-"}{" "}
                        {lead.negotiable ? "(Negotiable)" : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    {lead.buyerDeliveryLocation?.address && (
                      <div>Delivery: {lead.buyerDeliveryLocation.address}</div>
                    )}
                    {lead.sellerPickupLocation?.address && (
                      <div>Pickup: {lead.sellerPickupLocation.address}</div>
                    )}
                    {lead.specialRequest && (
                      <div>Special request: {lead.specialRequest}</div>
                    )}
                    {lead.remarks && <div>Notes: {lead.remarks}</div>}
                  </div>
                  {Array.isArray(lead.documents) &&
                    lead.documents.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {lead.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={`${process.env.NEXT_PUBLIC_BASE_URL}/leadDocuments/${doc}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-[11px]"
                          >
                            <span>📄</span>
                            <span className="truncate max-w-[140px]">
                              {doc}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-xs text-gray-600">
                    <div>
                      <span className="font-medium">User:</span>{" "}
                      {lead.userId?.name} ({lead.userId?.email})
                    </div>
                    <div>
                      <span className="font-medium">Group:</span>{" "}
                      {lead.groupId?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveReject(lead._id, "approve")}
                      className="px-3 py-1 border border-gray-600 hover:text-white rounded-md hover:bg-gray-800 text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(lead)}
                      className="px-3 py-1 border border-gray-600 hover:text-white rounded-md hover:bg-gray-800 text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
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
                className="px-3 py-1 text-white rounded-md bg-gray-800 text-base"
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
