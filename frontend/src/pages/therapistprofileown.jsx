// TherapistProfile.jsx
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
  FiAlertCircle,
  FiBriefcase,
  FiMapPin,
  FiAward,
  FiClock,
  FiFileText
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

const TherapistProfile = () => {
  const [therapist, setTherapist] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  
  const specializationOptions = [
    "Clinical Psychologist",
    "Counseling Psychologist", 
    "Psychiatrist",
    "Neuropsychologist",
    "Child Psychologist",
    "Forensic Psychologist",
    "Health Psychologist",
    "Sports Psychologist",
    "Rehabilitation Psychologist",
    "School Psychologist"
  ];

  const [formData, setFormData] = useState({
    therapist_name: "",
    therapist_email: "",
    therapist_phone: "",
    therapist_gender: "no choice",
    year_of_experience: "",
    therapist_specialization: "",
    therapist_qualification: "",
    therapist_status: "Available",
    therapist_Serve_for: "",
    therapist_image: null,
    therapist_licence: null
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
    
    const imageUrl = therapist?.therapist_image;
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/media/") || imageUrl.startsWith("/image/")) {
      return `http://localhost:8000${imageUrl}`;
    }
    
    return `http://localhost:8000/media/image/${imageUrl}`;
  };

  const getLicenceFileUrl = () => {
    const licenceUrl = therapist?.therapist_licence;
    if (!licenceUrl) return null;
    
    if (licenceUrl.startsWith("http")) return licenceUrl;
    if (licenceUrl.startsWith("/media/") || licenceUrl.startsWith("/uploads/")) {
      return `http://localhost:8000${licenceUrl}`;
    }
    
    return `http://localhost:8000/media/${licenceUrl}`;
  };

  // Function to get ALL hospital names and addresses from API data
  const getAllHospitals = () => {
    const hospitals = [];
    
    if (therapist?.hospital) {
      console.log("Hospital data found:", therapist.hospital);
      
      // If hospital is an array (multiple hospitals)
      if (Array.isArray(therapist.hospital)) {
        therapist.hospital.forEach((hospital, index) => {
          const hospitalData = {
            name: hospital.hospital_name || hospital.name || hospital.hospitalName || "Hospital",
            address: hospital.hospital_address || hospital.address || hospital.location || "Address not provided"
          };
          if (hospitalData.name) {
            hospitals.push(hospitalData);
          }
          console.log(`Hospital ${index + 1}:`, hospital);
        });
      }
      // If hospital is a single object
      else if (typeof therapist.hospital === 'object') {
        const hospitalData = {
          name: therapist.hospital.hospital_name || therapist.hospital.name || therapist.hospital.hospitalName || "Hospital",
          address: therapist.hospital.hospital_address || therapist.hospital.address || therapist.hospital.location || "Address not provided"
        };
        if (hospitalData.name) {
          hospitals.push(hospitalData);
        }
      }
    }
    
    // If no hospital data found, use fallback
    if (hospitals.length === 0) {
      hospitals.push({
        name: "General Hospital",
        address: "Address not provided"
      });
    }
    
    console.log("All hospitals:", hospitals);
    return hospitals;
  };

  const fetchTherapistProfile = async () => {
    try {
      setLoading(true);
      const therapistId = getCurrentUserId();
      
      if (!therapistId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const response = await api.get(`/api/view_therapist_profile/${therapistId}/`);
      
      setTherapist(response.data);
      setFormData({
        therapist_name: response.data.therapist_name || "",
        therapist_email: response.data.therapist_email || "",
        therapist_phone: response.data.therapist_phone || "",
        therapist_gender: response.data.therapist_gender || "no choice",
        year_of_experience: response.data.year_of_experience || "",
        therapist_specialization: response.data.therapist_specialization || "",
        therapist_qualification: response.data.therapist_qualification || "",
        therapist_status: response.data.therapist_status || "Available",
        therapist_Serve_for: response.data.therapist_Serve_for || "",
        therapist_image: null,
        therapist_licence: null
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapistProfile();
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
      setFormData(prev => ({ ...prev, therapist_image: file }));
    }
  };

  const handleLicenceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, therapist_licence: file }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const therapistId = getCurrentUserId();
      const formDataToSend = new FormData();
      
      formDataToSend.append("therapist_name", formData.therapist_name);
      formDataToSend.append("therapist_email", formData.therapist_email);
      formDataToSend.append("therapist_phone", formData.therapist_phone);
      formDataToSend.append("therapist_gender", formData.therapist_gender);
      formDataToSend.append("year_of_experience", formData.year_of_experience);
      formDataToSend.append("therapist_specialization", formData.therapist_specialization);
      formDataToSend.append("therapist_qualification", formData.therapist_qualification);
      formDataToSend.append("therapist_status", formData.therapist_status);
      formDataToSend.append("therapist_Serve_for", formData.therapist_Serve_for);
      
      if (formData.therapist_image) {
        formDataToSend.append("therapist_image", formData.therapist_image);
      }
      
      if (formData.therapist_licence) {
        formDataToSend.append("therapist_licence", formData.therapist_licence);
      }

      const response = await api.put(
        `/api/update_therapist_profile/${therapistId}/`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setTherapist(response.data);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      setImagePreview(null);
      
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        user.therapist_name = response.data.therapist_name;
        user.therapist_email = response.data.therapist_email;
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
      const therapistId = getCurrentUserId();
      await api.delete(`/api/delete_therapist/${therapistId}/`);
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.response?.data?.error || "Failed to delete account");
    }
  };

  const handleCancelEdit = () => {
    if (therapist) {
      setFormData({
        therapist_name: therapist.therapist_name || "",
        therapist_email: therapist.therapist_email || "",
        therapist_phone: therapist.therapist_phone || "",
        therapist_gender: therapist.therapist_gender || "no choice",
        year_of_experience: therapist.year_of_experience || "",
        therapist_specialization: therapist.therapist_specialization || "",
        therapist_qualification: therapist.therapist_qualification || "",
        therapist_status: therapist.therapist_status || "Available",
        therapist_Serve_for: therapist.therapist_Serve_for || "",
        therapist_image: null,
        therapist_licence: null
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-purple-200 flex items-center justify-center">
          <div className="text-center">
            <FiLoader className="animate-spin text-purple-600 mx-auto" size={32} />
            <p className="mt-4 text-purple-700">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Get hospitals data
  const hospitals = getAllHospitals();

  return (
    <div id="therapistprofileown">
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
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-200 h-auto">
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
                      className="w-68 h-68 rounded-full border-4 border-white shadow-2xl object-cover"
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
                    {therapist?.therapist_name || "Therapist"}
                  </h2>
                  <p className="text-purple-700 text-sm mb-2 flex items-center justify-center space-x-1">
                    <FiMail size={14} />
                    <span>{therapist?.therapist_email || "No email"}</span>
                  </p>
                  <p className="text-purple-600 text-sm mb-4 flex items-center justify-center space-x-1">
                    <FiBriefcase size={14} />
                    <span>{therapist?.therapist_specialization || "No specialization"}</span>
                  </p>


                  {/* Licence File Section */}
                  {therapist?.therapist_licence && (
                    <div className="mb-6 p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-center space-x-2 text-purple-700">
                        <FiFileText size={16} />
                        <span className="text-sm font-semibold">Licence Uploaded</span>
                      </div>
                      <a 
                        href={getLicenceFileUrl()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-purple-700 hover:text-purple-800 underline mt-1 inline-block"
                      >
                        View Licence PDF
                      </a>
                    </div>
                  )}

                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 text-xs font-bold rounded-full border border-purple-300 mb-8">
                    {therapist?.therapist_status === "Active" ? "✓ AVAILABLE" : "✗ UNAVAILABLE"}
                  </div>

                  {/* Buttons */}
                  <div className="space-y-4">
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
                          className="w-full flex items-center justify-center space-x-2 bg-purple-800 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
                        >
                          {saving ? <FiLoader className="animate-spin" size={18} /> : <FiSave size={18} />}
                          <span>{saving ? "Saving..." : "Save Changes"}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="w-full flex items-center justify-center space-x-2 bg-purple-200 text-purple-800 px-4 py-3 rounded-xl hover:bg-purple-50 transition-all font-bold border-2 border-purple-800"
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
                
                {/* Form Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Section 1: Personal Information */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                          <FiUser className="text-purple-600" size={16} />
                        </div>
                        <h4 className="text-base font-bold text-purple-900">Personal Information</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Full Name Card */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Full Name *
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="therapist_name"
                              value={formData.therapist_name}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-xs"
                              placeholder="Enter your full name"
                              required
                            />
                          ) : (
                            <p className="text-purple-800 font-semibold text-xs">
                              {therapist?.therapist_name || "Not provided"}
                            </p>
                          )}
                        </div>

                        {/* Email Card */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Email Address *
                          </label>
                          <div className="text-purple-800 font-semibold text-xs flex items-center space-x-1">
                            <FiMail className="text-purple-500" size={12} />
                            <span>{therapist?.therapist_email || "Not provided"}</span>
                          </div>
                          {isEditing && (
                            <p className="text-xs text-purple-600 mt-0.5">Email cannot be changed</p>
                          )}
                        </div>

                        {/* Phone Card */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="therapist_phone"
                              value={formData.therapist_phone}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-xs"
                              placeholder="Enter your phone number"
                            />
                          ) : (
                            <div className="text-purple-800 font-semibold text-xs flex items-center space-x-1">
                              <FiPhone className="text-purple-500" size={12} />
                              <span>{therapist?.therapist_phone || "Not provided"}</span>
                            </div>
                          )}
                        </div>

                        {/* Gender Card */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Gender
                          </label>
                          {isEditing ? (
                            <select
                              name="therapist_gender"
                              value={formData.therapist_gender}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 font-semibold text-xs"
                            >
                              <option value="no choice">Prefer not to say</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <p className="text-purple-800 font-semibold text-xs capitalize">
                              {therapist?.therapist_gender
                                ? therapist.therapist_gender.replace("_", " ")
                                : "Not specified"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-purple-200"></div>

                    {/* Section 2: Professional Information */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                          <FiBriefcase className="text-purple-600" size={16} />
                        </div>
                        <h4 className="text-base font-bold text-purple-900">Professional Information</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Specialization Card - Now with Dropdown */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Specialization *
                          </label>
                          {isEditing ? (
                            <select
                              name="therapist_specialization"
                              value={formData.therapist_specialization}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 font-semibold text-xs"
                              required
                            >
                              <option value="">Select Specialization</option>
                              {specializationOptions.map((specialty) => (
                                <option key={specialty} value={specialty}>
                                  {specialty}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-purple-800 font-semibold text-xs">
                              {therapist?.therapist_specialization || "Not provided"}
                            </p>
                          )}
                        </div>

                        {/* Qualification Card */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Qualification
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="therapist_qualification"
                              value={formData.therapist_qualification}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-xs"
                              placeholder="Enter your qualifications"
                            />
                          ) : (
                            <p className="text-purple-800 font-semibold text-xs">
                              {therapist?.therapist_qualification || "Not provided"}
                            </p>
                          )}
                        </div>

                        {/* Experience Card */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Years of Experience
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              name="year_of_experience"
                              value={formData.year_of_experience}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-xs"
                              placeholder="Enter years of experience"
                              min="0"
                              max="50"
                            />
                          ) : (
                            <div className="text-purple-800 font-semibold text-xs flex items-center space-x-1">
                              <FiClock className="text-purple-500" size={12} />
                              <span>{therapist?.year_of_experience || "0"} years</span>
                            </div>
                          )}
                        </div>

                        {/* Status Card */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Status
                          </label>
                          {isEditing ? (
                            <select
                              name="therapist_status"
                              value={formData.therapist_status}
                              onChange={handleInputChange}
                              className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 font-semibold text-xs"
                            >
                              <option value="Available">Available</option>
                              <option value="Unavailable">Unavailable</option>
                              <option value="On Leave">On Leave</option>
                            </select>
                          ) : (
                            <p className="text-purple-800 font-semibold text-xs">
                              {therapist?.therapist_status || "Not specified"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-purple-200"></div>

                    {/* Section 3: Practice Information */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                          <FiMapPin className="text-purple-600" size={16} />
                        </div>
                        <h4 className="text-base font-bold text-purple-900">Practice Information</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {/* Areas of Focus Card */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Areas of Focus / Services
                          </label>
                          {isEditing ? (
                            <textarea
                              name="therapist_Serve_for"
                              value={formData.therapist_Serve_for}
                              onChange={handleInputChange}
                              rows="2"
                              className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-xs"
                              placeholder="Describe your areas of focus and services"
                            />
                          ) : (
                            <p className="text-purple-800 font-semibold text-xs">
                              {therapist?.therapist_Serve_for || "Not provided"}
                            </p>
                          )}
                        </div>

                        {/* Hospital Information - Display Only (from API) */}
                        <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                          <label className="block text-xs font-bold text-purple-900 mb-1">
                            Associated Hospital{hospitals.length > 1 ? 's' : ''}
                          </label>
                          <div className="space-y-2">
                            {hospitals.map((hospital, index) => (
                              <div key={index} className="border-l-4 border-purple-500 pl-3 py-1">
                                <div className="text-purple-800 font-semibold text-xs">
                                  {hospital.name}
                                </div>
                                <div className="text-purple-700 text-xs">
                                  {hospital.address}
                                </div>
                              </div>
                            ))}
                          </div>
                          {!isEditing && (
                            <p className="text-xs text-purple-700 mt-2">
                              Hospital information is managed through the association system
                            </p>
                          )}
                        </div>

                        {/* Licence Upload Section */}
                        {isEditing && (
                          <div className="p-3 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 transition-all">
                            <label className="block text-xs font-bold text-purple-900 mb-1">
                              Therapist Licence (PDF)
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleLicenceUpload}
                                className="w-full px-2 py-1.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all hover:border-purple-400 text-xs"
                              />
                              {therapist?.therapist_licence && (
                                <a 
                                  href={getLicenceFileUrl()} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-600 hover:text-purple-800 underline whitespace-nowrap"
                                >
                                  View Current
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-purple-600 mt-1">
                              Upload your professional licence document (PDF, DOC, DOCX)
                            </p>
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

export default TherapistProfile;