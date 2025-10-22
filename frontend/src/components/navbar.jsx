import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoImage from "../assets/Lets_Heal.jpg";
import defaultProfilePic from "../assets/default-profile.png";

// Import icons
import { FiHome, FiUsers, FiBarChart,FiClock,FiFileText, FiHelpCircle,FiUser,FiSettings,FiLogOut,FiMessageSquare,FiSearch,FiBook,FiBarChart2,FiMenu,FiX,FiChevronDown,FiInfo,FiStar,FiShield,FiTrendingUp,FiUserPlus,FiGrid,FiMapPin} from "react-icons/fi";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in - UPDATED TO GET PROFILE IMAGES
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    if (accessToken && userRole) {
      setUser({
        role: userRole,
        ...userData
      });
    } else {
      setUser(null);
    }
  }, [location]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleServicesDropdown = () => setIsServicesDropdownOpen(!isServicesDropdownOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
        setIsServicesDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
    
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const getUserName = () => {
    if (!user) return "";
    
    switch(user.role) {
      case 'customer':
        return user.customer_name || "Customer";
      case 'therapist':
        return user.therapist_name || "Therapist";
      case 'admin':
        return user.admin_name || "Admin";
      default:
        return "User";
    }
  };

  const getUserEmail = () => {
    if (!user) return "";
    
    switch(user.role) {
      case 'customer':
        return user.customer_email || "";
      case 'therapist':
        return user.therapist_email || "";
      case 'admin':
        return user.admin_email || "";
      default:
        return "";
    }
  };

  // GET PROFILE IMAGE FUNCTION 
  const getProfileImage = () => {
    if (!user) return defaultProfilePic;

    let profileImage = defaultProfilePic;
    
    switch(user.role) {
      case 'customer':
        profileImage = user.customer_image || defaultProfilePic;
        break;
      case 'therapist':
        profileImage = user.therapist_image || defaultProfilePic;
        break;
      case 'admin':
        profileImage = user.admin_profile_picture || defaultProfilePic;
        break;
      default:
        profileImage = defaultProfilePic;
    }

    // Ensure the image URL is complete (add base URL if needed)
    if (profileImage && !profileImage.startsWith('http') && !profileImage.startsWith('data:image') && profileImage !== defaultProfilePic) {
      // Add your backend base URL here if images are stored relative paths
      profileImage = `http://localhost:8000${profileImage}`;
    }

    return profileImage;
  };

  // Profile Image Component - Handles image loading errors
  const ProfileImage = ({ className, alt }) => {
    const [imgSrc, setImgSrc] = useState(getProfileImage());
    
    useEffect(() => {
      setImgSrc(getProfileImage());
    }, [user]);

    const handleImageError = () => {
      setImgSrc(defaultProfilePic);
    };

    return (
      <img 
        src={imgSrc} 
        alt={alt} 
        className={className}
        onError={handleImageError}
      />
    );
  };

  // Customer Navbar - UPDATED WITH PROFILE IMAGE
  const CustomerNavbar = () => (
    <>
      {/* Desktop Menu for Customer */}
      <div className="hidden md:flex xl:gap-6 lg:gap-4 md:gap-3 relative items-center">
        <Link to="/user-dashboard" className="hover:text-purple-200 transition px-3 py-2 flex items-center gap-2">
          <FiHome className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        {/* Services Dropdown for Customer */}
        <div className="relative" ref={servicesDropdownRef}>
          <button
            onClick={toggleServicesDropdown} 
            className="hover:text-purple-200 transition flex items-center gap-2 px-3 py-2"
          >
            <FiMenu className="w-4 h-4" />
            <span>Services</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${isServicesDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isServicesDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-purple-200 text-purple-800 rounded-lg shadow-lg z-20 border border-purple-300">
              <Link
                to="/findtherapist"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsServicesDropdownOpen(false)}
              >
                <FiSearch className="w-4 h-4" />
                <span>Find Therapist</span>
              </Link>
              <Link
                to="/blog-posts"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsServicesDropdownOpen(false)}
              >
                <FiBook className="w-4 h-4" />
                <span>Blog Posts</span>
              </Link>
              <Link
                to="/assessments"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsServicesDropdownOpen(false)}
              >
                <FiBarChart2 className="w-4 h-4" />
                <span>Mental Health Quiz</span>
              </Link>
              <Link
                to="/upcoming-appointments"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsServicesDropdownOpen(false)}
              >
                <FiClock className="w-4 h-4" />
                <span>Appointments</span>
              </Link>
              
            </div>
          )}
        </div>

        <Link to="/help" className="hover:text-purple-200 transition px-3 py-2 flex items-center gap-2">
          <FiHelpCircle className="w-4 h-4" />
          <span>Help</span>
        </Link>

        {/* Chat with Icon */}
        <Link to="/chat" className="hover:text-purple-200 transition px-3 py-2 flex items-center gap-2">
          <FiMessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </Link>

        {/* Profile Dropdown - UPDATED WITH PROFILE IMAGE */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown} 
            className="hover:text-purple-200 transition flex items-center gap-2 px-3 py-2"
          >
            <ProfileImage 
              alt="Profile" 
              className="w-8 h-8 rounded-full border-2 border-purple-200 object-cover"
            />
            <span>{getUserName()}</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-purple-200 text-purple-800 rounded-lg shadow-lg z-10 border border-purple-300">
              <div className="px-4 py-3 border-b border-purple-300">
                <p className="font-semibold text-sm">{getUserEmail()}</p>
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <FiUser className="w-3 h-3" />
                  Customer Account
                </p>
              </div>
              <Link
                to="/user-profile"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/customer/settings"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <FiSettings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-purple-50 text-red-600 flex items-center gap-3"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu for Customer - UPDATED WITH PROFILE IMAGE */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-purple-800 border-t border-purple-700">
          <div className="px-4 py-3 space-y-2">
            {/* User info */}
            <div className="pb-3 border-b border-purple-700 flex items-center gap-3">
              <ProfileImage 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-purple-200 object-cover"
              />
              <div>
                <p className="text-purple-200 font-semibold text-sm">{getUserEmail()}</p>
                <p className="text-purple-300 text-xs flex items-center gap-1">
                  <FiUser className="w-3 h-3" />
                  Customer Account
                </p>
              </div>
            </div>

            <Link
              to="/user-dashboard"
              className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiHome className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            {/* Services Dropdown for Mobile */}
            <div className="py-2 px-3">
              <button
                onClick={toggleServicesDropdown}
                className="w-full text-left text-purple-200 hover:text-white flex items-center justify-between gap-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <FiMenu className="w-4 h-4" />
                  <span>Services</span>
                </div>
                <FiChevronDown className={`w-4 h-4 transition-transform ${isServicesDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isServicesDropdownOpen && (
                <div className="mt-2 ml-6 space-y-1">
                  <Link
                    to="/findtherapist"
                    className="py-2 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                    onClick={() => {
                      setIsServicesDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FiSearch className="w-4 h-4" />
                    <span>Find Therapist</span>
                  </Link>
                  <Link
                    to="/blog-posts"
                    className="py-2 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                    onClick={() => {
                      setIsServicesDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FiBook className="w-4 h-4" />
                    <span>Blog Posts</span>
                  </Link>
                  <Link
                    to="/assessments"
                    className="py-2 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                    onClick={() => {
                      setIsServicesDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FiBarChart2 className="w-4 h-4" />
                    <span>Mental Health Quiz</span>
                  </Link>
                  <Link
                    to="/upcoming-appointments"
                    className="py-2 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                    onClick={() => {
                      setIsServicesDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FiClock className="w-4 h-4" />
                    <span>Appointments</span>
                  </Link>
                </div>
              )}
            </div>
            
            <Link
              to="/help"
              className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiHelpCircle className="w-4 h-4" />
              <span>Help</span>
            </Link>

            <Link
              to="/chat"
              className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiMessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </Link>

            <div className="pt-3 border-t border-purple-700 space-y-2">
              <Link
                to="/user-profile"
                className="w-full py-2 px-3 text-center border border-purple-200 text-white rounded-lg font-semibold hover:bg-purple-200 hover:text-purple-800 transition flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 text-center bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Therapist Navbar - UPDATED WITH PROFILE IMAGE
  const TherapistNavbar = () => (
    <>
      {/* Desktop Menu for Therapist */}
      <div className="hidden md:flex xl:gap-6 lg:gap-4 md:gap-3 relative items-center">
        <Link to="/therapist-dashboard" className="hover:text-purple-200 transition px-3 py-2 flex items-center gap-2">
          <FiHome className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        {/* Services Dropdown for Therapist */}
        <div className="relative" ref={servicesDropdownRef}>
          <button
            onClick={toggleServicesDropdown} 
            className="hover:text-purple-200 transition flex items-center gap-2 px-3 py-2"
          >
            <FiMenu className="w-4 h-4" />
            <span>Services</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${isServicesDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isServicesDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-purple-200 text-purple-800 rounded-lg shadow-lg z-20 border border-purple-300">
              <Link
                to="/current-appointment"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsServicesDropdownOpen(false)}
              >
                <FiClock className="w-4 h-4" />
                <span>Appointments</span>
              </Link>
              <Link
                to="/blog-posts"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsServicesDropdownOpen(false)}
              >
                <FiBook className="w-4 h-4" />
                <span>Blog Post</span>
              </Link>
            </div>
          )}
        </div>

        {/* Chat with Icon */}
        <Link to="/chat" className="hover:text-purple-200 transition px-3 py-2 flex items-center gap-2">
          <FiMessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </Link>

        {/* Profile Dropdown - UPDATED WITH PROFILE IMAGE */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown} 
            className="hover:text-purple-200 transition flex items-center gap-2 px-3 py-2"
          >
            <ProfileImage 
              alt="Profile" 
              className="w-8 h-8 rounded-full border-2 border-purple-200 object-cover"
            />
            <span>{getUserName()}</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-purple-200 text-purple-800 rounded-lg shadow-lg z-10 border border-purple-300">
              <div className="px-4 py-3 border-b border-purple-300">
                <p className="font-semibold text-sm">{getUserEmail()}</p>
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <FiStar className="w-3 h-3" />
                  Therapist Account
                </p>
              </div>
              <Link
                to="/therapistprofileown"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-purple-50 text-red-600 flex items-center gap-3"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu for Therapist - UPDATED WITH PROFILE IMAGE */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-purple-800 border-t border-purple-700">
          <div className="px-4 py-3 space-y-2">
            {/* Therapist info */}
            <div className="pb-3 border-b border-purple-700 flex items-center gap-3">
              <ProfileImage 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-purple-200 object-cover"
              />
              <div>
                <p className="text-purple-200 font-semibold text-sm">{getUserName()}</p>
                <p className="text-purple-300 text-xs flex items-center gap-1">
                  <FiStar className="w-3 h-3" />
                  Therapist Account
                </p>
              </div>
            </div>

            <Link
              to="/therapist-dashboard"
              className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiHome className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* Services Section in Mobile */}
            <div className="py-2">
              <p className="text-purple-300 text-xs font-semibold px-3 mb-2">SERVICES</p>
              
              
              <Link
                to="/current-appointment"
                className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiClock className="w-4 h-4" />
                <span>Appointments</span>
              </Link>

              <Link
                to="/blog-posts"
                className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiBook className="w-4 h-4" />
                <span>Blog Post</span>
              </Link>
            </div>

            <Link
              to="/chat"
              className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiMessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </Link>

            <div className="pt-3 border-t border-purple-700 space-y-2">
              <Link
                to="/therapistprofileown"
                className="w-full py-2 px-3 text-center border border-purple-200 text-white rounded-lg font-semibold hover:bg-purple-200 hover:text-purple-800 transition flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 text-center bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Admin Navbar - FIXED VERSION
  const AdminNavbar = () => {
    // Separate states for each dropdown
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    // Separate refs for each dropdown
    const servicesDropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);

    // Separate toggle functions
    const toggleServicesDropdown = () => {
      setIsServicesOpen(!isServicesOpen);
      setIsProfileOpen(false); // Close profile when opening services
    };

    const toggleProfileDropdown = () => {
      setIsProfileOpen(!isProfileOpen);
      setIsServicesOpen(false); // Close services when opening profile
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
          setIsServicesOpen(false);
        }
        if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
          setIsProfileOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <>
        {/* Desktop Menu for Admin */}
        <div className="hidden md:flex xl:gap-6 lg:gap-4 md:gap-3 relative items-center">
          <Link to="/admin-dashboard" className="hover:text-purple-200 transition px-3 py-2 flex items-center gap-2">
            <FiHome className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          {/* Services Dropdown - FIXED */}
          <div className="relative" ref={servicesDropdownRef}>
            <button
              onClick={toggleServicesDropdown} 
              className="hover:text-purple-200 transition flex items-center gap-2 px-3 py-2"
            >
              <FiGrid className="w-4 h-4" />
              <span>Services</span>
              <FiChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
            </button>

            {isServicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-purple-200 text-purple-800 rounded-lg shadow-lg z-10 border border-purple-300">
                <div className="px-4 py-3 border-b border-purple-300">
                  <p className="font-semibold text-sm">Manage Services</p>
                </div>
                
                <Link
                  to="/therapist-requests"
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 border-b border-purple-300"
                  onClick={() => setIsServicesOpen(false)}
                >
                  <FiUsers className="w-4 h-4" />
                  <span>Therapist Requests</span>
                </Link>
                
                <Link
                  to="/admin-customers"
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 border-b border-purple-300"
                  onClick={() => setIsServicesOpen(false)}
                >
                  <FiUser className="w-4 h-4" />
                  <span>Customer List</span>
                </Link>

                <Link
                  to="/admin-therapist"
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 border-b border-purple-300"
                  onClick={() => setIsServicesOpen(false)}
                >
                  <FiUserPlus className="w-4 h-4" />
                  <span>Therapist List</span>
                </Link>

                <Link
                  to="/admin-hospitals"
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 border-b border-purple-300"
                  onClick={() => setIsServicesOpen(false)}
                >
                  <FiMapPin className="w-4 h-4" />
                  <span>Hospital List</span>
                </Link>


                <Link
                  to="/admin-quiz"
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-3 border-b border-purple-300"
                  onClick={() => setIsServicesOpen(false)}
                >
                  <FiBarChart2 className="w-4 h-4" />
                  <span> Quiz Control</span>
                </Link>
              </div>
            )}
          </div>

          {/* Profile Dropdown - FIXED */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={toggleProfileDropdown} 
              className="hover:text-purple-200 transition flex items-center gap-2 px-3 py-2"
            >
              <ProfileImage 
                alt="Profile" 
                className="w-8 h-8 rounded-full border-2 border-purple-200 object-cover"
              />
              <span>{getUserName()}</span>
              <FiChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-purple-200 text-purple-800 rounded-lg shadow-lg z-10 border border-purple-300">
                <div className="px-4 py-3 border-b border-purple-300">
                  <p className="font-semibold text-sm">{getUserEmail()}</p>
                  <p className="text-xs text-purple-600 flex items-center gap-1">
                    <FiShield className="w-3 h-3" />
                    Admin Account
                  </p>
                </div>


                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 text-red-600 flex items-center gap-3"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu for Admin - This part is fine */}
        {isMobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden bg-purple-800 border-t border-purple-700">
            <div className="px-4 py-3 space-y-2">
              {/* Admin info */}
              <div className="pb-3 border-b border-purple-700 flex items-center gap-3">
                <ProfileImage 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-purple-200 object-cover"
                />
                <div>
                  <p className="text-purple-200 font-semibold text-sm">{getUserEmail()}</p>
                  <p className="text-purple-300 text-xs flex items-center gap-1">
                    <FiShield className="w-3 h-3" />
                    Admin Account
                  </p>
                </div>
              </div>

              <Link
                to="/admin-dashboard"
                className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiHome className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              {/* Services Section Header */}
              <div className="pt-2 pb-1">
                <p className="text-purple-400 text-xs font-semibold uppercase tracking-wide px-3">Services</p>
              </div>
              
              <Link
                to="/therapist-requests"
                className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUsers className="w-4 h-4" />
                <span>Therapist Requests</span>
              </Link>
              
              <Link
                to="/admin-customers"
                className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>Customer List</span>
              </Link>

              <Link
                to="/admin-therapist"
                className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUserPlus className="w-4 h-4" />
                <span>Therapist List</span>
              </Link>

              <Link
                to="/admin-hospitals"
                className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiMapPin className="w-4 h-4" />
                <span>Hospital List</span>
              </Link>
              <Link
                  to="/admin-quiz"
                  className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                  onClick={() => setIsServicesOpen(false)}
                >
                  <FiBarChart className="w-4 h-4" />
                  <span> Quiz Control</span>
                </Link>
              <div className="pt-3 border-t border-purple-700 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 text-center bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Guest Navbar
  const GuestNavbar = () => (
    <>
      {/* Desktop Menu for Guest */}
      <div className="hidden md:flex xl:gap-8 lg:gap-6 md:gap-4 relative items-center">
        <Link to="/" className="hover:text-purple-200 transition px-3 py-2 flex items-center gap-2">
          <FiHome className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link to="/about" className="hover:text-purple-200 transition px-3 py-2 flex items-center gap-2">
          <FiInfo className="w-4 h-4" />
          <span>About</span>
        </Link>

        {/* Dropdown for Services */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown} 
            className="hover:text-purple-200 transition flex items-center gap-2 px-3 py-2"
          >
            <FiMenu className="w-4 h-4" />
            <span>Services</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-purple-200 text-purple-800 rounded-lg shadow-lg z-10 border border-purple-300">
              <Link
                to="/services/therapy"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <FiUsers className="w-4 h-4" />
                <span>Therapy</span>
              </Link>
              <Link
                to="/blog-posts"
                className="px-4 py-3 hover:bg-purple-50 border-b border-purple-300 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <FiBook className="w-4 h-4" />
                <span>Blog Posts</span>
              </Link>
              <Link
                to="/services/assessments"
                className="px-4 py-3 hover:bg-purple-50 flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <FiBarChart2 className="w-4 h-4" />
                <span>Assessments</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Buttons for Guest */}
      <div className="hidden md:flex gap-3 items-center">
        <Link 
          to="/findtherapist" 
          className="py-2 px-4 bg-purple-200 text-purple-800 rounded-lg font-semibold hover:bg-purple-800 hover:text-purple-200 transition flex items-center gap-2"
        >
          <FiSearch className="w-4 h-4" />
          <span>Find Therapist</span>
        </Link>
        <Link 
          to="/signup" 
          className="py-2 px-4 border border-purple-200 text-white rounded-lg font-semibold hover:bg-purple-200 hover:text-purple-800 transition flex items-center gap-2"
        >
          <FiUser className="w-4 h-4" />
          <span>Sign Up</span>
        </Link>
        <Link 
          to="/login" 
          className="py-2 px-4 bg-purple-200 text-purple-800 rounded-lg font-semibold hover:bg-purple-800 hover:text-purple-200 transition flex items-center gap-2"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Login</span>
        </Link>
      </div>

      {/* Mobile Menu for Guest */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-purple-800 border-t border-purple-700">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/"
              className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiHome className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/about"
              className="py-3 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiInfo className="w-4 h-4" />
              <span>About</span>
            </Link>
            
            <div className="py-2 px-3">
              <button
                onClick={toggleDropdown}
                className="w-full text-left text-purple-200 hover:text-white flex items-center justify-between gap-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <FiMenu className="w-4 h-4" />
                  <span>Services</span>
                </div>
                <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isOpen && (
                <div className="mt-2 ml-6 space-y-1">
                  <Link
                    to="/services/therapy"
                    className="py-2 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                    onClick={() => {
                      setIsOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FiUsers className="w-4 h-4" />
                    <span>Therapy</span>
                  </Link>
                  <Link
                    to="/services/blog"
                    className="py-2 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                    onClick={() => {
                      setIsOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FiBook className="w-4 h-4" />
                    <span>Blog Posts</span>
                  </Link>
                  <Link
                    to="/services/assessments"
                    className="py-2 px-3 text-purple-200 hover:text-white hover:bg-purple-700 rounded-md transition flex items-center gap-3"
                    onClick={() => {
                      setIsOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FiBarChart2 className="w-4 h-4" />
                    <span>Assessments</span>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="pt-3 border-t border-purple-700 space-y-2">
              <Link
                to="/therapists"
                className="w-full py-2 px-3 text-center bg-purple-200 text-purple-800 rounded-lg font-semibold hover:bg-purple-800 hover:text-purple-200 transition flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiSearch className="w-4 h-4" />
                <span>Find Therapist</span>
              </Link>
              <Link
                to="/signup"
                className="w-full py-2 px-3 text-center border border-purple-200 text-white rounded-lg font-semibold hover:bg-purple-200 hover:text-purple-800 transition flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiUser className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
              <Link
                to="/login"
                className="w-full py-2 px-3 text-center bg-purple-200 text-purple-800 rounded-lg font-semibold hover:bg-purple-800 hover:text-purple-200 transition flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiLogOut className="w-4 h-4" />
                <span>Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Render appropriate navbar based on user role
  const renderNavbar = () => {
    if (!user) {
      return <GuestNavbar />;
    }

    switch (user.role) {
      case 'customer':
        return <CustomerNavbar />;
      case 'therapist':
        return <TherapistNavbar />;
      case 'admin':
        return <AdminNavbar />;
      default:
        return <GuestNavbar />;
    }
  };

  return (
    <nav>
      <div className="w-full py-2 border-b border-purple-700 bg-purple-800 text-white">
        <div className="flex justify-between items-center px-4 md:px-6 lg:px-8 xl:px-15 font-semibold">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={user ? `/${user.role}/dashboard` : "/"}>
              <img src={logoImage} className="w-32 md:w-40 h-8 md:h-11" alt="Let's Heal Logo" />
            </Link>
          </div>

          {/* Navigation Links */}
          {renderNavbar()}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-button p-2 rounded-md text-purple-200 hover:text-white hover:bg-purple-700 transition"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;