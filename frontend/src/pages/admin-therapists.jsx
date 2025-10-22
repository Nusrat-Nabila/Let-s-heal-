import React, { useState, useEffect, useMemo } from 'react';
import { FiUsers, FiMail, FiPhone, FiTrash2, FiEye, FiSearch, FiFilter, FiLoader, FiUser, FiCalendar, FiRefreshCw, FiAlertTriangle, FiChevronDown, FiChevronUp, FiEdit, FiImage, FiStar, FiAward, FiMapPin } from 'react-icons/fi';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const AdminTherapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const userRole = localStorage.getItem('user_role');

      if (!token || userRole !== 'admin') {
        console.error('Unauthorized access attempt');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/search_therapist/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTherapists(data);
      } else {
        console.error('Failed to fetch therapists:', response.status);
      }
    } catch (error) {
      console.error('Error fetching therapists:', error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const fetchTherapistDetails = async (therapistId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/view_therapist_profile/${therapistId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedTherapist(data);
      }
    } catch (error) {
      console.error('Error fetching therapist details:', error);
    }
  };

  const deleteTherapist = async (therapistId) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/api/delete_therapist/${therapistId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Therapist deleted successfully!');
        fetchTherapists();
        setSelectedTherapist(null);
        setDeleteConfirm(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete therapist.');
      }
    } catch (error) {
      console.error('Error deleting therapist:', error);
      alert('An error occurred while deleting the therapist.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // Calculate statistics
  const stats = useMemo(() => ({
    total: therapists.length,
    active: therapists.filter(therapist => therapist.therapist_status === 'Available' || therapist.is_active !== false).length,
    experienced: therapists.filter(therapist => 
      therapist.year_of_experience && parseInt(therapist.year_of_experience) >= 5
    ).length,
    specialized: therapists.filter(therapist => 
      therapist.therapist_specialization && therapist.therapist_specialization !== 'General'
    ).length
  }), [therapists]);

  // Filter and sort therapists - Database data first
  const filteredAndSortedTherapists = useMemo(() => {
    let filtered = therapists.filter(therapist => {
      const matchesSearch = 
        therapist.therapist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.therapist_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.therapist_specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapist.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && (therapist.therapist_status === 'Available' || therapist.is_active !== false)) ||
        (statusFilter === 'inactive' && therapist.therapist_status === 'Unavailable');
      
      return matchesSearch && matchesStatus;
    });

    // Sorting - Database data first, then by other criteria
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [therapists, searchTerm, statusFilter, sortConfig]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Unavailable':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div id="admin-therapist">
      <Navbar />
      <div className="min-h-screen bg-purple-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-purple-100">
                  <FiUsers className="w-8 h-8 text-purple-800" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-purple-800">Therapist Management</h1>
                  <p className="text-purple-700 mt-1">Manage and monitor therapist accounts</p>
                </div>
              </div>
              
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{stats.total}</div>
                    <div className="text-purple-500 text-sm font-medium">Total Therapists</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUsers className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.active}</div>
                    <div className="text-purple-500 text-sm font-medium">Available Now</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUser className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.experienced}</div>
                    <div className="text-purple-500 text-sm font-medium">5+ Years Experience</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiAward className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.specialized}</div>
                    <div className="text-purple-500 text-sm font-medium">Specialized</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiStar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 bg-white rounded-xl border border-purple-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search therapists by name, specialty, hospital..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2 px-3 py-2.5 border border-purple-300 rounded-lg bg-purple-50">
                  <FiFilter className="w-4 h-4 text-purple-600" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent focus:outline-none text-purple-800 font-medium"
                  >
                    <option value="all">All Therapists</option>
                    <option value="active">Available Only</option>
                    <option value="inactive">Unavailable</option>
                  </select>
                </div>

                <div className="text-sm text-gray-600 font-medium bg-purple-50 px-3 py-2 rounded-lg">
                  {filteredAndSortedTherapists.length} of {therapists.length} therapists
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Therapists List */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-purple-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-purple-600" />
                  Therapist Directory
                </h2>
              </div>
              
              <div className="overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-6 bg-white border-b border-purple-200 text-xs font-semibold text-purple-500 uppercase tracking-wider">
                  <div 
                    className="col-span-5 flex items-center gap-2 cursor-pointer hover:text-purple-700 transition-colors" 
                    onClick={() => handleSort('therapist_name')}
                  >
                    Therapist Information
                    {sortConfig.key === 'therapist_name' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-3">Specialization & Hospital</div>
                  <div 
                    className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-purple-700 transition-colors"
                    onClick={() => handleSort('year_of_experience')}
                  >
                    Experience
                    {sortConfig.key === 'year_of_experience' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
                
                <div className="divide-y divide-purple-200 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <FiLoader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                      <p className="text-purple-600">Loading therapists...</p>
                    </div>
                  ) : filteredAndSortedTherapists.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiUser className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-purple-900 font-semibold mb-2">No therapists found</h3>
                      <p className="text-purple-600 text-sm">
                        {therapists.length === 0 
                          ? 'No therapist accounts have been created yet.'
                          : 'Try adjusting your search or filter criteria.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredAndSortedTherapists.map((therapist) => (
                      <div 
                        key={therapist.id} 
                        className={`grid grid-cols-12 gap-4 p-6 hover:bg-purple-50 cursor-pointer transition-all duration-200 ${
                          selectedTherapist?.id === therapist.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'border-l-4 border-l-transparent'
                        }`}
                        onClick={() => fetchTherapistDetails(therapist.id)}
                      >
                        <div className="col-span-5 flex items-center gap-4">
                          {/* Therapist Image */}
                          {therapist.therapist_image ? (
                            <img 
                              src={getImageUrl(therapist.therapist_image)} 
                              alt={therapist.therapist_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-12 h-12 bg-purple-800 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              therapist.therapist_image ? 'hidden' : 'flex'
                            }`}
                          >
                            {getInitials(therapist.therapist_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-purple-900 truncate">
                              {therapist.therapist_name || 'Unnamed Therapist'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">ID: {therapist.id}</span>
                              {therapist.therapist_gender && therapist.therapist_gender !== 'no choice' && (
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full capitalize">
                                  {therapist.therapist_gender}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(therapist.therapist_status)}`}>
                                {therapist.therapist_status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-3">
                          <div className="text-purple-900 font-medium mb-1 truncate">
                            {therapist.therapist_specialization || 'General Therapist'}
                          </div>
                          {therapist.hospital_name && (
                            <div className="flex items-center gap-1 text-purple-600 text-sm">
                              <FiMapPin className="w-3 h-3 text-purple-500" />
                              <span className="truncate">{therapist.hospital_name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="col-span-2 flex items-center text-purple-500 text-sm">
                          <FiAward className="w-4 h-4 mr-2 text-purple-500" />
                          {therapist.year_of_experience || '0'}+ years
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchTherapistDetails(therapist.id);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                            title="View details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(therapist);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                            title="Delete therapist"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Therapist Details Panel */}
            <div className="bg-white rounded-xl border border-purple-200 shadow-sm h-fit sticky top-8 overflow-hidden">
              <div className="p-6 border-b border-purple-200 bg-purple-50">
                <h2 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                  <FiEye className="w-5 h-5 text-purple-600" />
                  Therapist Details
                </h2>
              </div>
              
              {selectedTherapist ? (
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Header with Profile Image */}
                    <div className="flex items-start gap-4 pb-6 border-b border-purple-200">
                      {selectedTherapist.therapist_image ? (
                        <img 
                          src={getImageUrl(selectedTherapist.therapist_image)} 
                          alt={selectedTherapist.therapist_name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-purple-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                          {getInitials(selectedTherapist.therapist_name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-purple-900 text-xl mb-2">
                          {selectedTherapist.therapist_name || 'Unnamed Therapist'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-purple-500 bg-purple-100 px-2 py-1 rounded">ID: {selectedTherapist.id}</span>
                          {selectedTherapist.therapist_gender && selectedTherapist.therapist_gender !== 'no choice' && (
                            <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded capitalize">
                              {selectedTherapist.therapist_gender}
                            </span>
                          )}
                          <span className={`text-sm px-2 py-1 rounded ${getStatusBadge(selectedTherapist.therapist_status)}`}>
                            {selectedTherapist.therapist_status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <FiAward className="w-4 h-4 text-purple-600" />
                        Professional Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="p-2 bg-white rounded-lg border border-purple-200">
                            <FiStar className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Specialization</p>
                            <p className="text-purple-900 font-medium">{selectedTherapist.therapist_specialization || 'General Therapist'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="p-2 bg-white rounded-lg border border-purple-200">
                            <FiAward className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Experience</p>
                            <p className="text-purple-900 font-medium">{selectedTherapist.year_of_experience || '0'}+ years</p>
                          </div>
                        </div>
                        {selectedTherapist.therapist_qualification && (
                          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="p-2 bg-white rounded-lg border border-purple-200">
                              <FiUser className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Qualification</p>
                              <p className="text-purple-900 font-medium">{selectedTherapist.therapist_qualification}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-purple-600" />
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="p-2 bg-white rounded-lg border border-purple-200">
                            <FiMail className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Email Address</p>
                            <p className="text-purple-900 font-medium">{selectedTherapist.therapist_email}</p>
                          </div>
                        </div>
                        {selectedTherapist.therapist_phone && (
                          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="p-2 bg-white rounded-lg border border-purple-200">
                              <FiPhone className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Phone Number</p>
                              <p className="text-purple-900 font-medium">{selectedTherapist.therapist_phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hospital Information */}
                    {(selectedTherapist.hospital_name || selectedTherapist.hospital_address) && (
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                          <FiMapPin className="w-4 h-4 text-purple-600" />
                          Practice Location
                        </h4>
                        <div className="space-y-3">
                          {selectedTherapist.hospital_name && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Hospital Name</p>
                              <p className="text-purple-900 font-medium">{selectedTherapist.hospital_name}</p>
                            </div>
                          )}
                          {selectedTherapist.hospital_address && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Address</p>
                              <p className="text-purple-900 font-medium">{selectedTherapist.hospital_address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiEye className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-purple-900 font-semibold mb-2">No Therapist Selected</h3>
                  <p className="text-purple-600 text-sm">Select a therapist from the list to view detailed information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-purple-200 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-purple-800" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Delete Therapist</h3>
            </div>
            <p className="text-purple-700 mb-6">
              Are you sure you want to delete <span className="font-semibold text-purple-900">{deleteConfirm.therapist_name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-300 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTherapist(deleteConfirm.id)}
                disabled={processing}
                className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
              >
                {processing ? <FiLoader className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminTherapists;