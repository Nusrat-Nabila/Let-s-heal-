import React, { useState } from "react";
import { Link } from "react-router-dom";
import defaultProfilePic from "../assets/default-profile.png";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-80 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Error Loading Therapist</h3>
          <p className="text-gray-600 mb-4">Could not display therapist information.</p>
          <button 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Therapist Card Component
const Therapistcard = ({ therapist, backendData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use backendData as primary source, fallback to therapist prop
  const data = backendData || therapist;

  // Safe function to get hospital name - FIXED
  const getHospitalName = () => {
    // First check if hospital data exists in the API response
    if (data?.hospital) {
      console.log("Hospital data found:", data.hospital);
      
      // If hospital is an array (from serializer with many=True)
      if (Array.isArray(data.hospital) && data.hospital.length > 0) {
        const firstHospital = data.hospital[0];
        console.log("First hospital in array:", firstHospital);
        
        // Try different possible field names for hospital name
        const hospitalName = firstHospital.hospital_name || firstHospital.name || firstHospital.hospitalName;
        console.log("Extracted hospital name:", hospitalName);
        
        return hospitalName || "General Hospital";
      }
      // If hospital is a single object
      else if (typeof data.hospital === 'object') {
        const hospitalName = data.hospital.hospital_name || data.hospital.name || data.hospital.hospitalName;
        console.log("Hospital object name:", hospitalName);
        return hospitalName || "General Hospital";
      }
    }
    
    // If no hospital data found, check if there's a direct hospital_name field
    if (data?.hospital_name) {
      console.log("Direct hospital_name field:", data.hospital_name);
      return data.hospital_name;
    }
    
    console.log("No hospital data available, using fallback");
    return "General Hospital";
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle image loading with proper fallbacks
  const getImageSource = () => {
    if (imageError) {
      return defaultProfilePic;
    }
    
    if (data?.therapist_image) {
      if (data.therapist_image.startsWith('http')) {
        return data.therapist_image;
      }
      return `http://localhost:8000${data.therapist_image}`;
    }
    
    return defaultProfilePic;
  };

  const handleImageError = (e) => {
    console.warn("Failed to load therapist image, using fallback");
    setImageError(true);
    e.target.src = defaultProfilePic;
  };

  // Calculate rating based on experience
  const calculateRating = () => {
    const exp = data?.year_of_experience || 0;
    if (exp >= 15) return 4.8;
    if (exp >= 10) return 4.5;
    if (exp >= 5) return 4.2;
    return 4.0;
  };

  // Format session price based on experience
  const getSessionPrice = () => {
    const exp = data?.year_of_experience || 0;
    if (exp >= 15) return "$150";
    if (exp >= 10) return "$120";
    if (exp >= 5) return "$100";
    return "$80";
  };

  // Get display values with fallbacks
  const therapistName = data?.therapist_name || "Dr. Professional";
  const specialization = data?.therapist_specialization || "Mental Health Specialist";
  const experience = data?.year_of_experience || 0;
  const serveFor = data?.therapist_Serve_for || `Specializes in ${specialization}`;
  const qualification = data?.therapist_qualification || "Qualified Professional";
  const status = data?.therapist_status || "Verified Professional";
  const therapistId = data?.id || "1";
  
  const hospitalName = getHospitalName();
  const rating = calculateRating();

  return (
    <ErrorBoundary>
      <div className="bg-purple-50 shadow-lg rounded-xl p-6 w-80 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 border border-purple-350 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
        {/* Profile Image */}
        <div className="flex justify-center mb-4">
          <img
            src={getImageSource()}
            alt={therapistName}
            className="w-44 h-44 object-cover mx-auto rounded-full border-4 border-purple-350 shadow-sm"
            onError={handleImageError}
            loading="lazy"
          />
        </div>

        {/* Name and Specialty */}
        <h3 className="text-xl font-bold text-purple-800 text-center">
          {therapistName}
        </h3>
        <p className="text-sm text-purple-700 font-medium text-center mb-2">
          {specialization}
        </p>
        
        {/* Rating */}
        <div className="flex justify-center mb-3">
          {Array(5)
            .fill()
            .map((_, i) => (
              <span key={i} className="text-yellow-400 text-lg">
                {i < Math.floor(rating) ? "★" : "☆"}
              </span>
            ))}
          <span className="text-sm text-gray-900 ml-2">({rating.toFixed(1)})</span>
        </div>

        {/* Specialization Focus */}
        <p className="text-sm text-gray-950 text-center mb-4 italic">
          "{serveFor}"
        </p>

        {/* Quick Info */}
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-950">Experience</p>
            <p className="text-sm font-semibold">
              {experience}+ years
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-950">Session</p>
            <p className="text-sm font-semibold">{getSessionPrice()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-950">Status</p>
            <p className="text-sm font-semibold text-green-600">{status}</p>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="mt-4 border-t pt-4">
            <div className="mb-3">
              <p className="text-xs text-gray-950 mb-1">Hospital:</p>
              <p className="text-sm font-medium text-purple-700">
                {hospitalName}
              </p>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-gray-950 mb-1">Qualification:</p>
              <p className="text-sm font-medium text-gray-800">
                {qualification}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <button 
            onClick={toggleExpand}
            className="text-purple-800 text-sm font-medium hover:text-purple-700 flex items-center"
          >
            {isExpanded ? 'Less details' : 'More details'}
            <svg 
              className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <Link to={`/profile/${therapistId}`}>
            <button className="bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
              View Profile
            </button>
          </Link>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Therapistcard;