import React, { useState, useEffect, useMemo } from 'react';
import { FiMapPin, FiPlus, FiTrash2, FiEye, FiSearch, FiFilter,FiUsers, FiLoader, FiEdit, FiRefreshCw, FiAlertTriangle, FiChevronDown, FiChevronUp, FiHome, FiMail, FiPhone } from 'react-icons/fi';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/view_hospital_list/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHospitals(data);
      } else {
        console.error('Failed to fetch hospitals:', response.status);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const fetchHospitalDetails = async (hospitalId) => {
    try {
      const response = await fetch(`${API_BASE}/api/view_specific_hospital_info/${hospitalId}/`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedHospital(data);
      }
    } catch (error) {
      console.error('Error fetching hospital details:', error);
    }
  };

  const createHospital = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/api/create_hospital/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Hospital created successfully!');
        setShowCreateModal(false);
        setFormData({ name: '', address: '' });
        fetchHospitals();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create hospital.');
      }
    } catch (error) {
      console.error('Error creating hospital:', error);
      alert('An error occurred while creating the hospital.');
    } finally {
      setProcessing(false);
    }
  };

  const updateHospital = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/api/update_hospital/${selectedHospital.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Hospital updated successfully!');
        setShowCreateModal(false);
        setEditMode(false);
        setFormData({ name: '', address: '' });
        fetchHospitals();
        fetchHospitalDetails(selectedHospital.id);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update hospital.');
      }
    } catch (error) {
      console.error('Error updating hospital:', error);
      alert('An error occurred while updating the hospital.');
    } finally {
      setProcessing(false);
    }
  };

  const deleteHospital = async (hospitalId) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/api/delete_hospital/${hospitalId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Hospital deleted successfully!');
        fetchHospitals();
        setSelectedHospital(null);
        setDeleteConfirm(null);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete hospital.');
      }
    } catch (error) {
      console.error('Error deleting hospital:', error);
      alert('An error occurred while deleting the hospital.');
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

  const handleEdit = (hospital) => {
    setSelectedHospital(hospital);
    setFormData({
      name: hospital.name || '',
      address: hospital.address || ''
    });
    setEditMode(true);
    setShowCreateModal(true);
  };

  const handleCreateNew = () => {
    setFormData({ name: '', address: '' });
    setEditMode(false);
    setShowCreateModal(true);
  };

  // Calculate statistics
  const stats = useMemo(() => ({
    total: hospitals.length,
    withTherapists: hospitals.filter(hospital => hospital.therapist_count > 0).length,
    largeHospitals: hospitals.filter(hospital => 
      hospital.therapist_count && hospital.therapist_count >= 5
    ).length
  }), [hospitals]);

  // Filter and sort hospitals
  const filteredAndSortedHospitals = useMemo(() => {
    let filtered = hospitals.filter(hospital => {
      const matchesSearch = 
        hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

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
  }, [hospitals, searchTerm, sortConfig]);

  const getInitials = (name) => {
    if (!name) return 'H';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div id="admin-hospitals">
      <Navbar />
      <div className="min-h-screen bg-purple-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-purple-100">
                  <FiHome className="w-8 h-8 text-purple-800" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-purple-800">Hospital Management</h1>
                  <p className="text-purple-700 mt-1">Manage hospital information and locations</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Hospital
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{stats.total}</div>
                    <div className="text-purple-500 text-sm font-medium">Total Hospitals</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiHome className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.withTherapists}</div>
                    <div className="text-purple-500 text-sm font-medium">Active Hospitals</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiMapPin className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.largeHospitals}</div>
                    <div className="text-purple-500 text-sm font-medium">Large Facilities</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiUsers className="w-5 h-5 text-purple-600" />
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
                    placeholder="Search hospitals by name or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="text-sm text-gray-600 font-medium bg-purple-50 px-3 py-2 rounded-lg">
                  {filteredAndSortedHospitals.length} of {hospitals.length} hospitals
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Hospitals List */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-purple-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-purple-600" />
                  Hospital Directory
                </h2>
              </div>
              
              <div className="overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-6 bg-white border-b border-purple-200 text-xs font-semibold text-purple-500 uppercase tracking-wider">
                  <div 
                    className="col-span-5 flex items-center gap-2 cursor-pointer hover:text-purple-700 transition-colors" 
                    onClick={() => handleSort('name')}
                  >
                    Hospital Information
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="col-span-5">Address</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
                
                <div className="divide-y divide-purple-200 max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="p-8 text-center">
                      <FiLoader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                      <p className="text-purple-600">Loading hospitals...</p>
                    </div>
                  ) : filteredAndSortedHospitals.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiHome className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-purple-900 font-semibold mb-2">No hospitals found</h3>
                      <p className="text-purple-600 text-sm">
                        {hospitals.length === 0 
                          ? 'No hospitals have been added yet.'
                          : 'Try adjusting your search criteria.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredAndSortedHospitals.map((hospital) => (
                      <div 
                        key={hospital.id} 
                        className={`grid grid-cols-12 gap-4 p-6 hover:bg-purple-50 cursor-pointer transition-all duration-200 ${
                          selectedHospital?.id === hospital.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'border-l-4 border-l-transparent'
                        }`}
                        onClick={() => fetchHospitalDetails(hospital.id)}
                      >
                        <div className="col-span-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(hospital.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-purple-900 truncate">
                              {hospital.name || 'Unnamed Hospital'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">ID: {hospital.id}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-5">
                          <div className="text-purple-900 text-sm">
                            {hospital.address || 'No address provided'}
                          </div>
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchHospitalDetails(hospital.id);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                            title="View details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(hospital);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                            title="Edit hospital"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(hospital);
                            }}
                            className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                            title="Delete hospital"
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

            {/* Hospital Details Panel */}
            <div className="bg-white rounded-xl border border-purple-200 shadow-sm h-fit sticky top-8 overflow-hidden">
              <div className="p-6 border-b border-purple-200 bg-purple-50">
                <h2 className="text-xl font-semibold text-purple-900 flex items-center gap-2">
                  <FiEye className="w-5 h-5 text-purple-600" />
                  Hospital Details
                </h2>
              </div>
              
              {selectedHospital ? (
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 pb-6 border-b border-purple-200">
                      <div className="w-20 h-20 bg-purple-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                        {getInitials(selectedHospital.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-purple-900 text-xl mb-2">
                          {selectedHospital.name || 'Unnamed Hospital'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-purple-500 bg-purple-100 px-2 py-1 rounded">ID: {selectedHospital.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <FiMapPin className="w-4 h-4 text-purple-600" />
                        Location Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="p-2 bg-white rounded-lg border border-purple-200 mt-1">
                            <FiHome className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Hospital Name</p>
                            <p className="text-purple-900 font-medium">{selectedHospital.name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="p-2 bg-white rounded-lg border border-purple-200 mt-1">
                            <FiMapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Address</p>
                            <p className="text-purple-900 font-medium">{selectedHospital.address || 'No address provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Associated Therapists (if available in API response) */}
                    {selectedHospital.therapist_count > 0 && (
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                          <FiUsers className="w-4 h-4 text-purple-600" />
                          Associated Therapists
                        </h4>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Total Therapists</p>
                          <p className="text-purple-900 font-medium text-2xl">{selectedHospital.therapist_count || 0}</p>
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
                  <h3 className="text-purple-900 font-semibold mb-2">No Hospital Selected</h3>
                  <p className="text-purple-600 text-sm">Select a hospital from the list to view detailed information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Hospital Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-purple-200 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FiHome className="w-6 h-6 text-purple-800" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900">
                {editMode ? 'Edit Hospital' : 'Add New Hospital'}
              </h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Hospital Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter hospital name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter hospital address"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditMode(false);
                  setFormData({ name: '', address: '' });
                }}
                className="px-4 py-2 bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-300 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editMode ? updateHospital : createHospital}
                disabled={processing || !formData.name.trim() || !formData.address.trim()}
                className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-medium"
              >
                {processing ? <FiLoader className="w-4 h-4 animate-spin" /> : (editMode ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-purple-200 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FiAlertTriangle className="w-6 h-6 text-purple-800" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Delete Hospital</h3>
            </div>
            <p className="text-purple-700 mb-6">
              Are you sure you want to delete <span className="font-semibold text-purple-900">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-300 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteHospital(deleteConfirm.id)}
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

export default AdminHospitals;