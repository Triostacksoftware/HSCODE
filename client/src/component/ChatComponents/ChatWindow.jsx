"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useUserAuth } from "../../utilities/userAuthMiddleware";
import { OnlineUsersContext } from "../../app/userchat/page";
import toast from "react-hot-toast";
import socket from "../../utilities/socket";
import { LiaSearchSolid } from "react-icons/lia";
import { IoMdClose } from "react-icons/io";
import { FaRegPaperPlane, FaUserFriends } from "react-icons/fa";
import { MdOutlineGroup } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import UserInfoSidebar from "./UserInfoSidebar";
import MapPicker from "./MapPicker";
import LeadFormModal from "./LeadFormModal";

const ChatWindow = ({chapterNo, selectedGroupId, groupName, groupImage, onBack }) => {
  const { user } = useUserAuth();
  const { onlineCounts, onlineUsers, socket } = useContext(OnlineUsersContext);
  const [leads, setLeads] = useState([]);
  // Lead form state
  const [leadType, setLeadType] = useState("buy");
  const [hscode, setHscode] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [packing, setPacking] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [buyerDeliveryAddress, setBuyerDeliveryAddress] = useState("");
  const [buyerLat, setBuyerLat] = useState("");
  const [buyerLng, setBuyerLng] = useState("");
  const [sellerPickupAddress, setSellerPickupAddress] = useState("");
  const [sellerLat, setSellerLat] = useState("");
  const [sellerLng, setSellerLng] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [remarks, setRemarks] = useState("");
  const [documents, setDocuments] = useState([]);
  const [docPreviews, setDocPreviews] = useState([]);
  const [mapPicker, setMapPicker] = useState({ open: false, role: "buyer" });
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const useCurrentLocation = (type) => {
    if (!navigator?.geolocation) {
      toast.error("Geolocation not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (type === "buyer") {
          setBuyerLat(String(latitude));
          setBuyerLng(String(longitude));
        } else {
          setSellerLat(String(latitude));
          setSellerLng(String(longitude));
        }
      },
      () => toast.error("Unable to fetch current location")
    );
  };

  // Build previews for selected documents and cleanup object URLs
  useEffect(() => {
    const previews = (documents || []).map((file) => ({
      name: file.name,
      type: file.type,
      url: file.type?.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setDocPreviews((old) => {
      old?.forEach((p) => p.url && URL.revokeObjectURL(p.url));
      return previews;
    });
    return () => {
      previews.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    };
  }, [documents]);

  const appendDocuments = (fileList) => {
    const incoming = Array.from(fileList || []);
    setDocuments((prev) => {
      const dedupeMap = new Map(
        (prev || []).map((f) => [`${f.name}-${f.size}-${f.lastModified}`, f])
      );
      incoming.forEach((f) => {
        dedupeMap.set(`${f.name}-${f.size}-${f.lastModified}`, f);
      });
      return Array.from(dedupeMap.values());
    });
  };

  const removeDocumentAt = (indexToRemove) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const [searchActive, setSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [userInfoSidebar, setUserInfoSidebar] = useState({
    isOpen: false,
    userId: null,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedGroupId && user) {
      fetchLeads();
    }
  }, [selectedGroupId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [leads]);

  // Listen for new-approved-lead socket event
  useEffect(() => {
    if (!user || !selectedGroupId) return;
    const handler = (lead) => {
      if (
        lead.groupId === selectedGroupId ||
        (lead.groupId && lead.groupId._id === selectedGroupId)
      ) {
        setLeads((prev) => {
          if (prev.some((l) => l._id === lead._id)) return prev;
          return [...prev, lead];
        });
      }
    };
    socket.on("new-approved-lead", handler);
    return () => {
      socket.off("new-approved-lead", handler);
    };
  }, [user, selectedGroupId]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/leads/${selectedGroupId}`,
        { withCredentials: true }
      );
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!hscode.trim() || !description.trim()) {
      toast.error("Please enter HS code and description");
      return;
    }
    try {
      setSending(true);
      setError("");
      const form = new FormData();
      form.append("groupId", selectedGroupId);
      form.append("type", leadType);
      form.append("hscode", hscode.trim());
      form.append("description", description.trim());
      form.append("quantity", quantity);
      form.append("packing", packing);
      form.append("targetPrice", targetPrice);
      form.append("negotiable", negotiable);
      form.append("buyerDeliveryAddress", buyerDeliveryAddress);
      if (buyerLat && buyerLng) {
        form.append("buyerLat", buyerLat);
        form.append("buyerLng", buyerLng);
      }
      form.append("sellerPickupAddress", sellerPickupAddress);
      if (sellerLat && sellerLng) {
        form.append("sellerLat", sellerLat);
        form.append("sellerLng", sellerLng);
      }
      form.append("specialRequest", specialRequest);
      form.append("remarks", remarks);
      form.append("chapterNo", chapterNo);
      if (documents && documents.length > 0) {
        documents.forEach((file) => form.append("documents", file));
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/requested-leads`,
        form,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // reset
      setLeadType("buy");
      setHscode("");
      setDescription("");
      setQuantity("");
      setPacking("");
      setTargetPrice("");
      setNegotiable(false);
      setBuyerDeliveryAddress("");
      setBuyerLat("");
      setBuyerLng("");
      setSellerPickupAddress("");
      setSellerLat("");
      setSellerLng("");
      setSpecialRequest("");
      setRemarks("");
      setDocuments([]);
      toast.success("Your lead has been submitted for approval!");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send lead");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleUserAvatarClick = (userId) => {
    setUserInfoSidebar({
      isOpen: true,
      userId: userId,
    });
  };

  const closeUserInfoSidebar = () => {
    setUserInfoSidebar({
      isOpen: false,
      userId: null,
    });
  };

  // Filtered leads for search
  const filteredLeads = searchTerm.trim()
    ? leads.filter((lead) => {
        const text = (lead.description || lead.content || "").toLowerCase();
        return text.includes(searchTerm.toLowerCase());
      })
    : leads;

  // Always show messages oldest at top, newest at bottom
  const sortedLeads = [...filteredLeads].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Helper for date separator
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!selectedGroupId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Select a group to start chatting</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Back button for mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 -ml-2"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>
          )}

          {/* Group avatar and name */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white overflow-hidden flex-shrink-0">
            {groupImage ? (
              <img
                src={
                  groupImage.includes("https")
                    ? groupImage
                    : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${groupImage}`
                }
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{groupName?.charAt(0)?.toUpperCase() || "G"}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-base font-semibold text-gray-900 truncate">
              {groupName || "Group Chat"}
            </span>
            <div className="text-xs text-gray-600 truncate">
              {Array.isArray(onlineUsers[selectedGroupId]) && onlineUsers[selectedGroupId].length > 0
                ? onlineUsers[selectedGroupId]
                    .slice(0, 4)
                    .map((u) => u.name)
                    .join(", ") +
                  (onlineUsers[selectedGroupId].length > 4
                    ? ` +${onlineUsers[selectedGroupId].length - 4} more online`
                    : "")
                : "No one online"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Members button */}
          <button
            className="p-2 rounded hover:bg-gray-100 flex items-center gap-1"
            onClick={() => setShowMembers((v) => !v)}
            title="Show members"
            type="button"
          >
            <MdOutlineGroup className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-700 hidden sm:inline">
              Members
            </span>
          </button>
          {/* Search icon/button */}
          {searchActive ? (
            <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in chat..."
                className="bg-transparent outline-none text-sm px-1 min-w-0"
              />
              <button
                onClick={() => {
                  setSearchActive(false);
                  setSearchTerm("");
                }}
              >
                <IoMdClose className="w-5 h-5 text-gray-500 flex-shrink-0" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchActive(true)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <LiaSearchSolid className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {/* Members dropdown: show online first, then others if provided */}
          {showMembers && (
            <div className="absolute right-4 top-14 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[220px] max-h-80 overflow-y-auto">
              <div className="p-2 text-gray-700 border-b border-gray-100 text-sm">Members</div>
              <div className="py-1">
                {(onlineUsers[selectedGroupId] || []).map((m) => (
                  <div key={`on-${m.id}`} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-900 truncate">{m.name}</span>
                  </div>
                ))}
              </div>
              {/* If you maintain a full members list on client, append it here */}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-9 space-y-4 bg-[#faf7f4]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedLeads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">💬</div>
              <p className="text-gray-500">No approved messages yet</p>
              <p className="text-gray-400 text-sm">
                Your messages will appear here after approval
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-9">
            {/* Date separator logic */}
            {(() => {
              let lastDate = null;
              return sortedLeads.map((lead, idx) => {
                const isOwnMessage = lead.userId._id === user?._id;
                const msgDate = new Date(lead.createdAt);
                const dateLabel = formatDate(lead.createdAt);
                const showDate =
                  !lastDate ||
                  new Date(lastDate).toDateString() !== msgDate.toDateString();
                lastDate = lead.createdAt;
                return (
                  <React.Fragment key={lead._id}>
                    {showDate && (
                      <div className="flex justify-center my-2">
                        <span className="bg-[#e0ddd9] text-gray-600 text-xs px-3 py-1 rounded-md shadow-sm">
                          {dateLabel}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Only show avatar for others' messages on the left */}
                      {!isOwnMessage && (
                        <div className="order-1 mr-2">
                          <div
                            className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              handleUserAvatarClick(lead.userId._id)
                            }
                          >
                            {lead.userId?.image ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_BASE_URL}/upload/${lead.userId.image}`}
                                alt={lead.userId.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-600 font-medium">
                                {lead.userId?.name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] sm:max-w-xs lg:max-w-md ${
                          isOwnMessage ? "order-2" : "order-1"
                        }`}
                      >
                        <div
                          className={`rounded-xl px-3 md:px-4 py-2 shadow-sm border ${
                            lead.type === "buy"
                              ? "bg-blue-50 border-blue-100 text-gray-900"
                              : lead.type === "sell"
                              ? "bg-green-50 border-green-100 text-gray-900"
                              : "bg-white border-gray-200 text-gray-900"
                          }`}
                        >
                          {lead.hscode || lead.description ? (
                            <div className="text-sm space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                                  lead.type === "buy"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}>{(lead.type || "Lead").toUpperCase()}</span>
                                {lead.hscode && (
                                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">HS: {lead.hscode}</span>
                                )}
                              </div>
                              {lead.description && (
                                <div className="text-gray-800 font-medium leading-6">{lead.description}</div>
                              )}
                              <div className="flex flex-wrap gap-2 text-[11px] text-gray-700">
                                {lead.quantity && <div>Qty: {lead.quantity}</div>}
                                {lead.packing && <div>Packing: {lead.packing}</div>}
                                {(lead.targetPrice || lead.negotiable !== undefined) && (
                                  <div>Target: {lead.targetPrice || "-"} {lead.negotiable ? "(Negotiable)" : ""}</div>
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
                                {lead.remarks && (
                                  <div>Notes: {lead.remarks}</div>
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
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-blue-700 hover:bg-gray-200 text-[11px]"
                                    >
                                      <span>📄</span>
                                      <span className="truncate max-w-[140px]">{doc}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                          <p className="text-sm break-words">{lead.content}</p>
                          )}
                        </div>
                        <div
                          className={`text-xs text-gray-500 mt-1 ${
                            isOwnMessage ? "text-right" : "text-left"
                          }`}
                        >
                          {formatTime(lead.createdAt)}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {/* Action bar */}
      <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0 bg-white flex items-center justify-end">
        <button
          type="button"
          onClick={() => setLeadModalOpen(true)}
          className={`items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black/90 ${leadModalOpen? "hidden":"inline-flex"}`}
        >
          <FaRegPaperPlane className="w-4 h-4" /> Post Lead
        </button>
      </div>

      <LeadFormModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onSubmit={async (vals) => {
          // reuse existing submit logic with vals
          try {
            setSending(true);
            setError("");
            const form = new FormData();
            form.append("groupId", selectedGroupId);
            form.append("type", vals.leadType);
            form.append("hscode", vals.hscode.trim());
            form.append("description", vals.description.trim());
            form.append("quantity", vals.quantity);
            form.append("packing", vals.packing);
            form.append("targetPrice", vals.targetPrice);
            form.append("negotiable", vals.negotiable);
            form.append("buyerDeliveryAddress", vals.buyerDeliveryAddress);
            if (vals.buyerLat && vals.buyerLng) { form.append("buyerLat", vals.buyerLat); form.append("buyerLng", vals.buyerLng); }
            form.append("sellerPickupAddress", vals.sellerPickupAddress);
            if (vals.sellerLat && vals.sellerLng) { form.append("sellerLat", vals.sellerLat); form.append("sellerLng", vals.sellerLng); }
            form.append("specialRequest", vals.specialRequest);
            form.append("remarks", vals.remarks);
            form.append("chapterNo", chapterNo);
            (vals.documents || []).forEach((file) => form.append("documents", file));
            await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/requested-leads`, form, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
            setLeadModalOpen(false);
            toast.success("Your lead has been submitted for approval!");
          } catch (err) {
            console.error("Error sending lead:", err);
            setError("Failed to send lead");
          } finally {
            setSending(false);
          }
        }}
        sending={sending}
      />

      {/* User Info Sidebar */}
      <UserInfoSidebar
        userId={userInfoSidebar.userId}
        isOpen={userInfoSidebar.isOpen}
        onClose={closeUserInfoSidebar}
      />

      {/* Map Picker Modal */}
      <MapPicker
        isOpen={mapPicker.open}
        onClose={() => setMapPicker({ open: false, role: "buyer" })}
        onPick={({ lat, lng }) => {
          if (mapPicker.role === "buyer") {
            setBuyerLat(String(lat));
            setBuyerLng(String(lng));
          } else {
            setSellerLat(String(lat));
            setSellerLng(String(lng));
          }
        }}
        initial={mapPicker.role === "buyer" ? { lat: Number(buyerLat) || 20, lng: Number(buyerLng) || 78 } : { lat: Number(sellerLat) || 20, lng: Number(sellerLng) || 78 }}
      />
    </div>
  );
};

export default ChatWindow;
