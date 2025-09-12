"use client";
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaImage,
  FaCalendarAlt,
  FaTag,
  FaExternalLinkAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import axios from "axios";

const NewsManager = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    date: "",
    category: "",
    newsUrl: "",
    isPublished: true,
    featured: false,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // News categories
  const categories = [
    "Platform Updates",
    "Business Insights",
    "Industry News",
    "Success Stories",
    "Announcements",
    "Tips & Guides",
    "Market Trends",
    "Partnership News",
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        { withCredentials: true }
      );

      console.log("Fetch news response:", response.data);

      if (response.data.success && response.data.data.newsSection) {
        setNews(response.data.data.newsSection.news || []);
      } else {
        console.log("No news section found, setting empty array");
        setNews([]);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch news";
      console.error("Error details:", errorMessage);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.excerpt.trim()) newErrors.excerpt = "Excerpt is required";
    if (!formData.image.trim()) newErrors.image = "Image URL is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.category) newErrors.category = "Category is required";

    // Validate image URL
    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = "Please enter a valid image URL";
    }

    // Validate news URL if provided
    if (formData.newsUrl && !isValidUrl(formData.newsUrl)) {
      newErrors.newsUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image: "",
      date: "",
      category: "",
      newsUrl: "",
      isPublished: true,
      featured: false,
    });
    setErrors({});
    setEditingNews(null);
  };

  const handleAddNews = () => {
    resetForm();
    setShowForm(true);
    setEditingNews(null);
  };

  const handleEditNews = (newsItem) => {
    setFormData({
      title: newsItem.title || "",
      excerpt: newsItem.excerpt || "",
      content: newsItem.content || "",
      image: newsItem.image || "",
      date: newsItem.date || "",
      category: newsItem.category || "",
      newsUrl: newsItem.newsUrl || "",
      isPublished: newsItem.isPublished !== false,
      featured: newsItem.featured || false,
    });
    setEditingNews(newsItem);
    setShowForm(true);
  };

  const handleSaveNews = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Get current home data
      console.log("Fetching current home data...");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        { withCredentials: true }
      );

      console.log("Home data response:", response.data);

      if (!response.data.success) {
        throw new Error("Failed to fetch current data");
      }

      const currentData = response.data.data;
      const currentNews = currentData.newsSection?.news || [];

      let updatedNews;
      if (editingNews) {
        // Update existing news
        updatedNews = currentNews.map((item) =>
          item.id === editingNews.id
            ? { ...item, ...formData, id: editingNews.id }
            : item
        );
      } else {
        // Add new news
        const newId = Math.max(...currentNews.map((n) => n.id || 0), 0) + 1;
        updatedNews = [...currentNews, { ...formData, id: newId }];
      }

      // Update home data
      const updateData = {
        ...currentData,
        newsSection: {
          ...currentData.newsSection,
          news: updatedNews,
        },
      };

      console.log("Sending update data:", updateData);

      const updateResponse = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        updateData,
        { withCredentials: true }
      );

      console.log("Update response:", updateResponse.data);

      if (updateResponse.data.success) {
        setShowForm(false);
        resetForm();
        fetchNews();
        alert("News saved successfully!");
      } else {
        throw new Error(updateResponse.data.message || "Failed to save news");
      }
    } catch (error) {
      console.error("Error saving news:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save news. Please try again.";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;

    try {
      // Get current home data
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        { withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch current data");
      }

      const currentData = response.data.data;
      const updatedNews = (currentData.newsSection?.news || []).filter(
        (item) => item.id !== newsId
      );

      // Update home data
      const updateData = {
        ...currentData,
        newsSection: {
          ...currentData.newsSection,
          news: updatedNews,
        },
      };

      const updateResponse = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        updateData,
        { withCredentials: true }
      );

      if (updateResponse.data.success) {
        fetchNews();
        alert("News deleted successfully!");
      } else {
        throw new Error(updateResponse.data.message || "Failed to delete news");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete news. Please try again.";
      alert(errorMessage);
    }
  };

  const togglePublishStatus = async (newsId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        { withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch current data");
      }

      const currentData = response.data.data;
      const updatedNews = (currentData.newsSection?.news || []).map((item) =>
        item.id === newsId ? { ...item, isPublished: !item.isPublished } : item
      );

      const updateData = {
        ...currentData,
        newsSection: {
          ...currentData.newsSection,
          news: updatedNews,
        },
      };

      const updateResponse = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        updateData,
        { withCredentials: true }
      );

      if (updateResponse.data.success) {
        fetchNews();
      } else {
        throw new Error(
          updateResponse.data.message || "Failed to update news status"
        );
      }
    } catch (error) {
      console.error("Error updating news status:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update news status. Please try again.";
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">News Management</h2>
          <p className="text-gray-600">Manage news articles and updates</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setEditing(!editing)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors group relative ${
              editing
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={
              editing
                ? "Exit edit mode to view news articles"
                : "Enter edit mode to manage news articles"
            }
          >
            {editing ? "Exit Edit Mode" : "Edit Mode"}
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {editing ? "Exit Edit Mode" : "Enter Edit Mode"}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </button>
          <button
            onClick={handleAddNews}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 group relative"
            title="Add a new news article"
          >
            <FaPlus />
            Add News
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Create New Article
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg">
        <div className="">
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="text-center py-12">
                <FaImage className="mx-auto text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No News Articles
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first news article.
                </p>
                <button
                  onClick={handleAddNews}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First News Article
                </button>
              </div>
            ) : (
              news
                .slice()
                .sort((a, b) => {
                  // Sort by date (newest first), then by ID (newest first)
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  if (dateA.getTime() !== dateB.getTime()) {
                    return dateB.getTime() - dateA.getTime();
                  }
                  return b.id - a.id;
                })
                .map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`border rounded-lg p-4 ${
                      item.isPublished === false
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.title}
                          </h3>
                          {item.featured && (
                            <span
                              className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full group relative"
                              title="This news article is featured and will be highlighted"
                            >
                              Featured
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                Featured Article
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </span>
                          )}
                          {item.isPublished === false && (
                            <span
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full group relative"
                              title="This news article is in draft mode and not visible to public"
                            >
                              Draft
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                Draft Mode
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {item.excerpt}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <FaTag className="w-3 h-3" />
                            {item.category}
                          </div>
                          {item.newsUrl && (
                            <a
                              href={item.newsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <FaExternalLinkAlt className="w-3 h-3" />
                              View Article
                            </a>
                          )}
                        </div>
                      </div>

                      {editing && (
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => togglePublishStatus(item.id)}
                            className={`p-2 rounded-lg transition-colors group relative ${
                              item.isPublished === false
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                            title={
                              item.isPublished === false
                                ? "Publish this news article"
                                : "Unpublish this news article"
                            }
                          >
                            {item.isPublished === false ? (
                              <FaEye />
                            ) : (
                              <FaEyeSlash />
                            )}
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              {item.isPublished === false
                                ? "Publish"
                                : "Unpublish"}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleEditNews(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                            title="Edit this news article"
                          >
                            <FaEdit />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              Edit
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group relative"
                            title="Delete this news article"
                          >
                            <FaTrash />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              Delete
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* News Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingNews ? "Edit News Article" : "Add New News Article"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveNews();
                }}
                className="space-y-4"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter news title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      handleInputChange("excerpt", e.target.value)
                    }
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.excerpt ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Brief description of the news"
                  />
                  {errors.excerpt && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.excerpt}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Content (Optional)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Full article content (optional)"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.image ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                  )}
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Date and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* News URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    External Article URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.newsUrl}
                    onChange={(e) =>
                      handleInputChange("newsUrl", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.newsUrl ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="https://example.com/full-article"
                  />
                  {errors.newsUrl && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.newsUrl}
                    </p>
                  )}
                </div>

                {/* Status Options */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        handleInputChange("isPublished", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Published</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        handleInputChange("featured", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaSave />
                    )}
                    {saving ? "Saving..." : "Save News"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManager;
