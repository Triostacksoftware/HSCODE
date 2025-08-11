"use client";

import React, { useState, useEffect } from "react";
import { HiPencil, HiSave, HiX, HiRefresh, HiTrash } from "react-icons/hi";
import axios from "axios";

const HomeContent = () => {
  const [homeData, setHomeData] = useState();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        {
          withCredentials: true,
        }
      );

      setHomeData(response.data.data);
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin`,
        homeData,
        {
          withCredentials: true,
        }
      );

      setEditing(false);
      await fetchHomeData();
      alert("Home data saved successfully!");
    } catch (error) {
      console.error("Error saving home data:", error);
      alert("Error saving home data");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("This will save dummy data to your database. Continue?")) {
      try {
        setSaving(true);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/admin/reset`,
          {
            withCredentials: true,
          }
        );

        if (response.data.success) {
          await fetchHomeData();
          alert("Dummy data saved successfully!");
        } else {
          alert(response.data.message || "Failed to save dummy data");
        }
      } catch (error) {
        console.error("Error saving dummy data:", error);
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert("Error saving dummy data");
        }
      } finally {
        setSaving(false);
      }
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    setHomeData((prev) => {
      const newData = { ...prev };
      if (index !== null) {
        newData[section][field][index] = value;
      } else if (field.includes(".")) {
        const [parent, child] = field.split(".");
        newData[section][parent][child] = value;
      } else {
        newData[section][field] = value;
      }
      return newData;
    });
  };

  const handleArrayItemChange = (section, field, index, subField, value) => {
    setHomeData((prev) => {
      const newData = { ...prev };
      newData[section][field][index][subField] = value;
      return newData;
    });
  };

  const addArrayItem = (section, field, template) => {
    setHomeData((prev) => {
      const newData = { ...prev };
      const newId =
        Math.max(...newData[section][field].map((item) => item.id), 0) + 1;
      newData[section][field].push({ ...template, id: newId });
      return newData;
    });
  };

  const removeArrayItem = (section, field, index) => {
    setHomeData((prev) => {
      const newData = { ...prev };
      newData[section][field].splice(index, 1);
      return newData;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load home data</p>
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "Hero Section", icon: "🎬" },
    { id: "about", label: "About Section", icon: "ℹ️" },
    { id: "categories", label: "Featured Categories", icon: "📂" },
    { id: "news", label: "News Section", icon: "📰" },
    { id: "testimonials", label: "Testimonials", icon: "💬" },
    { id: "stats", label: "Statistics", icon: "📊" },
    { id: "faq", label: "FAQ Section", icon: "❓" },
    { id: "footer", label: "Footer", icon: "🔗" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Home Page Content Management
              </h1>
              <p className="text-gray-600 mt-2">
                Customize your country's home page content
              </p>
            </div>
            <div className="flex gap-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <HiPencil className="w-5 h-5" />
                  Edit Content
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <HiSave className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <HiX className="w-5 h-5" />
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <HiRefresh className="w-5 h-5" />
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "hero" && (
            <HeroSectionEditor
              data={homeData.heroSection}
              editing={editing}
              onChange={(field, value) =>
                handleInputChange("heroSection", field, value)
              }
            />
          )}

          {activeTab === "about" && (
            <AboutSectionEditor
              data={homeData.aboutSection}
              editing={editing}
              onChange={(field, value) =>
                handleInputChange("aboutSection", field, value)
              }
              onArrayChange={(field, index, subField, value) =>
                handleArrayItemChange(
                  "aboutSection",
                  field,
                  index,
                  subField,
                  value
                )
              }
              onAddItem={(field, template) =>
                addArrayItem("aboutSection", field, template)
              }
              onRemoveItem={(field, index) =>
                removeArrayItem("aboutSection", field, index)
              }
            />
          )}

          {activeTab === "categories" && (
            <CategoriesEditor
              data={homeData.featuredCategories}
              editing={editing}
              onChange={(field, value) =>
                handleInputChange("featuredCategories", field, value)
              }
              onArrayChange={(field, index, subField, value) =>
                handleArrayItemChange(
                  "featuredCategories",
                  field,
                  index,
                  subField,
                  value
                )
              }
              onAddItem={(field, template) =>
                addArrayItem("featuredCategories", field, template)
              }
              onRemoveItem={(field, index) =>
                removeArrayItem("featuredCategories", field, index)
              }
            />
          )}

          {activeTab === "news" && (
            <NewsEditor
              data={homeData.newsSection}
              editing={editing}
              onChange={(field, value) =>
                handleInputChange("newsSection", field, value)
              }
              onArrayChange={(field, index, subField, value) =>
                handleArrayItemChange(
                  "newsSection",
                  field,
                  index,
                  subField,
                  value
                )
              }
              onAddItem={(field, template) =>
                addArrayItem("newsSection", field, template)
              }
              onRemoveItem={(field, index) =>
                removeArrayItem("newsSection", field, index)
              }
            />
          )}

          {activeTab === "testimonials" && (
            <TestimonialsEditor
              data={homeData.testimonialSection}
              editing={editing}
              onChange={(field, value) =>
                handleInputChange("testimonialSection", field, value)
              }
              onArrayChange={(field, index, subField, value) =>
                handleArrayItemChange(
                  "testimonialSection",
                  field,
                  index,
                  subField,
                  value
                )
              }
              onAddItem={(field, template) =>
                addArrayItem("testimonialSection", field, template)
              }
              onRemoveItem={(field, index) =>
                removeArrayItem("testimonialSection", field, index)
              }
            />
          )}

          {activeTab === "stats" && (
            <StatsEditor
              data={homeData.stats}
              editing={editing}
              onChange={(field, value) =>
                handleInputChange("stats", field, value)
              }
              onArrayChange={(field, index, subField, value) =>
                handleArrayItemChange("stats", field, index, subField, value)
              }
              onAddItem={(field, template) =>
                addArrayItem("stats", field, template)
              }
              onRemoveItem={(field, index) =>
                removeArrayItem("stats", field, index)
              }
            />
          )}

          {activeTab === "faq" && (
            <FAQEditor
              data={homeData.faqSection}
              editing={editing}
              onChange={(field, value) =>
                handleInputChange("faqSection", field, value)
              }
              onArrayChange={(field, index, subField, value) =>
                handleArrayItemChange(
                  "faqSection",
                  field,
                  index,
                  subField,
                  value
                )
              }
              onAddItem={(field, template) =>
                addArrayItem("faqSection", field, template)
              }
              onRemoveItem={(field, index) =>
                removeArrayItem("faqSection", field, index)
              }
            />
          )}

          {activeTab === "footer" && (
            <FooterEditor
              data={homeData.footer}
              editing={editing}
              onChange={(field, value) =>
                handleInputChange("footer", field, value)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Editor Components
const HeroSectionEditor = ({ data, editing, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900">Hero Section</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Banner Text"
        value={data?.bannerText}
        onChange={(value) => onChange("bannerText", value)}
        editing={editing}
      />
      <InputField
        label="Banner CTA"
        value={data?.bannerCTA}
        onChange={(value) => onChange("bannerCTA", value)}
        editing={editing}
      />
      <InputField
        label="Main Heading"
        value={data?.mainHeading}
        onChange={(value) => onChange("mainHeading", value)}
        editing={editing}
      />
      <InputField
        label="Sub Heading"
        value={data?.subHeading}
        onChange={(value) => onChange("subHeading", value)}
        editing={editing}
      />
      <InputField
        label="Third Heading"
        value={data?.thirdHeading}
        onChange={(value) => onChange("thirdHeading", value)}
        editing={editing}
      />
      <InputField
        label="Description"
        value={data?.description}
        onChange={(value) => onChange("description", value)}
        editing={editing}
        multiline
      />
      <InputField
        label="YouTube Video ID (Desktop)"
        value={data?.youtubeVideoId}
        onChange={(value) => onChange("youtubeVideoId", value)}
        editing={editing}
      />
      <InputField
        label="YouTube Video ID (Mobile)"
        value={data?.mobileVideoId}
        onChange={(value) => onChange("mobileVideoId", value)}
        editing={editing}
      />
      <InputField
        label="CTA Button Text"
        value={data?.ctaButtonText}
        onChange={(value) => onChange("ctaButtonText", value)}
        editing={editing}
      />
      <InputField
        label="CTA Button Link"
        value={data?.ctaButtonLink}
        onChange={(value) => onChange("ctaButtonLink", value)}
        editing={editing}
      />
    </div>
  </div>
);

const AboutSectionEditor = ({
  data,
  editing,
  onChange,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900">About Section</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Title"
        value={data?.title}
        onChange={(value) => onChange("title", value)}
        editing={editing}
      />
      <InputField
        label="Subtitle"
        value={data?.subtitle}
        onChange={(value) => onChange("subtitle", value)}
        editing={editing}
      />
      <InputField
        label="Description"
        value={data?.description}
        onChange={(value) => onChange("description", value)}
        editing={editing}
        multiline
        fullWidth
      />
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Features</h4>
        {editing && (
          <button
            onClick={() =>
              onAddItem("features", { title: "", description: "", icon: "🌟" })
            }
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Feature
          </button>
        )}
      </div>
      {data?.features.map((feature, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Title"
              value={feature?.title}
              onChange={(value) =>
                onArrayChange("features", index, "title", value)
              }
              editing={editing}
            />
            <InputField
              label="Description"
              value={feature?.description}
              onChange={(value) =>
                onArrayChange("features", index, "description", value)
              }
              editing={editing}
            />
            <InputField
              label="Icon"
              value={feature?.icon}
              onChange={(value) =>
                onArrayChange("features", index, "icon", value)
              }
              editing={editing}
            />
          </div>
          {editing && (
            <button
              onClick={() => onRemoveItem("features", index)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Remove Feature
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

const CategoriesEditor = ({
  data,
  editing,
  onChange,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900">Featured Categories</h3>
    <InputField
      label="Section Title"
      value={data?.title}
      onChange={(value) => onChange("title", value)}
      editing={editing}
    />

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Categories</h4>
        {editing && (
          <button
            onClick={() =>
              onAddItem("categories", {
                id: Date.now(),
                name: "",
                image: "",
                description: "",
              })
            }
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Category
          </button>
        )}
      </div>
      {data?.categories.map((category, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Name"
              value={category?.name}
              onChange={(value) =>
                onArrayChange("categories", index, "name", value)
              }
              editing={editing}
            />
            <InputField
              label="Image URL"
              value={category?.image}
              onChange={(value) =>
                onArrayChange("categories", index, "image", value)
              }
              editing={editing}
            />
            <InputField
              label="Description"
              value={category?.description}
              onChange={(value) =>
                onArrayChange("categories", index, "description", value)
              }
              editing={editing}
              multiline
              fullWidth
            />
          </div>
          {editing && (
            <button
              onClick={() => onRemoveItem("categories", index)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Remove Category
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

const NewsEditor = ({
  data,
  editing,
  onChange,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900">News Section</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Section Title"
        value={data?.title}
        onChange={(value) => onChange("title", value)}
        editing={editing}
      />
      <InputField
        label="Section Subtitle"
        value={data?.subtitle}
        onChange={(value) => onChange("subtitle", value)}
        editing={editing}
      />
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">News Items</h4>
        {editing && (
          <button
            onClick={() =>
              onAddItem("news", {
                id: Date.now(),
                title: "",
                excerpt: "",
                image: "",
                date: "",
                category: "",
              })
            }
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add News
          </button>
        )}
      </div>
      {data?.news.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Title"
              value={item?.title}
              onChange={(value) => onArrayChange("news", index, "title", value)}
              editing={editing}
            />
            <InputField
              label="Excerpt"
              value={item?.excerpt}
              onChange={(value) =>
                onArrayChange("news", index, "excerpt", value)
              }
              editing={editing}
            />
            <InputField
              label="Image URL"
              value={item?.image}
              onChange={(value) => onArrayChange("news", index, "image", value)}
              editing={editing}
            />
            <InputField
              label="Date"
              value={item?.date}
              onChange={(value) => onArrayChange("news", index, "date", value)}
              editing={editing}
            />
            <InputField
              label="Category"
              value={item?.category}
              onChange={(value) =>
                onArrayChange("news", index, "category", value)
              }
              editing={editing}
            />
          </div>
          {editing && (
            <button
              onClick={() => onRemoveItem("news", index)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Remove News
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

const TestimonialsEditor = ({
  data,
  editing,
  onChange,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900">
      Testimonials Section
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Section Title"
        value={data?.title}
        onChange={(value) => onChange("title", value)}
        editing={editing}
      />
      <InputField
        label="Section Subtitle"
        value={data?.subtitle}
        onChange={(value) => onChange("subtitle", value)}
        editing={editing}
      />
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Testimonials</h4>
        {editing && (
          <button
            onClick={() =>
              onAddItem("testimonials", {
                id: Date.now(),
                name: "",
                company: "",
                role: "",
                content: "",
                image: "",
                rating: 5,
              })
            }
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Testimonial
          </button>
        )}
      </div>
      {data?.testimonials.map((testimonial, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Name"
              value={testimonial?.name}
              onChange={(value) =>
                onArrayChange("testimonials", index, "name", value)
              }
              editing={editing}
            />
            <InputField
              label="Company"
              value={testimonial?.company}
              onChange={(value) =>
                onArrayChange("testimonials", index, "company", value)
              }
              editing={editing}
            />
            <InputField
              label="Role"
              value={testimonial?.role}
              onChange={(value) =>
                onArrayChange("testimonials", index, "role", value)
              }
              editing={editing}
            />
            <InputField
              label="Content"
              value={testimonial?.content}
              onChange={(value) =>
                onArrayChange("testimonials", index, "content", value)
              }
              editing={editing}
              multiline
            />
            <InputField
              label="Image URL"
              value={testimonial?.image}
              onChange={(value) =>
                onArrayChange("testimonials", index, "image", value)
              }
              editing={editing}
            />
            <InputField
              label="Rating (1-5)"
              value={testimonial?.rating}
              onChange={(value) =>
                onArrayChange(
                  "testimonials",
                  index,
                  "rating",
                  parseInt(value) || 5
                )
              }
              editing={editing}
              type="number"
              min="1"
              max="5"
            />
          </div>
          {editing && (
            <button
              onClick={() => onRemoveItem("testimonials", index)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Remove Testimonial
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

const StatsEditor = ({
  data,
  editing,
  onChange,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900">Statistics Section</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Section Title"
        value={data?.title}
        onChange={(value) => onChange("title", value)}
        editing={editing}
      />
      <InputField
        label="Section Subtitle"
        value={data?.subtitle}
        onChange={(value) => onChange("subtitle", value)}
        editing={editing}
      />
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Statistics</h4>
        {editing && (
          <button
            onClick={() =>
              onAddItem("stats", {
                id: Date.now(),
                number: 0,
                label: "",
                suffix: "",
              })
            }
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add Statistic
          </button>
        )}
      </div>
      {data?.stats.map((stat, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Number"
              value={stat?.number}
              onChange={(value) =>
                onArrayChange("stats", index, "number", parseInt(value) || 0)
              }
              editing={editing}
              type="number"
            />
            <InputField
              label="Label"
              value={stat?.label}
              onChange={(value) =>
                onArrayChange("stats", index, "label", value)
              }
              editing={editing}
            />
            <InputField
              label="Suffix"
              value={stat?.suffix}
              onChange={(value) =>
                onArrayChange("stats", index, "suffix", value)
              }
              editing={editing}
            />
          </div>
          {editing && (
            <button
              onClick={() => onRemoveItem("stats", index)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Remove Statistic
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

const FAQEditor = ({
  data,
  editing,
  onChange,
  onArrayChange,
  onAddItem,
  onRemoveItem,
}) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900">FAQ Section</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField
        label="Section Title"
        value={data?.title}
        onChange={(value) => onChange("title", value)}
        editing={editing}
      />
      <InputField
        label="Section Subtitle"
        value={data?.subtitle}
        onChange={(value) => onChange("subtitle", value)}
        editing={editing}
      />
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">FAQ Items</h4>
        {editing && (
          <button
            onClick={() =>
              onAddItem("faqs", { id: Date.now(), question: "", answer: "" })
            }
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Add FAQ
          </button>
        )}
      </div>
      {data?.faqs.map((faq, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="space-y-4">
            <InputField
              label="Question"
              value={faq?.question}
              onChange={(value) =>
                onArrayChange("faqs", index, "question", value)
              }
              editing={editing}
            />
            <InputField
              label="Answer"
              value={faq?.answer}
              onChange={(value) =>
                onArrayChange("faqs", index, "answer", value)
              }
              editing={editing}
              multiline
              fullWidth
            />
          </div>
          {editing && (
            <button
              onClick={() => onRemoveItem("faqs", index)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Remove FAQ
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

const FooterEditor = ({ data, editing, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900">Footer Section</h3>
    <InputField
      label="Company Description"
      value={data?.companyDescription}
      onChange={(value) => onChange("companyDescription", value)}
      editing={editing}
      multiline
      fullWidth
    />

    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">Contact Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Email"
          value={data?.contactInfo.email}
          onChange={(value) => onChange("contactInfo.email", value)}
          editing={editing}
        />
        <InputField
          label="Phone"
          value={data?.contactInfo.phone}
          onChange={(value) => onChange("contactInfo.phone", value)}
          editing={editing}
        />
        <InputField
          label="Address"
          value={data?.contactInfo.address}
          onChange={(value) => onChange("contactInfo.address", value)}
          editing={editing}
        />
      </div>
    </div>

    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">Social Links</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Facebook"
          value={data?.socialLinks.facebook}
          onChange={(value) => onChange("socialLinks.facebook", value)}
          editing={editing}
        />
        <InputField
          label="Twitter"
          value={data?.socialLinks.twitter}
          onChange={(value) => onChange("socialLinks.twitter", value)}
          editing={editing}
        />
        <InputField
          label="LinkedIn"
          value={data?.socialLinks.linkedin}
          onChange={(value) => onChange("socialLinks.linkedin", value)}
          editing={editing}
        />
        <InputField
          label="Instagram"
          value={data?.socialLinks.instagram}
          onChange={(value) => onChange("socialLinks.instagram", value)}
          editing={editing}
        />
      </div>
    </div>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  editing,
  multiline = false,
  fullWidth = false,
  type = "text",
  ...props
}) => (
  <div className={fullWidth ? "col-span-full" : ""}>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {editing ? (
      multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          {...props}
        />
      )
    ) : (
      <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-900">
        {multiline ? value : value || "Not set"}
      </div>
    )}
  </div>
);

export default HomeContent;
