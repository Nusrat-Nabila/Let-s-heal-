import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

// API configuration - remove trailing slash
const API_BASE_URL = "http://localhost:8000";

const Signup = () => {
  const [role, setRole] = useState("customer"); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    // Common fields
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    gender: "",
    
    // Customer specific
    customer_age: "",
    
    // Therapist specific
    year_of_experience: "",
    specialization: "",
    qualification: "",
    hospital: [], // This will store hospital IDs
    licence_pdf: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Specialization options
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

  // Load hospitals on component mount
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        console.log("Loading hospitals...");
        const response = await axios.get(`${API_BASE_URL}/api/view_hospital_list/`);
        console.log("Hospitals loaded:", response.data);
        setHospitals(response.data);
      } catch (error) {
        console.error("Failed to load hospitals:", error);
        setErrors({ submit: "Failed to load hospitals list" });
      }
    };
    
    loadHospitals();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, options } = e.target;
    
    if (name === "hospital") {
      // Handle multiple select for hospitals
      const selectedHospitals = Array.from(options)
        .filter(option => option.selected)
        .map(option => parseInt(option.value)); // Convert to numbers
      
      console.log("Selected hospitals:", selectedHospitals);
      
      setFormData({
        ...formData,
        [name]: selectedHospitals
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData({
        ...formData,
        licence_pdf: file
      });
      if (errors.licence_pdf) {
        setErrors({
          ...errors,
          licence_pdf: ""
        });
      }
    } else {
      setErrors({
        ...errors,
        licence_pdf: "Please upload a PDF file"
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (role === "customer") {
      if (formData.customer_age && (formData.customer_age < 1 || formData.customer_age > 120)) {
        newErrors.customer_age = "Please enter a valid age";
      }
    }

    if (role === "therapist") {
      if (!formData.year_of_experience) {
        newErrors.year_of_experience = "Years of experience is required";
      }
      if (!formData.specialization) {
        newErrors.specialization = "Specialization is required";
      }
      if (!formData.qualification) {
        newErrors.qualification = "Qualification is required";
      }
      if (!formData.licence_pdf) {
        newErrors.licence_pdf = "Professional license PDF is required";
      }
      if (!formData.hospital || formData.hospital.length === 0) {
        newErrors.hospital = "Please select at least one hospital";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Debug function to see what we're sending
  const debugFormData = () => {
    console.log("=== FORM DATA DEBUG ===");
    console.log("Role:", role);
    console.log("Form Data:", formData);
    console.log("Hospital IDs:", formData.hospital);
    console.log("Hospital IDs type:", typeof formData.hospital);
    console.log("Hospital IDs array:", Array.isArray(formData.hospital));
    
    // Test FormData creation
    const testData = new FormData();
    formData.hospital.forEach(id => testData.append("hospital", id.toString()));
    
    console.log("FormData entries:");
    for (let [key, value] of testData.entries()) {
      console.log(key, value);
    }
    console.log("=== END DEBUG ===");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});
    
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        if (role === "customer") {
          // Use JSON for customer signup (no file upload)
          const jsonData = {
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone || "",
            customer_age: formData.customer_age ? parseInt(formData.customer_age) : null,
            customer_password: formData.password,
            confirm_password: formData.confirm_password,
            customer_gender: formData.gender || "no choice"
          };

          console.log("Submitting customer data:", jsonData);

          const response = await axios.post(
            `${API_BASE_URL}/api/customer_signup/`, 
            jsonData,
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 10000
            }
          );

          if (response.data.success) {
            setSuccessMessage("Account created successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
          }
        } else {
          // Use FormData for therapist (file upload)
          const submitData = new FormData();
          
          // Append basic fields
          submitData.append("name", formData.name);
          submitData.append("email", formData.email);
          submitData.append("phone", formData.phone || "");
          submitData.append("year_of_experience", formData.year_of_experience);
          submitData.append("specialization", formData.specialization);
          submitData.append("qualification", formData.qualification);
          submitData.append("gender", formData.gender || "no choice");
          submitData.append("password", formData.password);
          submitData.append("confirm_password", formData.confirm_password);
          
          // Append hospital IDs as separate fields - THIS IS CRITICAL
          console.log("Appending hospital IDs:", formData.hospital);
          formData.hospital.forEach(hospitalId => {
            submitData.append("hospital", hospitalId.toString()); // Convert to string
          });

          // Append file
          if (formData.licence_pdf) {
            submitData.append("licence_pdf", formData.licence_pdf);
          }

          // Log what we're sending
          console.log("=== SUBMITTING THERAPIST DATA ===");
          console.log("Hospital IDs being sent:", formData.hospital);
          for (let [key, value] of submitData.entries()) {
            console.log(key, value);
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/therapist_request_signup/`, 
            submitData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000,
              // Add this to see the actual request
              transformRequest: [(data, headers) => {
                // Log the raw FormData
                console.log("Raw FormData:", data);
                return data;
              }]
            }
          );

          console.log("Response received:", response.data);

          if (response.data.success) {
            const hospitalNames = response.data.hospitals || ["Unknown"];
            setSuccessMessage(
              `Application submitted successfully! Associated with: ${hospitalNames.join(", ")}. Awaiting admin approval. Redirecting to login...`
            );
            setTimeout(() => navigate("/login"), 4000);
          } else {
            throw new Error(response.data.error || "Failed to submit application");
          }
        }
        
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirm_password: "",
          gender: "",
          customer_age: "",
          year_of_experience: "",
          specialization: "",
          qualification: "",
          hospital: [],
          licence_pdf: null
        });
      } catch (error) {
        console.error("Full error:", error);
        console.error("Error response:", error.response);
        
        // Handle different types of errors
        if (!error.response) {
          // No response received (network error, connection refused, etc.)
          if (error.code === 'ECONNABORTED') {
            setErrors({ submit: "Request timeout. Please try again." });
          } else if (error.code === 'ECONNREFUSED') {
            setErrors({ 
              submit: "Cannot connect to server. Please make sure the Django backend is running on http://localhost:8000" 
            });
          } else {
            setErrors({ 
              submit: "Network error. Please check your internet connection and make sure the backend server is running." 
            });
          }
        } else if (error.response?.data) {
          const errorData = error.response.data;
          
          // Handle field-specific errors from Django
          if (typeof errorData === 'object') {
            const fieldErrors = {};
            Object.keys(errorData).forEach(key => {
              if (Array.isArray(errorData[key])) {
                // Django returns errors as arrays
                fieldErrors[key] = errorData[key][0];
              } else {
                fieldErrors[key] = errorData[key];
              }
            });
            setErrors(fieldErrors);
            
            // Also show the first error as a general message
            const firstError = Object.values(fieldErrors)[0];
            if (firstError) {
              setErrors(prev => ({ ...prev, submit: firstError }));
            }
          } else if (typeof errorData === 'string') {
            setErrors({ submit: errorData });
          } else {
            setErrors({ submit: "Please check all fields and try again." });
          }
        } else if (error.response.status >= 500) {
          setErrors({ submit: "Server error. Please try again later." });
        } else {
          setErrors({ submit: "Failed to create account. Please try again." });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div id="signup" className="signup-page min-h-screen flex flex-col bg-purple-200">
      <Navbar />
    
      <div className="flex flex-col md:flex-row items-center justify-center flex-grow px-4 py-8 min-h-[85vh]">
        {/* Left Section with larger image */}
        <div className="flex-1 flex flex-col items-center text-center mb-8 md:mb-0 md:mr-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">Let's Heal</h1>
          <p className="text-purple-800 text-lg mb-8 font-samibold"><i>"Your Journey to Healing Starts Here"</i></p>
          
          {/* Hero Image - Larger */}
          <div className="flex-1">
            <div className="video-container rounded-xl overflow-hidden flex justify-start">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="video-animation w-full h-auto max-w-2xl"
              >
                <source src="src/assets/signup1.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        {/* Signup Card - Adjusted for more fields */}
        <div className="flex-1 flex items-center justify-center md:mt-0">
          <div className="max-w-md bg-white rounded-xl shadow-lg p-6 w-full mx-auto border border-purple-200 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-purple-800 text-center mb-4 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
              {role === "customer" ? "Create Customer Account" : "Apply as Therapist"}
            </h2>
            
            {/* Toggle Buttons */}
            <div className="flex justify-center mb-4 bg-purple-200 p-1 rounded-lg">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 text-sm ${
                  role === "customer"
                    ? "bg-purple-800 text-white shadow-sm"
                    : "text-purple-800 hover:text-purple-700"
                }`}
                onClick={() => setRole("customer")}
              >
                Customer
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 text-sm ${
                  role === "therapist"
                    ? "bg-purple-800 text-white shadow-sm"
                    : "text-purple-800 hover:text-purple-700"
                }`}
                onClick={() => setRole("therapist")}
              >
                Therapist
              </button>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-md bg-green-50 p-3 border border-green-200 mb-4">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Connection Error Message */}
            {errors.submit && errors.submit.includes("Cannot connect to server") && (
              <div className="rounded-md bg-red-50 p-3 border border-red-200 mb-4">
                <p className="text-sm text-red-800 font-semibold">{errors.submit}</p>
                <p className="text-xs text-red-700 mt-1">
                  Make sure your Django server is running with: <code>python manage.py runserver</code>
                </p>
              </div>
            )}


            {/* Signup Form */}
            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-purple-800 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                    errors.name ? "border-red-500" : "border-purple-350"
                  }`}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                    errors.email ? "border-red-500" : "border-purple-350"
                  }`}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-purple-800 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                    errors.phone ? "border-red-500" : "border-purple-350"
                  }`}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Gender Field */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-purple-800 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                    errors.gender ? "border-red-500" : "border-purple-350"
                  }`}
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="no choice">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="no choice">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>

              {/* Customer Specific Fields */}
              {role === "customer" && (
                <div>
                  <label htmlFor="customer_age" className="block text-sm font-medium text-purple-800 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    id="customer_age"
                    name="customer_age"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                      errors.customer_age ? "border-red-500" : "border-purple-350"
                    }`}
                    value={formData.customer_age}
                    onChange={handleInputChange}
                  />
                  {errors.customer_age && <p className="text-red-500 text-xs mt-1">{errors.customer_age}</p>}
                </div>
              )}

              {/* Therapist Specific Fields */}
              {role === "therapist" && (
                <>
                  <div>
                    <label htmlFor="year_of_experience" className="block text-sm font-medium text-purple-800 mb-1">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      id="year_of_experience"
                      name="year_of_experience"
                      placeholder="Number of years"
                      min="0"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                        errors.year_of_experience ? "border-red-500" : "border-purple-350"
                      }`}
                      value={formData.year_of_experience}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.year_of_experience && <p className="text-red-500 text-xs mt-1">{errors.year_of_experience}</p>}
                  </div>

                  {/* Specialization Dropdown */}
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-purple-800 mb-1">
                      Specialization *
                    </label>
                    <select
                      id="specialization"
                      name="specialization"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                        errors.specialization ? "border-red-500" : "border-purple-350"
                      }`}
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Specialization</option>
                      {specializationOptions.map((specialization) => (
                        <option key={specialization} value={specialization}>
                          {specialization}
                        </option>
                      ))}
                    </select>
                    {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
                  </div>

                  <div>
                    <label htmlFor="qualification" className="block text-sm font-medium text-purple-800 mb-1">
                      Qualification *
                    </label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      placeholder="e.g., MBBS, MD, PhD in Psychology"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                        errors.qualification ? "border-red-500" : "border-purple-350"
                      }`}
                      value={formData.qualification}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                  </div>

                  {/* Hospital Selection Dropdown */}
                  <div>
                    <label htmlFor="hospital" className="block text-sm font-medium text-purple-800 mb-1">
                      Select Hospital(s) *
                    </label>
                    <select
                      id="hospital"
                      name="hospital"
                      multiple
                      size="4"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                        errors.hospital ? "border-red-500" : "border-purple-350"
                      }`}
                      value={formData.hospital}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>Select Hospital(s)</option>
                      {hospitals.map(hospital => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name} {hospital.address ? `- ${hospital.address}` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-purple-700 mt-1">
                      Hold Ctrl/Cmd to select multiple hospitals. Selected: {formData.hospital.length}
                    </p>
                    {errors.hospital && <p className="text-red-500 text-xs mt-1">{errors.hospital}</p>}
                  </div>

                  <div>
                    <label htmlFor="licence_pdf" className="block text-sm font-medium text-purple-800 mb-1">
                      Professional License (PDF) *
                    </label>
                    <input
                      type="file"
                      id="licence_pdf"
                      name="licence_pdf"
                      accept=".pdf"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-purple-800 file:text-white hover:file:bg-purple-700 text-sm ${
                        errors.licence_pdf ? "border-red-500" : "border-purple-350"
                      }`}
                      onChange={handleFileChange}
                      required
                    />
                    {errors.licence_pdf && <p className="text-red-500 text-xs mt-1">{errors.licence_pdf}</p>}
                    <p className="text-xs text-purple-700 mt-1">Upload your professional license as a PDF file</p>
                  </div>
                </>
              )}
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-purple-800 mb-1">
                  Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-700 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                    errors.password ? "border-red-500" : "border-purple-300"
                  }`}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="show-password"
                    className="h-3 w-3 text-purple-800 focus:ring-purple-800 border-purple-350 rounded"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label
                    htmlFor="show-password"
                    className="ml-2 block text-xs text-purple-800 hover:text-purple-700"
                  >
                    Show password
                  </label>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-purple-800 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-700 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                    errors.confirm_password ? "border-red-500" : "border-purple-300"
                  }`}
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  required
                />
                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
                
                <div className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    id="show-confirm-password"
                    className="h-3 w-3 text-purple-800 focus:ring-purple-800 border-purple-350 rounded"
                    checked={showConfirmPassword}
                    onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                  <label
                    htmlFor="show-confirm-password"
                    className="ml-2 block text-xs text-purple-800 hover:text-purple-700"
                  >
                    Show confirm password
                  </label>
                </div>
              </div>
              
              {/* Display field-specific errors */}
              {Object.keys(errors).map(key => 
                key !== 'submit' && errors[key] && (
                  <div key={key} className="rounded-md bg-red-50 p-2 border border-red-200">
                    <p className="text-xs text-red-800">
                      <strong>{key.replace(/_/g, ' ')}:</strong> {errors[key]}
                    </p>
                  </div>
                )
              )}
              
              {errors.submit && !errors.submit.includes("Cannot connect to server") && (
                <div className="rounded-md bg-red-50 p-2 border border-red-200">
                  <p className="text-xs text-red-800">{errors.submit}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-purple-800 text-white py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors font-medium text-sm ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {role === "customer" ? "Creating account..." : "Submitting application..."}
                  </span>
                ) : (
                  role === "customer" ? "Create Customer Account" : "Submit Therapist Application"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-4 mb-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-350"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-purple-50 text-purple-800">Already have an account?</span>
                </div>
              </div>
            </div>

            {/* Login link */}
            <div className="text-center">
              <a href="/login" className="font-medium text-purple-700 hover:text-purple-800 text-sm">
                Log in to your account
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;