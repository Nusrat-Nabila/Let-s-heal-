import React, { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiCheck, FiX, FiEye, FiLoader, FiUser, FiBook, FiMapPin, FiSearch, FiFilter, FiShield, FiCalendar, FiAward, FiHome, FiFileText, FiUsers } from 'react-icons/fi';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const TherapistRequests = () => {
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const API_BASE = 'http://localhost:8000';

  // Function to get file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    return `${API_BASE}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
  };

  useEffect(() => {
    fetchTherapistRequests();
    fetchHospitals();
  }, []);

  // Fetch hospitals list
  const fetchHospitals = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/view_hospital_list/`);
      if (response.ok) {
        const data = await response.json();
        setHospitals(data);
        console.log('Fetched hospitals:', data);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchTherapistRequests = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      const userRole = localStorage.getItem('user_role');

      if (!token || userRole !== 'admin') {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/list_therapist_request/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched requests:', data);
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/api/requested_therapist_info/${requestId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Request details:', data);
        setSelectedRequest(data);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const processRequest = async (requestId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this therapist request?`)) {
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE}/api/process_therapist_request/${requestId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        alert(`Request ${action}d successfully!`);
        fetchTherapistRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        label: 'Under Review'
      },
      'approved': { 
        color: 'bg-purple-50 text-purple-700 border-purple-200', 
        label: 'Approved'
      },
      'declined': { 
        color: 'bg-red-50 text-red-700 border-red-200', 
        label: 'Declined'
      }
    };
    
    const config = statusConfig[status] || { 
      color: 'bg-gray-50 text-gray-700 border-gray-200', 
      label: status
    };
    
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} flex items-center gap-1.5`}>
        {config.label}
      </span>
    );
  };

  // Function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // Function to display hospital names
  const displayHospitalNames = (request) => {
    if (!request.hospital) {
      return 'No hospital specified';
    }

    console.log('Hospital data for request:', request.id, request.hospital);

    // If it's an array of hospital IDs
    if (Array.isArray(request.hospital)) {
      if (request.hospital.length === 0) {
        return 'No hospitals selected';
      }

      // Check if first element is an object with name
      if (typeof request.hospital[0] === 'object' && request.hospital[0].name) {
        return request.hospital.map(hosp => hosp.name).join(', ');
      }

      // If it's an array of IDs, look up names from hospitals list
      const hospitalNames = request.hospital.map(hospitalId => {
        const hospital = hospitals.find(h => h.id === hospitalId);
        return hospital ? hospital.name : `Hospital ${hospitalId}`;
      });

      return hospitalNames.join(', ');
    }

    // If it's a single hospital object with name
    if (typeof request.hospital === 'object' && request.hospital.name) {
      return request.hospital.name;
    }

    // If it's a single ID, look up name from hospitals list
    if (typeof request.hospital === 'number' || (typeof request.hospital === 'string' && !isNaN(request.hospital))) {
      const hospital = hospitals.find(h => h.id == request.hospital);
      return hospital ? hospital.name : `Hospital ${request.hospital}`;
    }

    // Fallback
    return `Hospital ${request.hospital}`;
  };

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(req => req.status === 'pending').length,
    approved: requests.filter(req => req.status === 'approved').length,
    declined: requests.filter(req => req.status === 'declined').length
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         displayHospitalNames(request)?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="therapist-requests">
      <Navbar />
      <div className="min-h-screen bg-purple-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with improved styling */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-purple-100">
                    <FiShield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-purple-900">Therapist Registration Requests</h1>
                    <p className="text-purple-600 mt-1">
                      Review and manage therapist applications
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="flex items-center gap-4">
                <div className="bg-white px-4 py-3 rounded-xl border border-purple-200 shadow-sm min-w-24 text-center">
                  <div className="text-xl font-bold text-purple-900">{stats.total}</div>
                  <div className="text-purple-500 text-sm font-medium">Total</div>
                </div>
                <div className="bg-purple-50 px-4 py-3 rounded-xl border border-purple-200 shadow-sm min-w-24 text-center">
                  <div className="text-xl font-bold text-purple-900">{stats.pending}</div>
                  <div className="text-purple-600 text-sm font-medium">Pending</div>
                </div>
                <div className="bg-purple-50 px-4 py-3 rounded-xl border border-purple-200 shadow-sm min-w-24 text-center">
                  <div className="text-xl font-bold text-purple-900">{stats.approved}</div>
                  <div className="text-purple-600 text-sm font-medium">Approved</div>
                </div>
              </div>
            </div>

            {/* Search and Filter Card */}
            <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name, email, specialization, or hospitals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 px-3 py-2.5 border border-purple-300 rounded-lg bg-purple-50">
                    <FiFilter className="w-4 h-4 text-purple-600" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent focus:outline-none text-purple-800 font-medium"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>

                  <div className="text-sm text-purple-600 font-medium bg-purple-50 px-3 py-2 rounded-lg">
                    {filteredRequests.length} of {requests.length} requests
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Requests List */}
            <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-purple-200 bg-purple-50">
                <h2 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-purple-600" />
                  Application Queue
                </h2>
              </div>
              
              <div className="divide-y divide-purple-200 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <FiLoader className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-purple-600">Loading requests...</p>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiUser className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-purple-900 font-semibold mb-2">No requests found</h3>
                    <p className="text-purple-600 text-sm">
                      {requests.length === 0 
                        ? 'No therapist registration requests have been submitted yet.'
                        : 'Try adjusting your search or filter criteria.'
                      }
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className={`p-6 hover:bg-purple-50 cursor-pointer transition-all duration-200 ${
                        selectedRequest?.id === request.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : 'border-l-4 border-l-transparent'
                      }`}
                      onClick={() => fetchRequestDetails(request.id)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            {request.image ? (
                              <img 
                                src={getImageUrl(request.image)} 
                                alt={request.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {request.name?.charAt(0) || 'T'}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-purple-900 truncate">{request.name}</h3>
                              <p className="text-purple-500 text-sm truncate">{request.email}</p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-purple-600">
                              <FiAward className="w-4 h-4 text-purple-500" />
                              <span className="truncate">{request.specialization}</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-600">
                              <FiCalendar className="w-4 h-4 text-purple-500" />
                              <span>{request.year_of_experience} years experience</span>
                            </div>
                          </div>
                          
                          {/* Hospital Names Information */}
                          <div className="flex items-center gap-2 text-purple-600 text-sm mt-2">
                            <FiHome className="w-4 h-4 text-purple-500" />
                            <span className="truncate">
                              Hospitals: {displayHospitalNames(request)}
                            </span>
                          </div>

                          {request.phone && (
                            <div className="flex items-center gap-2 text-purple-600 text-sm mt-2">
                              <FiPhone className="w-4 h-4 text-purple-500" />
                              <span>{request.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchRequestDetails(request.id);
                          }}
                          className="p-2 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                          title="View details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Details Panel */}
            <div className="bg-white rounded-xl border border-purple-200 shadow-sm h-fit sticky top-8 overflow-hidden">
              <div className="p-6 border-b border-purple-200 bg-purple-50">
                <h2 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                  <FiEye className="w-5 h-5 text-purple-600" />
                  Application Details
                </h2>
              </div>
              
              {selectedRequest ? (
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Header with profile image and status */}
                    <div className="flex items-start gap-4">
                      {/* Profile Image */}
                      {selectedRequest.image ? (
                        <img 
                          src={getImageUrl(selectedRequest.image)} 
                          alt={selectedRequest.name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-purple-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-purple-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                          {selectedRequest.name?.charAt(0) || 'T'}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-purple-900">{selectedRequest.name}</h3>
                            <p className="text-purple-600">{selectedRequest.email}</p>
                          </div>
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Card */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-purple-600" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Contact Number</label>
                          <p className="text-purple-900 font-medium">{selectedRequest.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Gender</label>
                          <p className="text-purple-900 font-medium capitalize">{selectedRequest.gender || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Professional Information Card */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <FiAward className="w-4 h-4 text-purple-600" />
                        Professional Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Qualification</label>
                          <p className="text-purple-900 font-medium">{selectedRequest.qualification}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Specialization</label>
                          <p className="text-purple-900 font-medium">{selectedRequest.specialization}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Years of Experience</label>
                          <p className="text-purple-900 font-medium">{selectedRequest.year_of_experience} years</p>
                        </div>
                      </div>
                    </div>

                    {/* Hospital Information Card */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <FiHome className="w-4 h-4 text-purple-600" />
                        Hospital Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-purple-500 uppercase tracking-wide mb-1">Associated Hospitals</label>
                          <p className="text-purple-900 font-medium">{displayHospitalNames(selectedRequest)}</p>
                        </div>
                      </div>
                    </div>

                    {/* License PDF Card */}
                    {selectedRequest.licence_pdf && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                          <FiFileText className="w-4 h-4 text-purple-600" />
                          License Document
                        </h4>
                        <div className="flex items-center gap-3">
                          <FiFileText className="w-8 h-8 text-purple-600" />
                          <div className="flex-1">
                            <p className="text-purple-900 font-medium">Professional License PDF</p>
                            <p className="text-purple-600 text-sm">Uploaded document</p>
                          </div>
                          <a
                            href={getFileUrl(selectedRequest.licence_pdf)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            View PDF
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {selectedRequest.status === 'pending' && (
                      <div className="pt-4 border-t border-purple-200">
                        <div className="flex gap-3">
                          <button
                            onClick={() => processRequest(selectedRequest.id, 'approve')}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 font-semibold shadow-sm"
                          >
                            {processing ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
                            Approve Application
                          </button>
                          <button
                            onClick={() => processRequest(selectedRequest.id, 'decline')}
                            disabled={processing}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 font-semibold shadow-sm"
                          >
                            <FiX className="w-4 h-4" />
                            Decline
                          </button>
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
                  <h3 className="text-purple-900 font-semibold mb-2">Select an Application</h3>
                  <p className="text-purple-700 text-sm">Choose a therapist request from the list to view detailed information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TherapistRequests;