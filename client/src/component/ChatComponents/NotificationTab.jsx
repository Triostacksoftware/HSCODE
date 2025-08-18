import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiSettings,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const NotificationTab = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    inApp: true,
    local: true,
    global: true,
    individual: true,
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();
    fetchPreferences();
  }, [currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/user/all?page=${currentPage}&limit=20`,
        {
          withCredentials: true,
        }
      );
      console.log("respons all", response);
      const data = await response.data;
      setNotifications(data.data);
      setTotalPages(data.pagination.totalPages);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/user/count`,
        {
          withCredentials: true,
        }
      );
      console.log("response", response);
      const data = await response.data;
      setUnreadCount(data.data.unread);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/user/preferences`,
        {
          withCredentials: true,
        }
      );

      const data = await response.data;
      setPreferences(data.data);
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/user/read/${notificationId}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.notification._id === notificationId
              ? { ...notif, status: "read" }
              : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Marked as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/user/read-all`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, status: "read" }))
        );
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/user/${notificationId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.notification._id !== notificationId)
        );
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/user/preferences`,
        newPreferences,
        {
          withCredentials: true,
        }
      );

      const data = await response.data;
      setPreferences(data.data);
      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.normal;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      announcement: "📢",
      update: "🔄",
      reminder: "⏰",
      alert: "⚠️",
      news: "📰",
    };
    return icons[category] || "📢";
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FiBell className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FiCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
          >
            <FiSettings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Notification Preferences
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={preferences.email}
                  onChange={(e) =>
                    updatePreferences({
                      ...preferences,
                      email: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Email notifications
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={preferences.push}
                  onChange={(e) =>
                    updatePreferences({
                      ...preferences,
                      push: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Push notifications
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={preferences.inApp}
                  onChange={(e) =>
                    updatePreferences({
                      ...preferences,
                      inApp: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                In-app notifications
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={preferences.local}
                  onChange={(e) =>
                    updatePreferences({
                      ...preferences,
                      local: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Local notifications
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={preferences.global}
                  onChange={(e) =>
                    updatePreferences({
                      ...preferences,
                      global: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Global notifications
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={preferences.individual}
                  onChange={(e) =>
                    updatePreferences({
                      ...preferences,
                      individual: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Individual notifications
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <FiBell className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-gray-400">
              You'll see notifications here when they arrive
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((userNotif) => {
              const notification = userNotif.notification;
              const isUnread = userNotif.status !== "read";

              return (
                <div
                  key={userNotif._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    isUnread ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {getCategoryIcon(notification.category)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`text-sm font-medium ${
                                isUnread ? "text-gray-900" : "text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                                notification.priority
                              )}`}
                            >
                              {notification.priority}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            <span className="capitalize">
                              {notification.type}
                            </span>
                            {notification.category && (
                              <span className="capitalize">
                                {notification.category}
                              </span>
                            )}
                          </div>

                          {notification.actionUrl &&
                            notification.actionText && (
                              <div className="mt-3">
                                <a
                                  href={notification.actionUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {notification.actionText}
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {isUnread && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                              title="Mark as read"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-100"
                            title="Delete notification"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTab;
