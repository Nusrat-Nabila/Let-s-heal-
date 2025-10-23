import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Hospital, User, MapPin, Video, Users, Search, Filter, Mail, Phone, AlertCircle } from 'lucide-react';
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const CurrentAppointment = () => {
  const [previousAppointments, setPreviousAppointments] = useState([]);
  const [currentAppointments, setCurrentAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  
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

  // Fetch customer profile details from API
  const fetchCustomerProfile = async (customerId) => {
    try {
      const token = getAuthToken();
      if (!token || !customerId) return null;

      const authHeader = token.startsWith('Bearer ') || token.startsWith('Token ') ? token : `Bearer ${token}`;
      
      const response = await fetch(
        `${API_BASE_URL}/api/view_customer_profile/${customerId}/`, 
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Customer profile data:', data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
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

  // Process appointments and fetch customer details
  const processAppointments = async (appointments) => {
    const processedAppointments = [];
    
    for (const appointment of appointments) {
      let customerData = appointment.customer;
      const customerId = appointment.customer_id || appointment.customer?.id;

      // If customer ID exists but customer data is incomplete, fetch customer profile
      if (customerId && (!customerData || !customerData.customer_image || !customerData.customer_name)) {
        const customerProfile = await fetchCustomerProfile(customerId);
        if (customerProfile) {
          const imageUrl = customerProfile.image || customerProfile.customer_image || customerProfile.profile_picture;
          const processedImageUrl = processImageUrl(imageUrl);
          
          customerData = {
            ...customerData,
            ...customerProfile,
            customer_image: processedImageUrl,
            customer_name: customerProfile.name || customerProfile.customer_name || customerProfile.full_name,
            customer_email: customerProfile.email || customerProfile.customer_email,
            customer_phone: customerProfile.phone || customerProfile.customer_phone
          };
        }
      } else if (customerData && customerData.customer_image) {
        // Process existing image URL
        customerData.customer_image = processImageUrl(customerData.customer_image);
      }
      
      processedAppointments.push({
        ...appointment,
        customer: customerData,
        customer_id: customerId
      });
    }
    
    return processedAppointments;
  };

  // Fetch appointments for therapist
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

      const authHeader = token.startsWith('Bearer ') || token.startsWith('Token ') ? token : `Bearer ${token}`;
      
      const headers = {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      };

      // Fetch current appointments
      const currentResponse = await fetch(`${API_BASE_URL}/api/therapist_appointment_current_history/`, { headers });

      if (!currentResponse.ok) {
        const errorText = await currentResponse.text();
        throw new Error(`Failed to fetch current appointments: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();

      // Fetch previous appointments
      let prevData = [];
      try {
        const prevResponse = await fetch(`${API_BASE_URL}/api/therapist_appointment_prev_history/`, { headers });
        if (prevResponse.ok) {
          prevData = await prevResponse.json();
        }
      } catch (prevError) {
        console.warn('Could not fetch previous appointments:', prevError);
      }

      // Process data with customer profiles
      const processedPrev = await processAppointments(Array.isArray(prevData) ? prevData : []);
      const processedCurrent = await processAppointments(Array.isArray(currentData) ? currentData : []);

      setPreviousAppointments(processedPrev);
      setCurrentAppointments(processedCurrent);
      setFilteredAppointments(processedCurrent);

    } catch (err) {
      console.error('Fetch appointments error:', err);
      setError(err.message || 'Failed to load appointments. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const appointments = activeTab === 'current' ? currentAppointments : previousAppointments;
    
    let filtered = appointments.filter(appointment => {
      // Search term filter (customer name)
      const customerName = appointment.customer?.customer_name || '';
      const matchesSearch = searchTerm === '' || 
        customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Consultation type filter
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

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (timeString) {
      try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      } catch (error) {
        return timeString;
      }
    }
    return 'No Time';
  };

  // Format created date
  const formatCreatedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get customer initials for avatar
  const getCustomerInitials = (name) => {
    if (!name || name === 'Patient') return 'P';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate random color for avatar background
  const getRandomColor = (customerId) => {
    const colors = [
      'bg-purple-800'
    ];
    const index = customerId ? customerId % colors.length : 0;
    return colors[index];
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Appointment Card Component
  const AppointmentCard = ({ appointment }) => {
    const [imageErrors, setImageErrors] = useState({});
    const isOnline = appointment.consultation_type === 'Online';
    const customer = appointment.customer || {};
    const customerId = appointment.customer_id;

    const handleImageError = (customerId) => {
      setImageErrors(prev => ({
        ...prev,
        [customerId]: true
      }));
    };

    const shouldShowImage = (customerId, imageUrl) => {
      return imageUrl && !imageErrors[customerId];
    };

    return (
      <div id="current-appointment" className="bg-white rounded-xl shadow-md border border-purple-200 p-4 hover:shadow-lg transition-all duration-200">
        {/* Header with Consultation Type */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isOnline ? 'bg-purple-100 text-purple-600' : 'bg-purple-100 text-purple-600'}`}>
              {isOnline ? <Video size={16} /> : <Users size={16} />}
            </div>
            <span className={`text-xs font-semibold ${isOnline ? 'text-purple-800' : 'text-purple-900'}`}>
              {appointment.consultation_type || 'Not Specified'}
            </span>
          </div>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
            {appointment.appointment_type || 'Regular'}
          </span>
        </div>

        {/* Customer Information */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex-shrink-0">
            {customer.customer_image && shouldShowImage(customerId, customer.customer_image) ? (
              <img 
                src={customer.customer_image} 
                alt={customer.customer_name || 'Patient'}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-300"
                onError={() => handleImageError(customerId)}
              />
            ) : (
              <div className={`w-16 h-16 rounded-full ${getRandomColor(customerId)} flex items-center justify-center border-2 border-purple-300`}>
                <span className="text-white font-bold text-sm">
                  {getCustomerInitials(customer.customer_name)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {customer.customer_name || 'Patient Name Not Available'}
            </h4>
            <div className="flex flex-col gap-1 mt-1">
              {customer.customer_email && customer.customer_email !== 'N/A' && (
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <Mail size={10} />
                  <span className="truncate">{customer.customer_email}</span>
                </div>
              )}
              {customer.customer_phone && customer.customer_phone !== 'N/A' && (
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <Phone size={10} />
                  <span>{customer.customer_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3">
          {/* Date and Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-purple-500" />
              <span className="font-medium text-purple-900">
                {formatDate(appointment.appointment_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-purple-500" />
              <span className="font-medium text-purple-900">
                {formatTime(appointment.appointment_time)}
              </span>
            </div>
          </div>

          {/* Hospital */}
          <div className="flex items-center gap-2 text-sm">
            <Hospital size={14} className="text-purple-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-purple-900 truncate">
                {appointment.hospital?.name || appointment.hospital?.address || 'No Location Specified'}
              </p>
              {appointment.hospital?.address && (
                <p className="text-xs text-purple-600 flex items-center gap-1 truncate">
                  <MapPin size={10} />
                  {appointment.hospital.address}
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
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              activeTab === 'current' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {activeTab === 'current' ? 'Upcoming' : 'Completed'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Retry function
  const handleRetry = () => {
    fetchAppointments();
  };

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-purple-800 mb-2">My Appointments</h1>
            <p className="text-purple-700">Manage and view your scheduled appointments with patients</p>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-xl shadow-sm mb-6 p-1 border border-purple-200 max-w-md mx-auto">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('current')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'current'
                    ? 'bg-purple-800 text-white shadow-sm'
                    : 'text-purple-800 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Current</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'current' ? 'bg-purple-200 text-purple-800' : 'bg-purple-800 text-white'
                  }`}>
                    {currentAppointments.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('previous')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'previous'
                    ? 'bg-purple-800 text-white shadow-sm'
                    : 'text-purple-800 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Previous</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'previous' ? 'bg-purple-200 text-purple-800' : 'bg-purple-800 text-white'
                  }`}>
                    {previousAppointments.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Error Message with Retry Button */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="font-medium text-red-900 text-sm">Error Loading Appointments</p>
                <p className="text-red-800 text-xs mb-3">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-purple-200">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-700 font-medium">Loading your appointments...</p>
            </div>
          ) : (
            <>
              {/* Show filters only if we have appointments */}
              {(currentAppointments.length > 0 || previousAppointments.length > 0) && (
                <div className="bg-white rounded-xl shadow-sm mb-6 p-4 border border-purple-200">
                  <div className="flex flex-col lg:flex-row gap-4 items-end">
                    {/* Search by Customer Name */}
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-purple-800 mb-2">
                        Search Patient
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-700" size={18} />
                        <input
                          type="text"
                          placeholder="Search by patient name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                        className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                        className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      />
                    </div>

                    {/* Reset Filters Button */}
                    <div className="w-full lg:w-auto">
                      <button
                        onClick={resetFilters}
                        className="w-full lg:w-auto px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
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
                      <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                        Filters Active
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Current Appointments */}
              {activeTab === 'current' && (
                <div className="animate-fade-in">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-purple-200">
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
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-purple-200">
                      <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar size={32} className="text-purple-800" />
                      </div>
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">
                        {previousAppointments.length === 0 ? 'No Previous Appointments' : 'No Matching Appointments'}
                      </h3>
                      <p className="text-purple-600 text-sm">
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

export default CurrentAppointment;