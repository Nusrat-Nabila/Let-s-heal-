import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const Login = () => {
  const navigate = useNavigate();
  
  // State definitions
  const [role, setRole] = useState("customer"); 
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  // Handle role toggle
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setFormData({
      ...formData,
      role: selectedRole
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Main login function
  const handleLogin = async () => {
    setIsSubmitting(true);
    
    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
        role: role 
      };

      console.log("Logging in with:", loginData);

      const response = await axios.post(
        "http://localhost:8000/api/login/", 
        loginData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Login response:", response.data);

      // Handle successful login
      if (response.data.success) {
        const userData = response.data;
        
        // Store tokens and user data
        localStorage.setItem('access_token', userData.access_token);
        localStorage.setItem('refresh_token', userData.refresh_token);
        localStorage.setItem('user_role', userData.role);
        localStorage.setItem('user_data', JSON.stringify(userData.data));
        
        // Redirect based on role
        switch(userData.role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'therapist':
            navigate('/therapist-dashboard');
            break;
          case 'customer':
            navigate('/user-dashboard');
            break;
          default:
            navigate('/');
        }
        
        // Reset form
        setFormData({ email: "", password: "", role: "" });
      }
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
      
      // Handle specific error cases from backend
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Backend returns success: false for errors
        if (errorData.success === false) {
          setErrors({ submit: errorData.error });
        } 
        // Handle other error cases
        else {
          setErrors({ 
            submit: errorData.error || "Invalid email or password" 
          });
        }
      } else {
        setErrors({ submit: "Failed to connect to server. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (validateForm()) {
      await handleLogin();
    }
  };

  return (
    <div id="login" className="min-h-screen flex flex-col bg-purple-200">
      <Navbar />
    
      <div className="flex flex-col md:flex-row items-center justify-center flex-grow px-4 py-8 min-h-[85vh]">
        <div className="flex-1 flex flex-col items-center text-center mb-8 md:mb-0 md:mr-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-4 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">Let's Heal</h1>
          <p className="text-purple-800 text-lg mb-8 font-samibold"><i>"Your Journey to Healing Starts Here"</i></p>
          
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

        {/* Login Card */}
        <div className="flex-1 flex items-center justify-center md:mt-0">
          <div className="max-w-md bg-white rounded-xl shadow-lg p-6 w-full mx-auto border border-purple-200">
            <h2 className="text-xl font-semibold text-purple-800 text-center mb-4 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">Log In</h2>
            
            {/* Toggle Buttons */}
            <div className="flex justify-center mb-4 bg-purple-200 p-1 rounded-lg">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 text-sm ${
                  role === "customer"
                    ? "bg-purple-800 text-white shadow-sm"
                    : "text-purple-800 hover:text-purple-700"
                }`}
                onClick={() => handleRoleChange("customer")}
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
                onClick={() => handleRoleChange("therapist")}
              >
                Therapist
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 text-sm ${
                  role === "admin"
                    ? "bg-purple-800 text-white shadow-sm"
                    : "text-purple-800 hover:text-purple-700"
                }`}
                onClick={() => handleRoleChange("admin")}
              >
                Admin
              </button>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-800 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your registered email"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-800 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                    errors.email ? "border-red-500" : "border-purple-350"
                  }`}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-purple-800">
                    Password
                  </label>
                  <a href="#" className="text-xs text-purple-800 hover:text-purple-700 font-medium">
                    Forgot password?
                  </a>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-700 focus:border-purple-800 focus:outline-none transition-colors text-sm ${
                    errors.password ? "border-red-500" : "border-purple-300"
                  }`}
                  value={formData.password}
                  onChange={handleInputChange}
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
              
              {errors.submit && (
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
                    Signing in...
                  </span>
                ) : (
                  `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`
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
                  <span className="px-2 bg-white text-purple-800">New to our platform?</span>
                </div>
              </div>
            </div>

            {/* Sign up links */}
            <div className="text-center space-y-2">
              <div>
                <a href="/signup" className="font-medium text-purple-700 hover:text-purple-800 text-sm block">
                  Create Customer Account
                </a>
              </div>
              <div>
                <a href="/signup" className="font-medium text-purple-700 hover:text-purple-800 text-sm block">
                  Apply as Therapist
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;