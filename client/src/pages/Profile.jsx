import React, { useEffect, useState, useRef } from "react";
import { 
  User, Mail, Phone, MapPin, Calendar, Camera, 
  Shield, Edit3, Save, X, Activity, Lock, LogOut 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import API from "../utils/api.js";
import PageShell from "../components/PageShell.jsx"; // Assuming consistent layout

// --- SUB-COMPONENTS ---

// Reusable Input Field
const ProfileInput = ({ label, icon: Icon, value, name, onChange, disabled, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold ml-1">
      {label}
    </label>
    <div className={`relative group ${disabled ? 'opacity-70' : ''}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full bg-black/40 border rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none transition-all
          ${disabled 
            ? "border-transparent cursor-not-allowed text-gray-400" 
            : "border-white/10 focus:border-[#d4af37] focus:bg-black/60"
          }`}
      />
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    avatar: "",
    bio: "",
    location: "",
    joinDate: new Date(),
  });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general | security | activity
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Passwords state for security tab
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  // --- DATA FETCHING ---
  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Attempt to fetch from multiple potential endpoints
      const endpoints = ["/users/me", "/customers/me", "/auth/me"];
      let userData = null;

      // Promise.any is better than sequential awaits for finding the first success
      try {
        const responses = await Promise.any(
            endpoints.map(ep => API.get(ep).then(res => res.data?.data || res.data))
        );
        userData = responses;
      } catch (err) {
        throw new Error("Could not retrieve profile data.");
      }

      if (userData) {
        setUser({
          ...userData,
          // Ensure fields exist even if API returns null
          phone: userData.phone || "",
          location: userData.location || "",
          bio: userData.bio || "No bio provided.",
          avatar: userData.avatar || "",
          joinDate: userData.createdAt || new Date(),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      // In a real app, you would append this file to FormData in handleSave
      toast.success("Image selected. Click Save to upload.");
    }
  };

  const handleSaveProfile = async () => {
    try {
        setLoading(true);
        // Simulate API Call
        await API.put("/users/me", user);
        
        // If there's an image to upload (logic would go here with FormData)
        // const formData = new FormData();
        // formData.append('avatar', fileInputRef.current.files[0]);
        // await API.post("/users/me/avatar", formData);

        toast.success("Profile updated successfully!");
        setIsEditing(false);
    } catch (error) {
        toast.error("Failed to update profile.");
    } finally {
        setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
        return toast.error("New passwords do not match.");
    }
    try {
        await API.put("/auth/update-password", {
            currentPassword: passwords.current,
            newPassword: passwords.new
        });
        toast.success("Password updated!");
        setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update password.");
    }
  };

  if (loading && !user.email) {
    return (
        <PageShell>
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
        </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#d4af37] selection:text-black">
      <PageShell>
        <div className="max-w-6xl mx-auto px-4 py-8">
            
            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Account Settings</h1>
                <p className="text-gray-400 mt-1">Manage your personal information and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT COLUMN: PROFILE CARD --- */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#d4af37]/20 to-transparent"></div>

                        <div className="relative flex flex-col items-center text-center mt-4">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-800 overflow-hidden shadow-2xl">
                                    <img 
                                        src={avatarPreview || user.avatar || "https://ui-avatars.com/api/?name=" + user.name + "&background=random"} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {isEditing && (
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute bottom-1 right-1 p-2 bg-[#d4af37] rounded-full text-black hover:bg-white transition-colors shadow-lg"
                                    >
                                        <Camera size={18} />
                                    </button>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>

                            <h2 className="text-xl font-bold text-white mt-4">{user.name}</h2>
                            <p className="text-[#d4af37] text-sm font-medium uppercase tracking-wide bg-[#d4af37]/10 px-3 py-1 rounded-full mt-2">
                                {user.role || "User"}
                            </p>
                            
                            <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
                                <Calendar size={14} />
                                <span>Member since {format(new Date(user.joinDate), "MMMM yyyy")}</span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-8 border-t border-white/5 pt-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">12</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Orders</div>
                            </div>
                            <div className="text-center border-l border-white/5">
                                <div className="text-2xl font-bold text-white">Active</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- RIGHT COLUMN: TABS & FORMS --- */}
                <div className="lg:col-span-2">
                    {/* Tabs Navigation */}
                    <div className="flex gap-4 border-b border-white/10 mb-6 overflow-x-auto pb-1">
                        {[
                            { id: "general", label: "General Info", icon: User },
                            { id: "security", label: "Security", icon: Shield },
                            { id: "activity", label: "Activity Log", icon: Activity },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                                    ${activeTab === tab.id 
                                        ? "border-[#d4af37] text-[#d4af37]" 
                                        : "border-transparent text-gray-400 hover:text-white hover:border-white/20"
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        
                        {/* 1. GENERAL TAB */}
                        {activeTab === "general" && (
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-gray-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Personal Information</h3>
                                    {!isEditing ? (
                                        <button 
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-all"
                                        >
                                            <Edit3 size={16} className="text-[#d4af37]" />
                                            <span>Edit Profile</span>
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setIsEditing(false)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button 
                                                onClick={handleSaveProfile}
                                                className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20"
                                            >
                                                <Save size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ProfileInput 
                                        label="Full Name" 
                                        icon={User} 
                                        name="name" 
                                        value={user.name} 
                                        onChange={handleInputChange} 
                                        disabled={!isEditing} 
                                    />
                                    <ProfileInput 
                                        label="Email Address" 
                                        icon={Mail} 
                                        name="email" 
                                        value={user.email} 
                                        onChange={handleInputChange} 
                                        disabled={true} // Usually emails are immutable or require verification
                                    />
                                    <ProfileInput 
                                        label="Phone Number" 
                                        icon={Phone} 
                                        name="phone" 
                                        value={user.phone} 
                                        onChange={handleInputChange} 
                                        disabled={!isEditing} 
                                    />
                                    <ProfileInput 
                                        label="Location" 
                                        icon={MapPin} 
                                        name="location" 
                                        value={user.location} 
                                        onChange={handleInputChange} 
                                        disabled={!isEditing} 
                                    />
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold ml-1">
                                            Bio
                                        </label>
                                        <textarea
                                            name="bio"
                                            rows={4}
                                            value={user.bio}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full bg-black/40 border rounded-xl p-4 text-sm text-white focus:outline-none transition-all resize-none
                                                ${!isEditing 
                                                    ? "border-transparent text-gray-400" 
                                                    : "border-white/10 focus:border-[#d4af37]"
                                                }`}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. SECURITY TAB */}
                        {activeTab === "security" && (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-gray-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
                            >
                                <h3 className="text-xl font-bold text-white mb-6">Change Password</h3>
                                <div className="space-y-6 max-w-md">
                                    <ProfileInput 
                                        label="Current Password" 
                                        icon={Lock} 
                                        type="password"
                                        name="current"
                                        value={passwords.current}
                                        onChange={handlePasswordChange}
                                        disabled={false}
                                    />
                                    <ProfileInput 
                                        label="New Password" 
                                        icon={Lock} 
                                        type="password"
                                        name="new"
                                        value={passwords.new}
                                        onChange={handlePasswordChange}
                                        disabled={false}
                                    />
                                    <ProfileInput 
                                        label="Confirm New Password" 
                                        icon={Lock} 
                                        type="password"
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handlePasswordChange}
                                        disabled={false}
                                    />
                                    <div className="pt-4">
                                        <button 
                                            onClick={handleUpdatePassword}
                                            className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-colors w-full md:w-auto"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-white/10">
                                    <h4 className="text-red-400 font-bold flex items-center gap-2">
                                        <LogOut size={18} /> Danger Zone
                                    </h4>
                                    <p className="text-gray-500 text-sm mt-2">
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <button className="mt-4 px-4 py-2 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm font-medium">
                                        Delete Account
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. ACTIVITY TAB */}
                        {activeTab === "activity" && (
                            <motion.div
                                key="activity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-gray-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md"
                            >
                                <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                                <div className="space-y-6">
                                    {[1, 2, 3].map((_, i) => (
                                        <div key={i} className="flex gap-4 items-start pb-6 border-b border-white/5 last:border-0 last:pb-0">
                                            <div className="mt-1 min-w-[32px] h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                                                <Activity size={16} />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm">Updated profile information</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {format(new Date(), "MMM d, yyyy")} at {format(new Date(), "h:mm a")}
                                                </p>
                                                <p className="text-gray-600 text-xs mt-2 font-mono">
                                                    IP: 192.168.1.{10 + i} • Colombo, LK
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      </PageShell>
    </div>
  );
}