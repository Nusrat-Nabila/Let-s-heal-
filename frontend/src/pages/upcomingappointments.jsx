import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Hospital, X, AlertCircle, CheckCircle, User, MapPin, ExternalLink, Video, Users, Search, Filter } from 'lucide-react';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const UpcomingAppointments = () => {
  const [previousAppointments, setPreviousAppointments] = useState([]);
  const [currentAppointments, setCurrentAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [cancelling, setCancelling] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [consultationType, setConsultationType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const API_BASE_URL = 'http://localhost:8000';

  const getAuthToken = () => {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('access_token') ||
                  localStorage.getItem('access') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken') ||
                  '';
    return token;
  };

  // Fetch therapist profile details
  const fetchTherapistProfile = async (therapistId) => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const authHeader = token.includes('.') ? `Bearer ${token}` : `Token ${token}`;
      
      const response = await fetch(
        `${API_BASE_URL}/api/view_therapist_profile/${therapistId}/`, 
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching therapist profile:', error);
      return null;
    }
  };

  // Process image URL - handle relative URLs
  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    return `${API_BASE_URL}/${imageUrl}`;
  };

  // Process appointments and fetch therapist details
  const processAppointments = async (appointments) => {
    const processedAppointments = [];
    
    for (const appointment of appointments) {
      let therapistData = appointment.therapist;
      const therapistId = appointment.therapist_id || appointment.therapist?.id;

      if (therapistId && (!therapistData || !therapistData.therapist_image || !therapistData.therapist_name)) {
        const therapistProfile = await fetchTherapistProfile(therapistId);
        if (therapistProfile) {
          const imageUrl = therapistProfile.image || therapistProfile.therapist_image || therapistProfile.profile_picture;
          const processedImageUrl = processImageUrl(imageUrl);
          
          therapistData = {
            ...therapistData,
            ...therapistProfile,
            therapist_image: processedImageUrl,
            therapist_name: therapistProfile.name || therapistProfile.therapist_name || therapistProfile.full_name,
            therapist_specialization: therapistProfile.specialization || therapistProfile.therapist_specialization || therapistProfile.area_of_expertise,
            year_of_experience: therapistProfile.experience || therapistProfile.year_of_experience || therapistProfile.years_of_experience
          };
        }
      } else if (therapistData && therapistData.therapist_image) {
        therapistData.therapist_image = processImageUrl(therapistData.therapist_image);
      }
      
      processedAppointments.push({
        ...appointment,
        therapist: therapistData,
        therapist_id: therapistId
      });
    }
    
    return processedAppointments;
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      const authHeader = token.includes('.') ? `Bearer ${token}` : `Token ${token}`;
      
      const headers = {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      };

      const [prevResponse, currentResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customer_appointment_prev_history/`, { headers }),
        fetch(`${API_BASE_URL}/api/customer_appointment_current_history/`, { headers })
      ]);

      if (!prevResponse.ok) throw new Error('Failed to fetch previous appointments');
      if (!currentResponse.ok) throw new Error('Failed to fetch current appointments');

      const prevData = await prevResponse.json();
      const currentData = await currentResponse.json();

      const processedPrev = await processAppointments(Array.isArray(prevData) ? prevData : []);
      const processedCurrent = await processAppointments(Array.isArray(currentData) ? currentData : []);

      setPreviousAppointments(processedPrev);
      setCurrentAppointments(processedCurrent);
      setFilteredAppointments(processedCurrent);

    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const appointments = activeTab === 'current' ? currentAppointments : previousAppointments;
    
    let filtered = appointments.filter(appointment => {
      // Search term filter (therapist name)
      const matchesSearch = searchTerm === '' || 
        (appointment.therapist?.therapist_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Consultation type filter - FIXED
      const matchesType = consultationType === 'all' || 
        appointment.consultation_type?.toLowerCase() === consultationType.toLowerCase();
      
      // Date filter
      const matchesDate = dateFilter === '' || 
        appointment.appointment_date === dateFilter;
      
      return matchesSearch && matchesType && matchesDate;
    });
    
    setFilteredAppointments(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setConsultationType('all');
    setDateFilter('');
    setFilteredAppointments(activeTab === 'current' ? currentAppointments : previousAppointments);
  };

  // Update filtered appointments when tab changes
  useEffect(() => {
    const appointments = activeTab === 'current' ? currentAppointments : previousAppointments;
    setFilteredAppointments(appointments);
    // Reset filters when tab changes
    setSearchTerm('');
    setConsultationType('all');
    setDateFilter('');
  }, [activeTab, currentAppointments, previousAppointments]);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, consultationType, dateFilter, activeTab]);

  // FIXED: Cancel appointment function
  const handleCancelAppointment = async (appointmentId) => {
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
      return;
    }

    setCancelling(appointmentId);
    setError('');
    setSuccess('');
    
    try {
      const token = getAuthToken();
      const authHeader = token.includes('.') ? `Bearer ${token}` : `Token ${token}`;
      
      // FIXED: Use DELETE method instead of POST
      const response = await fetch(
        `${API_BASE_URL}/api/cancel_appointment/${appointmentId}/`, 
        {
          method: 'DELETE', // CHANGED FROM POST TO DELETE
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel appointment');
      }

      setSuccess('Appointment cancelled successfully');
      // Refresh appointments
      await fetchAppointments();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
      // Clear error after 10 seconds
      setTimeout(() => setError(''), 10000);
    } finally {
      setCancelling(null);
    }
  };

  // Check if appointment can be cancelled (within 5 hours)
  const canCancelAppointment = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff <= 5;
  };

  // Get hours remaining for cancellation
  const getHoursRemaining = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    const remaining = 5 - hoursDiff;
    return remaining > 0 ? remaining.toFixed(1) : 0;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  // Format created date
  const formatCreatedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get therapist initials for avatar
  const getTherapistInitials = (name) => {
    if (!name) return 'T';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle image error
  const handleImageError = (e, therapistId) => {
    setImageErrors(prev => ({
      ...prev,
      [therapistId]: true
    }));
  };

  // Check if image should be shown
  const shouldShowImage = (therapistId, imageUrl) => {
    return imageUrl && !imageErrors[therapistId];
  };

  // View therapist profile
  const handleViewTherapistProfile = (therapistId) => {
    if (therapistId) {
      window.open(`${API_BASE_URL}/api/view_therapist_profile/${therapistId}/`, '_blank');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Appointment Card Component
  const AppointmentCard = ({ appointment, showCancelButton }) => {
    const canCancel = canCancelAppointment(appointment.created_at);
    const hoursLeft = getHoursRemaining(appointment.created_at);
    const isOnline = appointment.consultation_type === 'Online';
    const therapist = appointment.therapist || {};
    const therapistId = appointment.therapist_id;

    return (
      <div id="upcoming-appointments" className="bg-white rounded-xl shadow-md border border-purple-200 p-4 hover:shadow-lg transition-all duration-200">
        {/* Header with Consultation Type */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isOnline ? 'bg-purple-100 text-purple-600' : 'bg-purple-100 text-purple-600'}`}>
              {isOnline ? <Video size={16} /> : <Users size={16} />}
            </div>
            <span className={`text-xs font-semibold ${isOnline ? 'text-purple-800' : 'text-purple-900'}`}>
              {appointment.consultation_type}
            </span>
          </div>
        </div>

        {/* Therapist Information */}
        {therapistId && (
          <div 
            className="flex items-center gap-3 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer group"
            onClick={() => handleViewTherapistProfile(therapistId)}
          >
            <div className="flex-shrink-0">
              {shouldShowImage(therapistId, therapist.therapist_image) ? (
                <img 
                  src={therapist.therapist_image} 
                  alt={therapist.therapist_name || 'Therapist'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                  onError={(e) => handleImageError(e, therapistId)}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-purple-800 flex items-center justify-center border-2 border-purple-300">
                  <span className="text-white font-bold text-sm">
                    {getTherapistInitials(therapist.therapist_name)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {therapist.therapist_name || 'Therapist Name'}
                </h4>
                <ExternalLink size={12} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
              <p className="text-purple-600 text-xs truncate">
                {therapist.therapist_specialization || 'Mental Health Professional'}
              </p>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-purple-500" />
              <span className="font-medium text-purple-900">{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-purple-500" />
              <span className="font-medium text-purple-900">{formatTime(appointment.appointment_time)}</span>
            </div>
          </div>

          {/* Hospital */}
          <div className="flex items-center gap-2 text-sm">
            <Hospital size={14} className="text-purple-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-purple-900 truncate">
                {appointment.hospital?.name || 'N/A'}
              </p>
              {appointment.hospital?.location && (
                <p className="text-xs text-purple-600 flex items-center gap-1 truncate">
                  <MapPin size={10} />
                  {appointment.hospital.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-purple-200">
          <div className="flex justify-between items-center text-xs">
            <div className="text-purple-500">
              Booked: {formatCreatedDate(appointment.created_at)}
            </div>
            {showCancelButton && canCancel && hoursLeft < 2 && (
              <div className="text-purple-800 font-medium">
                {hoursLeft}h left to cancel
              </div>
            )}
          </div>
        </div>

        {/* Cancellation Section - Button and Warning */}
        {showCancelButton && (
          <div className="mt-4 space-y-2">
            {canCancel ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleCancelAppointment(appointment.id)}
                  disabled={cancelling === appointment.id}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    cancelling === appointment.id
                      ? 'bg-gray-300 cursor-not-allowed text-purple-800'
                      : 'bg-purple-800 hover:bg-purple-600 text-white'
                  }`}
                >
                  {cancelling === appointment.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <X size={16} />
                      <span>Cancel Appointment</span>
                    </>
                  )}
                </button>
                {hoursLeft < 2 && (
                  <div className="text-center text-purple-600 text-xs font-medium">
                    Only {hoursLeft} hours remaining to cancel
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-purple-100 border border-purple-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Cancellation period expired</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-purple-200 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-purple-800 mb-2">My Appointments</h1>
            <p className="text-purple-700">Manage and view your scheduled appointments</p>
          </div>

          {/* Tabs Section */}
          <div className="bg-purple-50 rounded-xl shadow-sm mb-6 p-1 border border-purple-200 max-w-md mx-auto">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('current')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'current'
                    ? 'bg-purple-800 text-purple-50 shadow-sm'
                    : 'text-purple-800 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Current</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'current' ? 'bg-purple-200 text-purple-800' : 'bg-purple-800 text-purple-200'
                  }`}>
                    {currentAppointments.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('previous')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'previous'
                    ? 'bg-purple-800 text-purple-50 shadow-sm'
                    : 'text-purple-800 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Previous</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'previous' ? 'bg-purple-200 text-purple-800' : 'bg-purple-800 text-purple-200'
                  }`}>
                    {previousAppointments.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-purple-50 rounded-xl shadow-sm mb-6 p-4 border border-purple-200">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              {/* Search by Therapist Name */}
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Search Therapist
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-700" size={18} />
                  <input
                    type="text"
                    placeholder="Search by therapist name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Consultation Type Filter */}
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Consultation Type
                </label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-purple-800 mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Reset Filters Button */}
              <div className="w-full lg:w-auto">
                <button
                  onClick={resetFilters}
                  className="w-full lg:w-auto px-4 py-2 border bg-purple-800 text-purple-50 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Filter size={16} />
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-purple-700">
                Showing {filteredAppointments.length} of {activeTab === 'current' ? currentAppointments.length : previousAppointments.length} appointments
              </span>
              {(searchTerm || consultationType !== 'all' || dateFilter) && (
                <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                  Filters Active
                </span>
              )}
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="font-medium text-red-900 text-sm">Error</p>
                <p className="text-red-800 text-xs">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-purple-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="font-medium text-purple-900 text-sm">Success</p>
                <p className="text-purple-800 text-xs">{success}</p>
              </div>
              <button 
                onClick={() => setSuccess('')}
                className="text-purple-500 hover:text-purple-700"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16 bg-purple-200 rounded-xl shadow-sm border border-gray-200">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-700 font-medium">Loading your appointments...</p>
            </div>
          ) : (
            <>
              {/* Current Appointments */}
              {activeTab === 'current' && (
                <div className="animate-fade-in">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-16 bg-purple-50 rounded-xl shadow-sm border border-purple-200">
                      <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-purple-800" />
                      </div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">
                        {currentAppointments.length === 0 ? 'No Upcoming Appointments' : 'No Matching Appointments'}
                      </h3>
                      <p className="text-purple-600 text-sm">
                        {currentAppointments.length === 0 
                          ? "You don't have any scheduled appointments at the moment."
                          : "Try adjusting your filters to see more results."
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          showCancelButton={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Previous Appointments */}
              {activeTab === 'previous' && (
                <div className="animate-fade-in">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-purple-800 mb-2">
                        {previousAppointments.length === 0 ? 'No Previous Appointments' : 'No Matching Appointments'}
                      </h3>
                      <p className="text-purple-800 text-sm">
                        {previousAppointments.length === 0 
                          ? "Your appointment history will appear here."
                          : "Try adjusting your filters to see more results."
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAppointments.map((appointment) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          showCancelButton={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UpcomingAppointments;