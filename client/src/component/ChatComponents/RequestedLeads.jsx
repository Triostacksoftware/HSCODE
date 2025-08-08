"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";

const RequestedLeads = () => {
  const { user } = useUserAuth();
  const [requestedLeads, setRequestedLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected
  const [requestState, setRequestState] = useState("local");

  useEffect(() => {
    fetchRequestedLeads();
  }, [activeTab, requestState]);

  const fetchRequestedLeads = async () => {
    try {
      setLoading(true);
      setError("");

      if (requestState == 'local'){
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/requested-leads/user?status=${activeTab}`,
          {
            withCredentials: true,
          }
        );
        setRequestedLeads(response.data.requestedLeads || []);
      }
      else if (requestState == 'global'){
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/global-leads/user/requested?status=${activeTab}`,
          {
            withCredentials: true,
          }
        );
        setRequestedLeads(response.data.requestedLeads || []);
      }

    } catch (error) {
      console.error("Error fetching requested leads:", error);
      setError("Failed to load requested leads");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            My Requested Leads
          </h3>
          <div className="flex outline outline-gray-500 rounded-md relative text-sm w-52">
            <button
              onClick={() => setRequestState("local")}
              className={`py-1 w-1/2 cursor-pointer z-10 ${
                requestState === "local" ? "text-white" : ""
              }`}
            >
              Local
            </button>
            <button
              onClick={() => setRequestState("global")}
              className={`py-1 w-1/2 cursor-pointer z-10 ${
                requestState === "global" ? "text-white" : ""
              }`}
            >
              Global
            </button>

            {/* Animated background span */}
            <span
              className={`absolute top-0 h-full w-1/2 bg-gray-800 rounded-md transition-all duration-300 ease-in-out ${
                requestState === "global" ? "left-1/2" : "left-0"
              }`}
            ></span>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {/* Tabs */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            suppressHydrationWarning={true}
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-gray-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending
          </button>
          <button
            suppressHydrationWarning={true}
            onClick={() => setActiveTab("approved")}
            className={`flex-1 py-2 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors ${
              activeTab === "approved"
                ? "bg-gray-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Approved
          </button>
          <button
            suppressHydrationWarning={true}
            onClick={() => setActiveTab("rejected")}
            className={`flex-1 py-2 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors ${
              activeTab === "rejected"
                ? "bg-gray-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : requestedLeads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">
                {activeTab === "pending"
                  ? "⏳"
                  : activeTab === "approved"
                  ? "✅"
                  : "❌"}
              </div>
              <p className="text-gray-500">
                {activeTab === "pending"
                  ? "No pending leads"
                  : activeTab === "approved"
                  ? "No approved leads"
                  : "No rejected leads"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {activeTab === "pending"
                  ? "Your submitted leads will appear here"
                  : activeTab === "approved"
                  ? "Your approved leads will appear here"
                  : "Your rejected leads will appear here"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requestedLeads.map((lead) => (
              <div
                key={lead._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                      lead.status
                    )}`}
                  >
                    {getStatusText(lead.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(lead.createdAt)}
                  </span>
                </div>

                {/* Structured lead view */}
                {lead.hscode || lead.description ? (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded ${lead.type==='buy'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{(lead.type||'lead').toUpperCase()}</span>
                      <span className="text-xs text-gray-600">HS: {lead.hscode || '-'}</span>
                    </div>
                    {lead.description && (
                      <div className="text-gray-800">{lead.description}</div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                      {lead.quantity && <div>Qty: {lead.quantity}</div>}
                      {lead.packing && <div>Packing: {lead.packing}</div>}
                      {(lead.targetPrice || lead.negotiable !== undefined) && (
                        <div>
                          Target: {lead.targetPrice || '-'} {lead.negotiable ? '(Negotiable)' : ''}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-700 space-y-1">
                      {lead.buyerDeliveryLocation?.address && (
                        <div>Delivery: {lead.buyerDeliveryLocation.address}</div>
                      )}
                      {lead.sellerPickupLocation?.address && (
                        <div>Pickup: {lead.sellerPickupLocation.address}</div>
                      )}
                    </div>
                    {Array.isArray(lead.documents) && lead.documents.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {lead.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={`${process.env.NEXT_PUBLIC_BASE_URL}/leadDocuments/${doc}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-700 underline break-all"
                          >
                            {doc}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Group: {lead.groupId?.name || 'Unknown Group'}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-800 mb-2">{lead.content}</p>
                    <div className="text-xs text-gray-500">Group: {lead.groupId?.name || 'Unknown Group'}</div>
                  </>
                )}

                    {lead.adminComment && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                        <span className="font-medium text-gray-700">
                          Admin Comment:
                        </span>
                        <p className="text-gray-600 mt-1">
                          {lead.adminComment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestedLeads;
