"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Toggle = ({ checked, onChange, label, hint }) => (
  <label className="flex items-center justify-between w-full cursor-pointer select-none">
    <div className="text-sm text-gray-800">
      <div className="font-medium">{label}</div>
      {hint && <div className="text-xs text-gray-500">{hint}</div>}
    </div>
    <span
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full ${checked ? 'bg-gray-900' : 'bg-gray-300'}`}
      onClick={() => onChange(!checked)}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white translate-x-0.5 transition ${checked ? 'translate-x-4' : ''}`}></span>
    </span>
  </label>
);

const Row = ({ title, children }) => (
  <div className="border-b border-gray-200 py-4">
    {title && <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{title}</div>}
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className={`w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-gray-700 ${props.className||''}`} />
);

const Select = ({ children, ...rest }) => (
  <select {...rest} className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-gray-700">
    {children}
  </select>
);

const UserChatSettings = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // preferences
  const [notifyNewLead, setNotifyNewLead] = useState(true);
  const [notifyMention, setNotifyMention] = useState(true);
  const [sound, setSound] = useState("pop");
  const [muteAll, setMuteAll] = useState(false);
  const [autoJoin, setAutoJoin] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [profileAbout, setProfileAbout] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editName, setEditName] = useState(false);
  const [editAbout, setEditAbout] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Load current settings (if backend endpoints exist). Gracefully fallback to defaults
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`, { withCredentials: true });
        const u = res.data?.user || {};
        setProfileName(u.name || "");
        setProfileAbout(u.about || "");
        setPhone(u.phone || "");
        if (u.image) setImagePreview(u.image.includes('http') ? u.image : `${process.env.NEXT_PUBLIC_BASE_URL}/upload/${u.image}`);
        // custom prefs if stored on user document under preferences
        const p = u.preferences || {};
        setNotifyNewLead(p.notifyNewLead ?? true);
        setNotifyMention(p.notifyMention ?? true);
        setSound(p.sound ?? "pop");
        setMuteAll(p.muteAll ?? false);
        setAutoJoin(p.autoJoin ?? true);
      } catch (e) {
        // ignore
      } finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const form = new FormData();
      form.append('name', profileName);
      form.append('about', profileAbout);
      form.append('preferences', JSON.stringify({ notifyNewLead, notifyMention, sound, muteAll, autoJoin }));
      if (imageFile) form.append('image', imageFile);
      await axios.patch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/profile`, form, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } });
    } catch (e) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`, {}, { withCredentials: true });
      window.location.href = "/auth";
    } catch (_) {}
  };

  return (
    <div className="h-full overflow-auto p-0 text-gray-800 bg-[#FEFEFE]">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header like WhatsApp */}
        <div className="px-6 pt-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative group w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : null}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer">
                Change
                <input type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; setImageFile(f||null); if(f){ const url=URL.createObjectURL(f); setImagePreview(url);} }} />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              {!editName ? (
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold truncate">{profileName || 'Your name'}</div>
                  <button className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800" onClick={()=>setEditName(true)}>Edit</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input value={profileName} onChange={(e)=>setProfileName(e.target.value)} placeholder="Your name" />
                  <button className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800" onClick={()=>setEditName(false)}>Done</button>
                </div>
              )}
              <div className="mt-1 text-sm text-gray-600">
                {!editAbout ? (
                  <div className="flex items-center gap-2">
                    <span className="truncate">{profileAbout || 'Available'}</span>
                    <button className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800" onClick={()=>setEditAbout(true)}>Edit</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <Input value={profileAbout} onChange={(e)=>setProfileAbout(e.target.value)} placeholder="About" />
                    <button className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800" onClick={()=>setEditAbout(false)}>Done</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phone row */}
        <Row>
          <div className="px-5">
            <div className="text-xs text-gray-500 mb-1">Phone number</div>
            <div className="text-sm">{phone || '-'}</div>
          </div>
        </Row>

        {/* Notification preferences */}
        <Row title="Notifications">
          <div className="px-6 space-y-4">
            <Toggle checked={notifyNewLead} onChange={setNotifyNewLead} label="New approved lead" />
            <Toggle checked={notifyMention} onChange={setNotifyMention} label="Mentions" />
            <Toggle checked={muteAll} onChange={setMuteAll} label="Mute all" />
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Sound</div>
              <div className="w-40">
                <Select value={sound} onChange={(e)=>setSound(e.target.value)}>
                  <option value="pop">Pop</option>
                  <option value="ding">Ding</option>
                  <option value="silent">Silent</option>
                </Select>
              </div>
            </div>
          </div>
        </Row>

        {/* Behaviour */}
        <Row title="Behaviour">
          <div className="px-5">
            <Toggle checked={autoJoin} onChange={setAutoJoin} label="Auto-join suggested groups" />
          </div>
        </Row>

        {/* Actions */}
        <div className="px-6 py-6 flex items-center gap-3 border-t border-gray-200">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleLogout} className="ml-auto px-4 py-2 border border-gray-300 rounded text-gray-800">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default UserChatSettings;


