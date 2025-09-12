"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

const SubscriptionPlanManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    monthlyPrice: 0,
    yearlyDiscount: 0,
    maxGroups: 0,
    maxLeads: 0,
    features: [],
    icon: "🌟",
    popular: false,
    color: "blue",
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-plans`,
        { withCredentials: true }
      );
      setPlans(response.data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setFormData({
      id: `plan_${Date.now()}`,
      name: "",
      description: "",
      monthlyPrice: 0,
      yearlyDiscount: 0,
      maxGroups: 0,
      maxLeads: 0,
      features: ["Feature 1", "Feature 2"],
      icon: "🌟",
      popular: false,
      color: "blue",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyDiscount: plan.yearlyDiscount || 0,
      maxGroups: plan.maxGroups,
      maxLeads: plan.maxLeads,
      features: plan.features || [],
      icon: plan.icon,
      popular: plan.popular || false,
      color: plan.color || "blue",
      isActive: plan.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (formData.monthlyPrice < 0) {
      toast.error("Monthly price must be 0 or greater");
      return;
    }

    try {
      setModalLoading(true);

      const submitData = {
        ...formData,
        monthlyPrice: parseFloat(formData.monthlyPrice),
        yearlyDiscount: parseFloat(formData.yearlyDiscount),
        maxGroups: parseInt(formData.maxGroups),
        maxLeads: parseInt(formData.maxLeads),
      };

      if (editingPlan) {
        // Update existing plan
        await axios.put(
          `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-plans/${editingPlan._id}`,
          submitData,
          { withCredentials: true }
        );
        toast.success("Subscription plan updated successfully");
      } else {
        // Create new plan
        await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-plans`,
          submitData,
          { withCredentials: true }
        );
        toast.success("Subscription plan created successfully");
      }

      setShowModal(false);
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error(
        error.response?.data?.message || "Failed to save subscription plan"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (
      !confirm(
        "Are you sure you want to delete this subscription plan? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-plans/${planId}`,
        { withCredentials: true }
      );
      toast.success("Subscription plan deleted successfully");
      fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete subscription plan");
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/subscription-plans/${plan._id}`,
        { isActive: !plan.isActive },
        { withCredentials: true }
      );
      toast.success(
        `Plan ${!plan.isActive ? "activated" : "deactivated"} successfully`
      );
      fetchPlans();
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast.error("Failed to update plan status");
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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
            Subscription Plan Management
          </h2>
          <p className="text-gray-600 mt-1">
            Create and manage subscription plans for your platform
          </p>
        </div>
        <button
          onClick={handleAddPlan}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            No subscription plans created yet
          </p>
          <button
            onClick={handleAddPlan}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const yearlyPrice =
              plan.monthlyPrice * 12 * (1 - (plan.yearlyDiscount || 0) / 100);
            const monthlyEquivalent = yearlyPrice / 12;

            return (
              <div
                key={plan._id}
                className={`bg-white border rounded-lg p-6 shadow-sm ${
                  !plan.isActive ? "opacity-60" : ""
                } ${plan.popular ? "ring-2 ring-blue-500" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{plan.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      {plan.popular && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit plan"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(plan)}
                      className={`p-2 transition-colors ${
                        plan.isActive
                          ? "text-gray-400 hover:text-orange-600"
                          : "text-gray-400 hover:text-green-600"
                      }`}
                      title={
                        plan.isActive ? "Deactivate plan" : "Activate plan"
                      }
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete plan"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.monthlyPrice)}
                    <span className="text-sm font-normal text-gray-500">
                      /month
                    </span>
                  </div>
                  {plan.yearlyDiscount > 0 && (
                    <div className="text-sm text-green-600">
                      {formatPrice(monthlyEquivalent)}/month when billed yearly
                      <span className="ml-1">
                        (Save{" "}
                        {formatPrice(plan.monthlyPrice * 12 - yearlyPrice)})
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Plan Limits:</div>
                  <div className="text-sm text-gray-600">
                    • Max Groups: {plan.maxGroups || "Unlimited"}
                  </div>
                  <div className="text-sm text-gray-600">
                    • Max Leads: {plan.maxLeads || "Unlimited"}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Features:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      plan.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500">ID: {plan.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPlan
                  ? "Edit Subscription Plan"
                  : "Create New Subscription Plan"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan ID *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    placeholder="e.g., premium, basic, enterprise"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Premium Plan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this plan offers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yearly Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.yearlyDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearlyDiscount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="🌟"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Groups
                  </label>
                  <input
                    type="number"
                    value={formData.maxGroups}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxGroups: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Leads
                  </label>
                  <input
                    type="number"
                    value={formData.maxLeads}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxLeads: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaPlus className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                    <option value="indigo">Indigo</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) =>
                        setFormData({ ...formData, popular: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Popular Plan
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
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
                    : editingPlan
                    ? "Update Plan"
                    : "Create Plan"}
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

export default SubscriptionPlanManager;
