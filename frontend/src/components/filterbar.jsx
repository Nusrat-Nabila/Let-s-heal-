import React, { useState, useEffect, useCallback } from "react";

// Search Icon component (you'll need to define this or use an icon library)
const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Filterbar = ({ filters, onFilterChange, therapistCount }) => {
  const [hospitals, setHospitals] = useState([]);
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // Static data
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

  const defaultHospitals = [
    "General Hospital",
    "Mental Health Center", 
    "Community Clinic",
    "University Hospital"
  ];

  // Fetch hospitals
  const fetchHospitalList = useCallback(async () => {
    try {
      setLoadingHospitals(true);
      const API_URL = 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/api/view_hospital_list/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let hospitalList = [];
      if (Array.isArray(data)) {
        hospitalList = data;
      } else if (data.hospitals && Array.isArray(data.hospitals)) {
        hospitalList = data.hospitals;
      } else if (data.results && Array.isArray(data.results)) {
        hospitalList = data.results;
      }

      const hospitalNames = hospitalList.map(hospital => 
        hospital.hospital_name || hospital.name || hospital.title || 'Unknown Hospital'
      ).filter(name => name && name !== 'Unknown Hospital');

      const uniqueHospitals = [...new Set(hospitalNames)];
      setHospitals(uniqueHospitals.length > 0 ? uniqueHospitals : defaultHospitals);

    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setHospitals(defaultHospitals);
    } finally {
      setLoadingHospitals(false);
    }
  }, []);

  // Handle search input - FIXED: removed references to undefined functions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    onFilterChange({
      ...filters,
      search: value
    });
  };

  // Clear search - FIXED: removed references to undefined state variables
  const handleClearSearch = () => {
    setLocalSearch("");
    onFilterChange({
      ...filters,
      search: ""
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setLocalSearch("");
    onFilterChange({
      search: "",
      specialty: "",
      hospital: "",
      gender: "",
      sortBy: "name_asc"
    });
  };

  // Remove individual filter
  const removeFilter = (filterName) => {
    if (filterName === "search") {
      setLocalSearch("");
    }
    onFilterChange({
      ...filters,
      [filterName]: ""
    });
  };

  // Effects
  useEffect(() => {
    fetchHospitalList();
  }, [fetchHospitalList]);

  // FIX: Only sync from parent to child when search is actually cleared from outside
  useEffect(() => {
    // Only update localSearch if filters.search is empty and localSearch is not
    if (filters.search === "" && localSearch !== "") {
      setLocalSearch("");
    }
    // If filters.search has value and it's different from localSearch, sync it
    else if (filters.search && filters.search !== localSearch) {
      setLocalSearch(filters.search);
    }
  }, [filters.search]); // Only depend on filters.search

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.specialty || filters.hospital || filters.gender;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-purple-200">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="text-center lg:text-left">
          <h2 className="text-xl font-bold text-purple-800">
            Find Therapists
          </h2>
          {therapistCount !== undefined && (
            <p className="text-purple-700 text-sm mt-1">
              {therapistCount} therapist{therapistCount !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-purple-800 font-semibold whitespace-nowrap">
            Sort by:
          </span>
          <select 
            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-white border border-purple-300 text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Search Section - FIXED: Corrected the structure and variable names */}
      <div className="mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search therapists by name, specialty, or hospital..."
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-purple-600 mt-2">
          {localSearch 
            ? `Searching for "${localSearch}"` 
            : "Start typing to search therapists - results update instantly"}
        </p>
      </div>

      {/* Filter Options */}
      <div className="bg-purple-50 rounded-xl p-4">
        <h3 className="text-base font-semibold text-purple-800 mb-3 flex items-center justify-center sm:justify-start">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Options
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Specialty Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-purple-800 mb-2">Specialty</label>
            <select 
              className="w-full px-3 py-2 rounded-lg border border-purple-300 bg-white text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              value={filters.specialty}
              onChange={(e) => handleFilterChange("specialty", e.target.value)}
            >
              <option value="">All Specialties</option>
              {specializationOptions.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-purple-800 mb-2">
              Hospital
              {loadingHospitals && (
                <span className="ml-2 text-xs text-purple-600">Loading...</span>
              )}
            </label>
            <select 
              className="w-full px-3 py-2 rounded-lg border border-purple-300 bg-white text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm disabled:opacity-50"
              value={filters.hospital}
              onChange={(e) => handleFilterChange("hospital", e.target.value)}
              disabled={loadingHospitals}
            >
              <option value="">All Hospitals</option>
              {hospitals.map((hospital, index) => (
                <option key={index} value={hospital}>
                  {hospital}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-purple-800 mb-2">Gender</label>
            <select 
              className="w-full px-3 py-2 rounded-lg border border-purple-300 bg-white text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              value={filters.gender}
              onChange={(e) => handleFilterChange("gender", e.target.value)}
            >
              <option value="">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex flex-col justify-end">
            <label className="text-sm font-medium text-purple-800 mb-2 invisible">Clear</label>
            <button 
              className="w-full px-3 py-2 rounded-lg border border-purple-300 bg-white text-purple-700 font-medium hover:bg-purple-50 hover:text-purple-800 transition-colors flex items-center justify-center text-sm"
              onClick={clearFilters}
              type="button"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-sm font-medium text-purple-800 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Search: "{filters.search}"
                  <button 
                    onClick={() => removeFilter("search")}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.specialty && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Specialty: {filters.specialty}
                  <button 
                    onClick={() => removeFilter("specialty")}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.hospital && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Hospital: {filters.hospital}
                  <button 
                    onClick={() => removeFilter("hospital")}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.gender && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Gender: {filters.gender}
                  <button 
                    onClick={() => removeFilter("gender")}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filterbar;