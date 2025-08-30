"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import axios from "axios";
import { toast } from "react-hot-toast";

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    planId: "premium",
    discountType: "free",
    discountValue: 100,
    usageLimit: "",
    validUntil: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/admin`,
        { withCredentials: true }
      );
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      planId: "premium",
      discountType: "free",
      discountValue: 100,
      usageLimit: "",
      validUntil: "",
    });
    setShowModal(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      planId: coupon.planId,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      usageLimit: coupon.usageLimit || "",
      validUntil: new Date(coupon.validUntil).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.validUntil) {
      toast.error("Valid until date is required");
      return;
    }

    try {
      setModalLoading(true);

      const submitData = {
        ...formData,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      };

      if (editingCoupon) {
        // Update existing coupon
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/${editingCoupon._id}`,
          submitData,
          { withCredentials: true }
        );
        toast.success("Coupon updated successfully");
      } else {
        // Create new coupon
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/coupons`,
          submitData,
          { withCredentials: true }
        );
        toast.success("Coupon created successfully");
      }

      setShowModal(false);
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message || "Failed to save coupon");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (
      !confirm(
        "Are you sure you want to delete this coupon? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/${couponId}`,
        { withCredentials: true }
      );
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/${coupon._id}`,
        { isActive: !coupon.isActive },
        { withCredentials: true }
      );
      toast.success(
        `Coupon ${!coupon.isActive ? "activated" : "deactivated"} successfully`
      );
      fetchCoupons();
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      toast.error("Failed to update coupon status");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Coupon code copied to clipboard!");
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (dateString) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Coupon Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage coupon codes for your users
          </p>
        </div>
        <button
          onClick={handleAddCoupon}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No coupons created yet</p>
          <button
            onClick={handleAddCoupon}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className={`bg-white border rounded-lg p-6 shadow-sm ${
                !coupon.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-bold text-gray-900 font-mono">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy coupon code"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>

                    {/* Status badges */}
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>

                      {isExpired(coupon.validUntil) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Expired
                        </span>
                      )}

                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {coupon.planId}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{coupon.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>
                      <strong>Discount:</strong>{" "}
                      {coupon.discountType === "free"
                        ? "Free Access"
                        : `${coupon.discountValue}%`}
                    </span>
                    <span>
                      <strong>Used:</strong> {coupon.usedCount}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </span>
                    <span>
                      <strong>Valid Until:</strong>{" "}
                      {formatDate(coupon.validUntil)}
                    </span>
                    <span>
                      <strong>Created:</strong> {formatDate(coupon.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditCoupon(coupon)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit coupon"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className={`p-2 transition-colors ${
                      coupon.isActive
                        ? "text-gray-400 hover:text-orange-600"
                        : "text-gray-400 hover:text-green-600"
                    }`}
                    title={
                      coupon.isActive ? "Deactivate coupon" : "Activate coupon"
                    }
                  >
                    <FaEye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteCoupon(coupon._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete coupon"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Enter coupon code (e.g., PREMIUM2024)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  disabled={!!editingCoupon}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter coupon description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan
                  </label>
                  <select
                    value={formData.planId}
                    onChange={(e) =>
                      setFormData({ ...formData, planId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="premium">Premium</option>
                    <option value="free">Free</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="free">Free Access</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>

              {formData.discountType === "percentage" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="Unlimited"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {modalLoading
                    ? "Saving..."
                    : editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;
