import React, { useState, useEffect } from "react";
import axios from "axios";
import Therapistcard from "../components/therapistcard";
import Filterbar from "../components/filterbar";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000', // Adjust this to your Django server URL
  timeout: 10000,
});

export default function FindTherapist() {
  const [therapists, setTherapists] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [filters, setFilters] = useState({
    search: "",
    specialty: "",
    hospital: "",
    gender: "",
    sortBy: "name_asc"
  });

  // Fetch therapists from backend API
  const fetchTherapists = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("access_token");
      console.log("Token from localStorage:", token); // Debug token
      
      const response = await api.get("/api/search_therapist/", {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
        params: {
          search: filters.search,
          specialty: filters.specialty,
          hospital: filters.hospital,
          gender: filters.gender,
          sort: filters.sortBy
        }
      });

      console.log("Full API Response:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data); 
      
      // Handle different response formats
      let therapistsData = [];
      if (Array.isArray(response.data)) {
        therapistsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, try to find array in common properties
        if (response.data.results) {
          therapistsData = response.data.results;
        } else if (response.data.therapists) {
          therapistsData = response.data.therapists;
        } else if (response.data.data) {
          therapistsData = response.data.data;
        } else {
          // Check if it's an empty object or has message
          if (response.data.message) {
            setError(response.data.message);
          }
          therapistsData = [];
        }
      }
      
      console.log("Processed therapists data:", therapistsData); // Debug processed data
      
      setTherapists(therapistsData);
      setFilteredTherapists(therapistsData);
      
    } catch (err) {
      console.error("Error fetching therapists:", err);
      console.error("Error response:", err.response); // Debug error response
      
      if (err.response?.status === 403) {
        setError("You are not authorized to view therapists. Please login.");
      } else if (err.response?.status === 404) {
        setError("No therapists found matching your criteria");
        setTherapists([]);
        setFilteredTherapists([]);
      } else if (err.response?.status === 401) {
        setError("Please login to view therapists");
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to load therapists. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchTherapists();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchTherapists();
    }
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Transform backend data to frontend format
  const transformTherapistData = (backendTherapist) => {
    if (!backendTherapist) return null;
    
    return {
      id: backendTherapist.id,
      name: backendTherapist.therapist_name || "Unknown Therapist",
      specialty: backendTherapist.therapist_specialization || "Mental Health Specialist",
      rating: 4.5,
      tagline: `Helping you with ${backendTherapist.therapist_specialization || "mental wellness"}`,
      image: backendTherapist.therapist_image || "/default-avatar.png",
      experience: backendTherapist.year_of_experience ? `${backendTherapist.year_of_experience}+ years` : "Experience not specified",
      price: "$150",
      languages: ["English", "Bengali"],
      availability: "Available next week",
      hospital: backendTherapist.hospital_name || "General Hospital",
      gender: backendTherapist.therapist_gender || "no choice",
      backendData: backendTherapist
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800 mx-auto mb-4"></div>
            <p className="text-purple-800 text-lg">Loading therapists...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id="findtherapist" className="min-h-screen bg-purple-200">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Filterbar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          therapistCount={filteredTherapists.length}
        />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 text-center">
            <strong>Error: </strong>{error}
            <button 
              onClick={fetchTherapists}
              className="ml-4 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredTherapists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTherapists.map((therapist) => {
              const transformedTherapist = transformTherapistData(therapist);
              return transformedTherapist ? (
                <Therapistcard 
                  key={therapist.id} 
                  therapist={transformedTherapist} 
                  backendData={therapist}
                />
              ) : null;
            })}
          </div>
        ) : (
          !loading && !error && (
            <div className="bg-purple-50 rounded-xl shadow-md p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">No therapists found</h3>
              <p className="text-purple-700 mb-4">
                No therapists match your search criteria. Try adjusting your filters.
              </p>
              <button 
                onClick={() => setFilters({
                  search: "",
                  specialty: "",
                  hospital: "",
                  gender: "",
                  sortBy: "name_asc"
                })}
                className="px-6 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )
        )}
      </div>
      
      <Footer />
    </div>
  );
}