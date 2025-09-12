"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Toggle = ({ checked, onChange, label, hint }) => (
  <label className="flex items-center justify-between w-full cursor-pointer select-none">
    <div className="text-sm text-gray-800">
      <div className="font-medium">{label}</div>
      {hint && <div className="text-xs text-gray-500">{hint}</div>}
    </div>
    <span
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full ${
        checked ? "bg-gray-900" : "bg-gray-300"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white translate-x-0.5 transition ${
          checked ? "translate-x-4" : ""
        }`}
      ></span>
    </span>
  </label>
);

const Row = ({ title, children }) => (
  <div className="border-b border-gray-200 py-4">
    {title && (
      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        {title}
      </div>
    )}
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-gray-700 ${
      props.className || ""
    }`}
  />
);

const Select = ({ children, ...rest }) => (
  <select
    {...rest}
    className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-gray-700"
  >
    {children}
  </select>
);

const UserChatSettings = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper function to validate and format website URL
  const formatWebsiteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  // Helper function to validate website URL
  const validateWebsiteUrl = (url) => {
    if (!url) return true; // Empty is valid
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(url);
  };

  // preferences
  const [notifyNewLead, setNotifyNewLead] = useState(true);
  const [notifyMention, setNotifyMention] = useState(true);
  const [sound, setSound] = useState("pop");
  const [muteAll, setMuteAll] = useState(false);
  const [autoJoin, setAutoJoin] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [profileAbout, setProfileAbout] = useState("");
  const [profileCompanyWebsite, setProfileCompanyWebsite] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editName, setEditName] = useState(false);
  const [editAbout, setEditAbout] = useState(false);
  const [editCompanyWebsite, setEditCompanyWebsite] = useState(false);
  const [phone, setPhone] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [editEmail, setEditEmail] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState(false);
  const [editCountry, setEditCountry] = useState(false);

  useEffect(() => {
    // Load current settings (if backend endpoints exist). Gracefully fallback to defaults
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`,
          { withCredentials: true }
        );
        const u = res.data?.user || {};
        console.log("Fetched user data:", u); // Debug log
        setProfileName(u.name || "");
        setProfileAbout(u.about || "");
        setProfileCompanyWebsite(u.companyWebsite || "");
        setPhone(u.phone || "");
        setEmail(u.email || "");
        setAddress(u.address || "");
        setCompanyName(u.companyName || "");
        setCountry(u.country || "");
        if (u.image)
          setImagePreview(
            u.image.includes("http")
              ? u.image
              : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${u.image}`
          );
        // custom prefs if stored on user document under preferences
        const p = u.preferences || {};
        setNotifyNewLead(p.notifyNewLead ?? true);
        setNotifyMention(p.notifyMention ?? true);
        setSound(p.sound ?? "pop");
        setMuteAll(p.muteAll ?? false);
        setAutoJoin(p.autoJoin ?? true);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      // Validate website URL if provided
      if (profileCompanyWebsite && !validateWebsiteUrl(profileCompanyWebsite)) {
        setError("Please enter a valid company website URL");
        setSaving(false);
        return;
      }

      const form = new FormData();
      form.append("name", profileName);
      form.append("about", profileAbout);
      form.append("companyWebsite", formatWebsiteUrl(profileCompanyWebsite));
      form.append("email", email);
      form.append("phone", phone);
      form.append("address", address);
      form.append("companyName", companyName);
      form.append("country", country);
      if (imageFile) form.append("image", imageFile);

      console.log("Saving profile data:", {
        name: profileName,
        about: profileAbout,
        companyWebsite: formatWebsiteUrl(profileCompanyWebsite),
        email,
        phone,
        address,
        companyName,
        country,
      }); // Debug log
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/profile`,
        form,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Profile updated successfully!");
    } catch (e) {
      setError("Failed to save settings");
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("Logged out successfully!");
      window.location.href = "/auth";
    } catch (_) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="h-full overflow-auto p-0 text-gray-800 bg-[#FEFEFE]">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header like WhatsApp */}
        <div className="px-6 pt-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="w-full h-full object-cover"
                />
              ) : null}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer">
                Change
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setImageFile(f || null);
                    if (f) {
                      const url = URL.createObjectURL(f);
                      setImagePreview(url);
                    }
                  }}
                />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              {!editName ? (
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold truncate">
                    {profileName || "Your name"}
                  </div>
                  <button
                    className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800"
                    onClick={() => setEditName(true)}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                  />
                  <button
                    className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800"
                    onClick={() => setEditName(false)}
                  >
                    Done
                  </button>
                </div>
              )}
              <div className="mt-1 text-sm text-gray-600">
                {!editAbout ? (
                  <div className="flex items-center gap-2">
                    <span className="truncate">
                      {profileAbout || "Available"}
                    </span>
                    <button
                      className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800"
                      onClick={() => setEditAbout(true)}
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={profileAbout}
                      onChange={(e) => setProfileAbout(e.target.value)}
                      placeholder="About"
                    />
                    <button
                      className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800"
                      onClick={() => setEditAbout(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                <span className="truncate">
                  {profileCompanyWebsite || "No website"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Phone row */}
        <Row>
          <div className="px-5">
            <div className="text-xs text-gray-500 mb-1">Phone number</div>
            <div className="text-sm flex items-center gap-2">
              {!editPhone ? (
                <>
                  <div className="flex-1">
                    <span className="truncate">{phone || "-"}</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditPhone(true)}
                    title="Edit phone number"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditPhone(false)}
                    title="Done editing"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </Row>

        {/* Company Website row */}
        <Row>
          <div className="px-5">
            <div className="text-xs text-gray-500 mb-1">Company Website</div>
            <div className="text-sm flex items-center gap-2">
              {!editCompanyWebsite ? (
                <>
                  <div className="flex-1">
                    {profileCompanyWebsite ? (
                      <a
                        href={formatWebsiteUrl(profileCompanyWebsite)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {profileCompanyWebsite}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => {
                      setEditCompanyWebsite(true);
                      setWebsiteError("");
                    }}
                    title="Edit website"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <Input
                      value={profileCompanyWebsite}
                      onChange={(e) => {
                        setProfileCompanyWebsite(e.target.value);
                        if (websiteError) setWebsiteError("");
                      }}
                      placeholder="Company website (e.g., example.com)"
                    />
                    {websiteError && (
                      <div className="text-xs text-red-500 mt-1">
                        {websiteError}
                      </div>
                    )}
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => {
                      if (
                        profileCompanyWebsite &&
                        !validateWebsiteUrl(profileCompanyWebsite)
                      ) {
                        setWebsiteError("Please enter a valid website URL");
                        return;
                      }
                      setEditCompanyWebsite(false);
                      setWebsiteError("");
                    }}
                    title="Done editing"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </Row>

        {/* Email row */}
        <Row>
          <div className="px-5">
            <div className="text-xs text-gray-500 mb-1">Email</div>
            <div className="text-sm flex items-center gap-2">
              {!editEmail ? (
                <>
                  <div className="flex-1">
                    <span className="truncate">{email || "-"}</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditEmail(true)}
                    title="Edit email"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      type="email"
                    />
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditEmail(false)}
                    title="Done editing"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </Row>

        {/* Address row */}
        <Row>
          <div className="px-5">
            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className="text-sm flex items-center gap-2">
              {!editAddress ? (
                <>
                  <div className="flex-1">
                    <span className="truncate">{address || "-"}</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditAddress(true)}
                    title="Edit address"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your address"
                    />
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditAddress(false)}
                    title="Done editing"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </Row>

        {/* Company Name row */}
        <Row>
          <div className="px-5">
            <div className="text-xs text-gray-500 mb-1">Company Name</div>
            <div className="text-sm flex items-center gap-2">
              {!editCompanyName ? (
                <>
                  <div className="flex-1">
                    <span className="truncate">{companyName || "-"}</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditCompanyName(true)}
                    title="Edit company name"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditCompanyName(false)}
                    title="Done editing"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </Row>

        {/* Country row */}
        <Row>
          <div className="px-5">
            <div className="text-xs text-gray-500 mb-1">Country</div>
            <div className="text-sm flex items-center gap-2">
              {!editCountry ? (
                <>
                  <div className="flex-1">
                    <span className="truncate">{country || "-"}</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditCountry(true)}
                    title="Edit country"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <Input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    onClick={() => setEditCountry(false)}
                    title="Done editing"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </Row>

        {/* Actions */}
        <div className="px-6 py-6 border-t border-gray-200">
          {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleLogout}
              className="ml-auto px-4 py-2 border border-gray-300 rounded text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default UserChatSettings;
