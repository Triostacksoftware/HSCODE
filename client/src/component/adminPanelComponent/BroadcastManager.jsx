"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiCheck, HiEye, HiArrowPath } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

const BroadcastManager = () => {
  const [broadcastLeads, setBroadcastLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);

  useEffect(() => {
    fetchBroadcastLeads();
  }, []);

  const fetchBroadcastLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/broadcast-requests`,
        { withCredentials: true }
      );
      setBroadcastLeads(response.data.leads || []);
    } catch (error) {
      console.error("Error fetching broadcast leads:", error);
      toast.error("Failed to load broadcast requests");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastAction = async (leadId, action) => {
    try {
      setProcessing(true);
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/broadcast/${leadId}`,
        { action },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(
          `Broadcast ${
            action === "approve" ? "approved" : "rejected"
          } successfully`
        );
        await fetchBroadcastLeads();
      }
    } catch (error) {
      console.error("Error updating broadcast status:", error);
      toast.error("Failed to update broadcast status");
    } finally {
      setProcessing(false);
    }
  };

  const viewLeadDetails = (lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const closeLeadDetails = () => {
    setShowLeadDetails(false);
    setSelectedLead(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Broadcast Management
        </h1>
        <p className="text-gray-600">
          Manage leads that have requested broadcast promotion
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiEye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {broadcastLeads.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <HiArrowPath className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  broadcastLeads.filter((lead) => lead.broadcast === "pending")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <HiCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  broadcastLeads.filter((lead) => lead.broadcast === "approved")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Broadcast Requests
            </h2>
            <button
              onClick={fetchBroadcastLeads}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <HiArrowPath className="w-4 h-4 inline mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {broadcastLeads.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📢</div>
            <p className="text-gray-500 text-lg">No broadcast requests found</p>
            <p className="text-gray-400">
              Leads that request broadcast will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {broadcastLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {lead.type === "buy"
                                ? "🛒"
                                : lead.type === "sell"
                                ? "💰"
                                : lead.type === "high-sea-buy"
                                ? "🚢🛒"
                                : lead.type === "high-sea-sell"
                                ? "🚢💰"
                                : "📝"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.hscode
                              ? `HS: ${lead.hscode}`
                              : "Text Message"}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {lead.description ||
                              lead.content ||
                              "No description"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {lead.type === "buy"
                              ? "Buying"
                              : lead.type === "sell"
                              ? "Selling"
                              : lead.type === "high-sea-buy"
                              ? "High Sea Buying"
                              : lead.type === "high-sea-sell"
                              ? "High Sea Selling"
                              : "General"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.userId?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.userId?.email || "No email"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.broadcastRequestedAt
                        ? formatDate(lead.broadcastRequestedAt)
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.broadcast === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : lead.broadcast === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {lead.broadcast === "pending"
                          ? "Pending"
                          : lead.broadcast === "approved"
                          ? "Approved"
                          : "None"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewLeadDetails(lead)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        {lead.broadcast === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleBroadcastAction(lead._id, "approve")
                              }
                              disabled={processing}
                              className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                              title="Approve Broadcast"
                            >
                              <HiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleBroadcastAction(lead._id, "reject")
                              }
                              disabled={processing}
                              className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                              title="Reject Broadcast"
                            >
                              <IoClose className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lead Details
                </h3>
                <button
                  onClick={closeLeadDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IoClose className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedLead.type || "General"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HS Code
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLead.hscode || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLead.description ||
                      selectedLead.content ||
                      "No description"}
                  </p>
                </div>
                {selectedLead.quantity && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.quantity}
                    </p>
                  </div>
                )}
                {selectedLead.packing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Packing
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.packing}
                    </p>
                  </div>
                )}
                {selectedLead.targetPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Price
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.targetPrice}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Negotiable
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedLead.negotiable ? "Yes" : "No"}
                  </p>
                </div>
                {selectedLead.buyerDeliveryLocation?.address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.buyerDeliveryLocation.address}
                    </p>
                  </div>
                )}
                {selectedLead.sellerPickupLocation?.address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Address
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.sellerPickupLocation.address}
                    </p>
                  </div>
                )}
                {selectedLead.specialRequest && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Request
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.specialRequest}
                    </p>
                  </div>
                )}
                {selectedLead.remarks && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedLead.remarks}
                    </p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broadcast Status
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedLead.broadcast}
                  </p>
                </div>
                {selectedLead.broadcastRequestedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requested At
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedLead.broadcastRequestedAt)}
                    </p>
                  </div>
                )}
                {selectedLead.broadcastApprovedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approved At
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedLead.broadcastApprovedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeLeadDetails}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastManager;
