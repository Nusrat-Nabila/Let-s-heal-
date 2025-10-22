// UserProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import defaultProfilePic from "../assets/default-profile.png";

import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiEdit3,
  FiSave,
  FiX,
  FiCamera,
  FiTrash2,
  FiLoader,
  FiCheck,
  FiAlertCircle
} from "react-icons/fi";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const ImageWithFallback = ({ src, alt, fallback, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && fallback) {
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc || fallback}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

const UserProfile = () => {
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_age: "",
    customer_gender: "no choice",
    customer_image: null
  });

  const getCurrentUserId = () => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id;
      } catch (e) {
        console.error("Error parsing user_data:", e);
        return null;
      }
    }
    return null;
  };

  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    
    const imageUrl = customer?.customer_image;
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/media/") || imageUrl.startsWith("/image/")) {
      return `http://localhost:8000${imageUrl}`;
    }
    
    return `http://localhost:8000/media/image/${imageUrl}`;
  };

  const fetchCustomerProfile = async () => {
    try {
      setLoading(true);
      const customerId = getCurrentUserId();
      
      if (!customerId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const response = await api.get(`/api/view_customer_profile/${customerId}/`);
      
      setCustomer(response.data);
      setFormData({
        customer_name: response.data.customer_name || "",
        customer_email: response.data.customer_email || "",
        customer_phone: response.data.customer_phone || "",
        customer_age: response.data.customer_age || "",
        customer_gender: response.data.customer_gender || "no choice",
        customer_image: null
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, customer_image: file }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const customerId = getCurrentUserId();
      const formDataToSend = new FormData();
      
      formDataToSend.append("customer_name", formData.customer_name);
      formDataToSend.append("customer_email", formData.customer_email);
      formDataToSend.append("customer_phone", formData.customer_phone);
      formDataToSend.append("customer_age", formData.customer_age);
      formDataToSend.append("customer_gender", formData.customer_gender);
      
      if (formData.customer_image) {
        formDataToSend.append("customer_image", formData.customer_image);
      }

      const response = await api.put(
        `/api/update_customer_profile/${customerId}/`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setCustomer(response.data);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      setImagePreview(null);
      
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        user.customer_name = response.data.customer_name;
        user.customer_email = response.data.customer_email;
        localStorage.setItem("user_data", JSON.stringify(user));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      
      if (err.response?.data?.validation_errors) {
        const errors = err.response.data.validation_errors;
        const errorMessages = Object.values(errors).flat().join(", ");
        setError(errorMessages);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.details) {
        const errors = err.response.data.details;
        const errorMessages = Object.values(errors).flat().join(", ");
        setError(errorMessages);
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently lost.")) {
      return;
    }

    try {
      const customerId = getCurrentUserId();
      await api.delete(`/api/delete_customer/${customerId}/`);
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.response?.data?.error || "Failed to delete account");
    }
  };

  const handleCancelEdit = () => {
    if (customer) {
      setFormData({
        customer_name: customer.customer_name || "",
        customer_email: customer.customer_email || "",
        customer_phone: customer.customer_phone || "",
        customer_age: customer.customer_age || "",
        customer_gender: customer.customer_gender || "no choice",
        customer_image: null
      });
    }
    setIsEditing(false);
    setImagePreview(null);
    setError("");
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);



  return (
    <div id="user-profile">
      <Navbar />
      
      <div className="min-h-screen bg-purple-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3">
              <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-purple-500 rounded-lg flex items-start space-x-3">
              <FiCheck className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-purple-700">{success}</p>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card - Fixed Height */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-200 h-fit">
                {/* Gradient Header */}
                <div className="h-6 bg-white"></div>

                {/* Profile Content */}
                <div className="px-8 pb-8 text-center relative z-10">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-purple-800 rounded-full blur-lg opacity-30 -z-10"></div>
                    <ImageWithFallback
                      src={getProfileImageUrl()}
                      alt="Profile"
                      fallback={defaultProfilePic}
                      className="w-64 h-64 rounded-full border-4 border-white shadow-2xl object-cover"
                    />
                    {isEditing && (
                      <label className="absolute bottom-1 right-1 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-full p-3 cursor-pointer hover:shadow-lg transition-all shadow-md">
                        <FiCamera size={20} />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold text-purple-800 mb-2">
                    {customer?.customer_name || "Customer"}
                  </h2>
                  <p className="text-purple-700 text-sm mb-6 flex items-center justify-center space-x-1">
                    <FiMail size={14} />
                    <span>{customer?.customer_email || "No email"}</span>
                  </p>

                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 text-xs font-bold rounded-full border border-purple-300 mb-8">
                    ✓ ACTIVE MEMBER
                  </div>

                  {/* Buttons */}
                  <div className="space-y-3">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full flex items-center justify-center space-x-2 bg-purple-800 hover:bg-purple-700 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-bold hover:from-purple-700 hover:to-purple-800"
                        >
                          <FiEdit3 size={18} />
                          <span>Edit Profile</span>
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          className="w-full flex items-center justify-center space-x-2 bg-purple-200 text-purple-800 px-4 py-3 rounded-xl hover:bg-purple-50 transition-all font-bold border-2 border-purple-300 hover:border-purple-800"
                        >
                          <FiTrash2 size={16} />
                          <span>Delete Account</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="w-full flex items-center justify-center space-x-2 bg-purple-800  text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
                        >
                          {saving ? <FiLoader className="animate-spin" size={18} /> : <FiSave size={18} />}
                          <span>{saving ? "Saving..." : "Save Changes"}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="w-full flex items-center justify-center space-x-2 bg-purple-200 text-purple-700 px-4 py-3 rounded-xl hover:bg-purple-50 transition-all font-bold border-2 border-purple-800"
                        >
                          <FiX size={18} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-8 border-b-2 border-purple-200">
                  <h3 className="text-2xl font-bold text-purple-900">
                    {isEditing ? "Update Your Information" : "Profile Details"}
                  </h3>
                  <p className="text-purple-700 text-sm mt-2">
                    {isEditing ? "Make changes to your personal details" : "View and manage your account information"}
                  </p>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <div className="space-y-6">
                    {/* Section 1: Personal Information */}
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                          <FiUser className="text-purple-600" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-purple-900">Personal Information</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Full Name Card */}
                        <div className="p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-sm font-bold text-purple-900 mb-2">
                            Full Name *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="customer_name"
                              value={formData.customer_name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-sm"
                              placeholder="Enter your full name"
                              required
                            />
                          ) : (
                            <p className="text-purple-800 font-semibold text-sm">
                              {customer?.customer_name || "Not provided"}
                            </p>
                          )}
                        </div>

                        {/* Email Card */}
                        <div className="p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-sm font-bold text-purple-900 mb-2">
                            Email Address *
                          </label>
                          <div className="text-purple-800 font-semibold text-sm flex items-center space-x-2">
                            <FiMail className="text-purple-500" size={16} />
                            <span>{customer?.customer_email || "Not provided"}</span>
                          </div>
                          {isEditing && (
                            <p className="text-xs text-purple-600 mt-1">Email cannot be changed</p>
                          )}
                        </div>

                        {/* Age Card */}
                        <div className="p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-sm font-bold text-purple-900 mb-2">
                            Age
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              name="customer_age"
                              value={formData.customer_age}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-sm"
                              placeholder="Enter your age"
                              min="1"
                              max="120"
                            />
                          ) : (
                            <div className="text-purple-800 font-semibold text-sm flex items-center space-x-2">
                              <FiCalendar className="text-purple-500" size={16} />
                              <span>{customer?.customer_age || "Not provided"}</span>
                            </div>
                          )}
                        </div>

                        {/* Gender Card */}
                        <div className="p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-sm font-bold text-purple-900 mb-2">
                            Gender
                          </label>
                          {isEditing ? (
                            <select
                              name="customer_gender"
                              value={formData.customer_gender}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 font-semibold text-sm"
                            >
                              <option value="no choice">Prefer not to say</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <p className="text-purple-800 font-semibold text-sm capitalize">
                              {customer?.customer_gender
                                ? customer.customer_gender.replace("_", " ")
                                : "Not specified"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-purple-200"></div>

                    {/* Section 2: Contact Information */}
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                          <FiPhone className="text-purple-600" size={20} />
                        </div>
                        <h4 className="text-lg font-bold text-purple-900">Contact Information</h4>
                      </div>

                      {/* Phone Card */}
                      <div className="p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                        <label className="block text-sm font-bold text-purple-900 mb-2">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="customer_phone"
                            value={formData.customer_phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-sm"
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="text-purple-800 font-semibold text-sm flex items-center space-x-2">
                            <FiPhone className="text-purple-500" size={16} />
                            <span>{customer?.customer_phone || "Not provided"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;