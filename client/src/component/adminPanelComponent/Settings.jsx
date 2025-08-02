import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdPerson,
  MdNotifications,
  MdSecurity,
  MdSettings,
  MdSave,
  MdEdit,
  MdVisibility,
  MdVisibilityOff,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdBusiness,
  MdDescription,
  MdCheck,
  MdClose,
} from "react-icons/md";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    bio: "",
    location: "",
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    systemUpdates: true,
    securityAlerts: true,
    weeklyReports: false,
  });

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    theme: "light",
    autoSave: true,
    showTutorials: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call when endpoint is ready
      // const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/settings`, {
      //   withCredentials: true,
      // });

      // For now, using dummy data
      setProfileData({
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        phone: "+1 (555) 123-4567",
        company: "HSCODE Inc.",
        position: "Administrator",
        bio: "System administrator with full access to all features.",
        location: "New York, NY",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurityData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGeneralChange = (field, value) => {
    setGeneralSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (section) => {
    try {
      setIsLoading(true);
      setSaveStatus("saving");

      // TODO: Replace with actual API call when endpoint is ready
      // const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/settings/${section}`, {
      //   data: section === "profile" ? profileData :
      //          section === "notifications" ? notificationSettings :
      //          section === "security" ? securityData :
      //          generalSettings,
      //   withCredentials: true,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: MdPerson },
    { id: "notifications", label: "Notifications", icon: MdNotifications },
    { id: "security", label: "Security", icon: MdSecurity },
    { id: "general", label: "General", icon: MdSettings },
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Profile Information
        </h3>
        <button
          onClick={() => handleSave("profile")}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading && saveStatus === "saving" ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <MdSave className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {saveStatus && (
        <div
          className={`p-3 rounded-lg flex items-center space-x-2 ${
            saveStatus === "saved"
              ? "bg-green-100 text-green-700"
              : saveStatus === "error"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {saveStatus === "saved" ? (
            <>
              <MdCheck className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </>
          ) : saveStatus === "error" ? (
            <>
              <MdClose className="w-4 h-4" />
              <span>Failed to save settings. Please try again.</span>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Saving settings...</span>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleProfileChange("firstName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleProfileChange("lastName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
            <MdEmail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
            <MdPhone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <div className="relative">
            <input
              type="text"
              value={profileData.company}
              onChange={(e) => handleProfileChange("company", e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company name"
            />
            <MdBusiness className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <input
            type="text"
            value={profileData.position}
            onChange={(e) => handleProfileChange("position", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter job position"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleProfileChange("location", e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter location"
            />
            <MdLocationOn className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <div className="relative">
            <textarea
              value={profileData.bio}
              onChange={(e) => handleProfileChange("bio", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
            <MdDescription className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Notification Preferences
        </h3>
        <button
          onClick={() => handleSave("notifications")}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading && saveStatus === "saving" ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <MdSave className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {saveStatus && (
        <div
          className={`p-3 rounded-lg flex items-center space-x-2 ${
            saveStatus === "saved"
              ? "bg-green-100 text-green-700"
              : saveStatus === "error"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {saveStatus === "saved" ? (
            <>
              <MdCheck className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </>
          ) : saveStatus === "error" ? (
            <>
              <MdClose className="w-4 h-4" />
              <span>Failed to save settings. Please try again.</span>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Saving settings...</span>
            </>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Email Notifications
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={() =>
                    handleNotificationChange("emailNotifications")
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Marketing Emails
                </p>
                <p className="text-xs text-gray-500">
                  Receive promotional content
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketingEmails}
                  onChange={() => handleNotificationChange("marketingEmails")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Weekly Reports
                </p>
                <p className="text-xs text-gray-500">
                  Receive weekly summary reports
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyReports}
                  onChange={() => handleNotificationChange("weeklyReports")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            System Notifications
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Push Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Receive browser push notifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.pushNotifications}
                  onChange={() => handleNotificationChange("pushNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  SMS Notifications
                </p>
                <p className="text-xs text-gray-500">
                  Receive notifications via SMS
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.smsNotifications}
                  onChange={() => handleNotificationChange("smsNotifications")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  System Updates
                </p>
                <p className="text-xs text-gray-500">
                  Get notified about system updates
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.systemUpdates}
                  onChange={() => handleNotificationChange("systemUpdates")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Security Alerts
                </p>
                <p className="text-xs text-gray-500">
                  Get notified about security events
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.securityAlerts}
                  onChange={() => handleNotificationChange("securityAlerts")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Security Settings
        </h3>
        <button
          onClick={() => handleSave("security")}
          disabled={isLoading || !securityData.newPassword}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading && saveStatus === "saving" ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Updating...</span>
            </>
          ) : (
            <>
              <MdSave className="w-4 h-4" />
              <span>Update Password</span>
            </>
          )}
        </button>
      </div>

      {saveStatus && (
        <div
          className={`p-3 rounded-lg flex items-center space-x-2 ${
            saveStatus === "saved"
              ? "bg-green-100 text-green-700"
              : saveStatus === "error"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {saveStatus === "saved" ? (
            <>
              <MdCheck className="w-4 h-4" />
              <span>Password updated successfully!</span>
            </>
          ) : saveStatus === "error" ? (
            <>
              <MdClose className="w-4 h-4" />
              <span>Failed to update password. Please try again.</span>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Updating password...</span>
            </>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Change Password
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={securityData.currentPassword}
                onChange={(e) =>
                  handleSecurityChange("currentPassword", e.target.value)
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <MdVisibilityOff className="w-4 h-4" />
                ) : (
                  <MdVisibility className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={securityData.newPassword}
                onChange={(e) =>
                  handleSecurityChange("newPassword", e.target.value)
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <MdVisibilityOff className="w-4 h-4" />
                ) : (
                  <MdVisibility className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={securityData.confirmPassword}
                onChange={(e) =>
                  handleSecurityChange("confirmPassword", e.target.value)
                }
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <MdVisibilityOff className="w-4 h-4" />
                ) : (
                  <MdVisibility className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {securityData.newPassword && securityData.confirmPassword && (
            <div
              className={`p-3 rounded-lg text-sm ${
                securityData.newPassword === securityData.confirmPassword
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {securityData.newPassword === securityData.confirmPassword
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Security Recommendations
        </h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Use a strong password
              </p>
              <p className="text-xs text-gray-500">
                Include uppercase, lowercase, numbers, and special characters
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Enable two-factor authentication
              </p>
              <p className="text-xs text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Regular password updates
              </p>
              <p className="text-xs text-gray-500">
                Change your password every 90 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeneralSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          General Preferences
        </h3>
        <button
          onClick={() => handleSave("general")}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading && saveStatus === "saving" ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <MdSave className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {saveStatus && (
        <div
          className={`p-3 rounded-lg flex items-center space-x-2 ${
            saveStatus === "saved"
              ? "bg-green-100 text-green-700"
              : saveStatus === "error"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {saveStatus === "saved" ? (
            <>
              <MdCheck className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </>
          ) : saveStatus === "error" ? (
            <>
              <MdClose className="w-4 h-4" />
              <span>Failed to save settings. Please try again.</span>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Saving settings...</span>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={generalSettings.language}
            onChange={(e) => handleGeneralChange("language", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={generalSettings.timezone}
            onChange={(e) => handleGeneralChange("timezone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
            <option value="GMT">GMT</option>
            <option value="CET">Central European Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={generalSettings.dateFormat}
            onChange={(e) => handleGeneralChange("dateFormat", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={generalSettings.theme}
            onChange={(e) => handleGeneralChange("theme", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Application Settings
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Auto Save</p>
              <p className="text-xs text-gray-500">
                Automatically save changes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={generalSettings.autoSave}
                onChange={() =>
                  handleGeneralChange("autoSave", !generalSettings.autoSave)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Show Tutorials
              </p>
              <p className="text-xs text-gray-500">
                Display helpful tutorials and tips
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={generalSettings.showTutorials}
                onChange={() =>
                  handleGeneralChange(
                    "showTutorials",
                    !generalSettings.showTutorials
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileSection();
      case "notifications":
        return renderNotificationsSection();
      case "security":
        return renderSecuritySection();
      case "general":
        return renderGeneralSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="flex montserrat h-screen flex-col lg:flex-row">
      {/* Left Section - Settings Navigation */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500">
            Manage your account preferences
          </p>
        </div>

        {/* Settings Navigation */}
        <div className="p-2">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Right Section - Settings Content */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="p-4 sm:p-6">
          {isLoading && !saveStatus ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading settings...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
