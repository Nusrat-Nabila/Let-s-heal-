import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Link, useParams } from "react-router-dom";

// Import default profile picture from assets
import defaultProfilePic from "../assets/default-profile.png";

const TherapistProfile = () => {
  const { id } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_URL = 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/view_therapist_profile/${id}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTherapist(data);

      } catch (err) {
        console.error('Error fetching therapist:', err);
        setError(`Failed to load therapist: ${err.message}. Make sure your Django server is running on port 8000.`);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [id]);

  // Function to get image URL from backend
  const getTherapistImage = (therapistData) => {
    if (!therapistData) return defaultProfilePic;
    
    if (therapistData.therapist_image && therapistData.therapist_image.startsWith('http')) {
      return therapistData.therapist_image;
    }
    
    if (therapistData.therapist_image) {
      return `http://localhost:8000${therapistData.therapist_image}`;
    }
    
    return defaultProfilePic;
  };

  // Function to safely get any field with fallbacks
  const getField = (fieldNames, fallback = "Not specified") => {
    if (!therapist) return fallback;
    
    for (let fieldName of fieldNames) {
      if (therapist[fieldName] !== undefined && therapist[fieldName] !== null && therapist[fieldName] !== "") {
        return therapist[fieldName];
      }
    }
    return fallback;
  };

  // Function to get hospital information safely
  const getHospitalInfo = () => {
    if (!therapist || !therapist.hospital) {
      return { hospitals: [], count: 0 };
    }

    const hospitals = Array.isArray(therapist.hospital) 
      ? therapist.hospital 
      : [therapist.hospital];

    return {
      hospitals: hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name || 'Unknown Hospital',
        address: hospital.address || 'Address not available'
      })),
      count: hospitals.length
    };
  };

  // Get the image source
  const imageSrc = therapist ? getTherapistImage(therapist) : defaultProfilePic;
  const hospitalInfo = getHospitalInfo();

  if (error && !therapist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="flex gap-4 justify-center mt-6">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Try Again
                </button>
                <Link to="/therapists">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                    Back to Therapists
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-8 max-w-2xl mx-auto">
              <div className="animate-pulse">
                <div className="h-6 bg-purple-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-purple-100 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Data Available</h3>
              <p className="text-yellow-600 mb-4">Therapist data not found.</p>
              <Link to="/therapists">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  Back to Therapists
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id= "profile" className="min-h-screen bg-purple-200">
      <Navbar />
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <img
                className="h-60 w-60 rounded-full object-cover border-4 border-purple-800 shadow-lg"
                src={imageSrc}
                alt={getField(['therapist_name', 'name'], 'Therapist')}
                onError={(e) => {
                  if (e.currentTarget) {
                    e.currentTarget.src = defaultProfilePic;
                  }
                }}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  {/* Therapist Name */}
                  <h1 className="text-3xl font-bold text-purple-800">
                    {getField(['therapist_name', 'name'], 'Therapist Name Not Available')}
                  </h1>
                  <p className="text-lg text-purple-900 font-medium mt-2">
                    {getField(['therapist_qualification', 'qualification'], 'Licensed Therapist')}
                  </p>
                  <p className="text-base text-purple-700 mt-1">
                    {getField(['therapist_specialization', 'specialization'], 'Mental Health Professional')}
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {getField(['year_of_experience']) !== "Not specified" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-900 border border-purple-200">
                        {getField(['year_of_experience'])}+ years experience
                      </span>
                    )}
                    {getField(['therapist_gender', 'gender']) !== "Not specified" && getField(['therapist_gender', 'gender']) !== 'no choice' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-200 text-purple-900 border border-purple-300">
                        {getField(['therapist_gender', 'gender'])}
                      </span>
                    )}
                    {getField(['therapist_status', 'status']) !== "Not specified" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {getField(['therapist_status', 'status'])}
                      </span>
                    )}
                  </div>
                </div>
                
<div className="mt-4 lg:mt-0 flex flex-col gap-2 lg:gap-3">
  <Link to={`/booking/${therapist.id}`} className="w-full">
    <button className="w-full bg-purple-800 hover:bg-purple-700 text-white font-medium py-2 lg:py-3 px-4 lg:px-8 rounded-lg transition-colors shadow flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-base">
      <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Book Appointment
    </button>
  </Link>
  
  <button className="w-full border border-purple-800 bg-purple-100 hover:bg-purple-50 text-purple-800 font-medium py-2 lg:py-3 px-4 lg:px-8 rounded-lg transition-colors shadow flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-base">
    <svg className="w-4 lg:w-5 h-4 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
    Send Message
  </button>
</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
              <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Therapist Name */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[100px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Therapist Name</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['therapist_name', 'name'])}
                  </p>
                </div>

                {/* Therapist Email */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[100px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Email</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['therapist_email', 'email'])}
                  </p>
                </div>

                {/* Therapist Phone */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[100px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Phone</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['therapist_phone', 'phone'])}
                  </p>
                </div>

                {/* Year of Experience */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[100px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Years of Experience</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['year_of_experience']) !== "Not specified" ? `${getField(['year_of_experience'])} years` : "Not specified"}
                  </p>
                </div>

                {/* Gender */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[100px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Gender</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['therapist_gender', 'gender']) !== 'no choice' ? getField(['therapist_gender', 'gender']) : "Not specified"}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[100px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Status</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['therapist_status', 'status'])}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
              <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Professional Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Specialization */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[120px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Specialization</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['therapist_specialization', 'specialization'])}
                  </p>
                </div>

                {/* Qualification */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[120px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Qualification</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['therapist_qualification', 'qualification'])}
                  </p>
                </div>

                {/* Serve For */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[120px] flex flex-col justify-center">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Areas of Service</span>
                  </div>
                  <p className="text-purple-900 font-medium text-base">
                    {getField(['therapist_Serve_for', 'serve_for', 'areas_of_service'])}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Hospital & Additional Info */}
          <div className="space-y-6">
            
            {/* Hospital Information */}
            <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
              <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Hospital Information
              </h2>
              
              <div className="space-y-4">
                {/* Hospital Names */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[120px]">
                  <div className="flex items-center mb-3">
                    <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm font-semibold text-purple-800">Associated Hospitals</span>
                  </div>
                  <div className="text-purple-900 font-medium">
                    {hospitalInfo.count > 0 ? (
                      <div className="space-y-3">
                        {hospitalInfo.hospitals.map((hospital, index) => (
                          <div key={hospital.id || index} className="bg-white rounded-lg p-3 border border-purple-200">
                            <p className="font-semibold text-purple-900 text-base">{hospital.name}</p>
                            {hospital.address && (
                              <p className="text-sm text-purple-600 mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {hospital.address}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-purple-600 italic text-base">No hospitals associated with this therapist</p>
                    )}
                  </div>
                </div>

                {/* Hospital Count Summary */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 min-h-[80px] flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm font-semibold text-purple-800">Total Associated Hospitals</span>
                    </div>
                    <span className="bg-purple-800 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {hospitalInfo.count}
                    </span>
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