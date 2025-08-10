"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MdCheck, MdClose, MdSearch } from "react-icons/md";

const SuperLocalRequestedLeads = () => {
  const [countries, setCountries] = useState([]); // [{ countryCode, count }]
  const [countryFilter, setCountryFilter] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [requestedLeads, setRequestedLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchLeads(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/local-leads/countries`,
        { withCredentials: true }
      );
      const list = Array.isArray(res.data) ? res.data : [];
      console.log(res.data)
      setCountries(list);
      if (list.length > 0) {
        setSelectedCountry(list[0].countryCode);
      }
    } catch (err) {
      console.error("Error loading countries:", err);
    }
  };

  const fetchLeads = async (country) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/local-leads/pending?country=${country}`,
        { withCredentials: true }
      );
      setRequestedLeads(res.data?.requestedLeads || []);
    } catch (err) {
      console.error("Error loading local requested leads:", err);
      setError("Failed to load requested leads");
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    const q = countryFilter.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => (c.countryCode || "").toLowerCase().includes(q));
  }, [countries, countryFilter]);

  const handleApproveReject = async (leadId, action) => {
    try {
      setLoading(true);
      setError("");
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/superadmin/local-leads/${leadId}`,
        { action, comment: action === "reject" ? comment : null },
        { withCredentials: true }
      );
      setRequestedLeads((prev) => prev.filter((l) => l._id !== leadId));
      setShowCommentModal(false);
      setSelectedLead(null);
      setComment("");
    } catch (err) {
      console.error(`Error ${action} lead:`, err);
      setError(`Failed to ${action} lead`);
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (lead) => {
    setSelectedLead(lead);
    setShowCommentModal(true);
  };

  return (
    <div className="flex h-full">
      {/* Main content center */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Local Requested Leads</h2>
          <p className="text-gray-600 text-sm">Pending domestic leads for: <span className="font-semibold">{selectedCountry || "-"}</span></p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading leads...</p>
          </div>
        ) : requestedLeads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pending leads</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requestedLeads.map((lead) => (
              <div key={lead._id} className="relative p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all" style={{ borderLeft: `4px solid ${lead.type==='buy'?'#3b82f6': lead.type==='sell'?'#22c55e':'#e5e7eb'}` }}>
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded ${lead.type==='buy'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{(lead.type||'lead').toUpperCase()}</span>
                    {lead.hscode && (<span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">HS: {lead.hscode}</span>)}
                    {lead.leadCode && (<span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">ID: {lead.leadCode}</span>)}
                  </div>
                  <span className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleString()}</span>
                </div>

                {/* Body */}
                <div className="text-sm space-y-2">
                  {lead.description && (<div className="text-gray-900 font-medium leading-6">{lead.description}</div>)}
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-700">
                    {lead.quantity && <span className="px-2 py-0.5 rounded-full bg-gray-100">Qty: {lead.quantity}</span>}
                    {lead.packing && <span className="px-2 py-0.5 rounded-full bg-gray-100">Packing: {lead.packing}</span>}
                    {(lead.targetPrice || lead.negotiable !== undefined) && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100">Target: {lead.targetPrice || '-'} {lead.negotiable ? '(Negotiable)' : ''}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-700 space-y-1">
                    {lead.buyerDeliveryLocation?.address && (<div>Delivery: {lead.buyerDeliveryLocation.address}</div>)}
                    {lead.sellerPickupLocation?.address && (<div>Pickup: {lead.sellerPickupLocation.address}</div>)}
                  </div>
                  {Array.isArray(lead.documents) && lead.documents.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {lead.documents.map((doc, i) => (
                        <a key={i} href={`${process.env.NEXT_PUBLIC_BASE_URL}/leadDocuments/${doc}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-[11px]">
                          <span>📄</span>
                          <span className="truncate max-w-[140px]">{doc}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-xs text-gray-600">
                    <div><span className="font-medium">User:</span> {lead.userId?.name} ({lead.userId?.email})</div>
                    <div><span className="font-medium">Group:</span> {lead.groupId?.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleApproveReject(lead._id, 'approve')} className="px-3 py-1 border border-gray-600 hover:text-white rounded-md hover:bg-gray-800 text-xs">Approve</button>
                    <button onClick={() => openRejectModal(lead)} className="px-3 py-1 border border-gray-600 hover:text-white rounded-md hover:bg-gray-800 text-xs">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right sidebar country list */}
      <aside className="w-72 border-l bg-white p-4 hidden lg:block">
        <div className="mb-3 font-semibold">Countries</div>
        <div className="relative mb-3">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            placeholder="Search country code..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
          {filteredCountries.map((c) => (
            <button
              key={c.countryCode}
              onClick={() => setSelectedCountry(c.countryCode)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm ${selectedCountry===c.countryCode ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'}`}
            >
              <span className="font-semibold">{c.countryCode}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCountry===c.countryCode ? 'bg-white text-gray-900' : 'bg-gray-200 text-gray-700'}`}>{c.count}</span>
            </button>
          ))}
          {filteredCountries.length === 0 && (
            <div className="text-xs text-gray-500">No countries</div>
          )}
        </div>
      </aside>

      {/* Reject Modal */}
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
              <button onClick={() => { setShowCommentModal(false); setSelectedLead(null); setComment(""); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={() => handleApproveReject(selectedLead._id, 'reject')} className="px-3 py-1 text-white rounded-md bg-gray-800 text-base">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperLocalRequestedLeads;


