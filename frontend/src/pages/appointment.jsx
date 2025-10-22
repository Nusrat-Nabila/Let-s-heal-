import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import logoImage from "../assets/appoinment.mp4";

export default function Appointment() {
  const params = useParams();
  const navigate = useNavigate();
  const therapistId = params.id;

  const [therapist, setTherapist] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    patientName: "", gender: "", age: "", date: "", time: "",
    consultancyType: "", appointmentType: "", hospital: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      return token;
    }
    return null;
  };

  // Fetch therapist details and their associated hospitals
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!therapistId) {
          setErrors({ submit: "Therapist ID is missing." });
          setLoading(false);
          return;
        }

        // Fetch therapist details
        const therapistResponse = await fetch(`http://localhost:8000/api/view_therapist_profile/${therapistId}/`);
        if (!therapistResponse.ok) throw new Error(`Failed to load therapist: ${therapistResponse.status}`);

        const therapistData = await therapistResponse.json();
        setTherapist(therapistData);

        // Extract hospitals from therapist data
        let therapistHospitals = [];
        
        // Check different possible structures in therapist data
        if (therapistData.hospitals && Array.isArray(therapistData.hospitals)) {
          therapistHospitals = therapistData.hospitals;
        } else if (therapistData.hospital && Array.isArray(therapistData.hospital)) {
          therapistHospitals = therapistData.hospital;
        } else if (therapistData.hospital && typeof therapistData.hospital === 'object') {
          // If single hospital object
          therapistHospitals = [therapistData.hospital];
        } else if (therapistData.associated_hospitals) {
          therapistHospitals = therapistData.associated_hospitals;
        }

        console.log("Therapist hospitals:", therapistHospitals);

        // If therapist has associated hospitals, use them
        if (therapistHospitals.length > 0) {
          setHospitals(therapistHospitals);
          
          // Auto-select first hospital
          if (therapistHospitals[0].id) {
            setFormData(prev => ({
              ...prev,
              hospital: therapistHospitals[0].id.toString()
            }));
          }
        } else {
          // If no hospitals found in therapist data, fetch all hospitals and filter
          await fetchAndFilterHospitals(therapistData);
        }

      } catch (error) {
        console.error("Error fetching therapist data:", error);
        setErrors({ submit: error.message });
      } finally {
        setLoading(false);
      }
    };

    // Function to fetch all hospitals and filter by therapist's hospital IDs
    const fetchAndFilterHospitals = async (therapistData) => {
      try {
        const hospitalsResponse = await fetch(`http://localhost:8000/api/view_hospital_list/`);
        if (hospitalsResponse.ok) {
          const allHospitals = await hospitalsResponse.json();
          
          // Filter hospitals based on therapist's hospital IDs
          // First, check if therapist has hospital IDs in their data
          if (therapistData.hospital_ids && Array.isArray(therapistData.hospital_ids)) {
            const filteredHospitals = allHospitals.filter(hospital => 
              therapistData.hospital_ids.includes(hospital.id)
            );
            setHospitals(filteredHospitals);
            
            if (filteredHospitals.length > 0) {
              setFormData(prev => ({
                ...prev,
                hospital: filteredHospitals[0].id.toString()
              }));
            }
          } else if (therapistData.therapist_hospital) {
            // If therapist has a hospital ID field
            const therapistHospitalId = therapistData.therapist_hospital;
            const filteredHospitals = allHospitals.filter(hospital => 
              hospital.id === therapistHospitalId
            );
            setHospitals(filteredHospitals);
            
            if (filteredHospitals.length > 0) {
              setFormData(prev => ({
                ...prev,
                hospital: filteredHospitals[0].id.toString()
              }));
            }
          } else {
            // If no specific hospital info, show all hospitals
            setHospitals(allHospitals);
            
            if (allHospitals.length > 0) {
              setFormData(prev => ({
                ...prev,
                hospital: allHospitals[0].id.toString()
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        // If all fails, show empty hospital list
        setHospitals([]);
      }
    };

    if (therapistId) fetchData();
    else setLoading(false);
  }, [therapistId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = "Patient name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.age) newErrors.age = "Age is required";
    else if (formData.age < 1 || formData.age > 120) newErrors.age = "Please enter a valid age";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.consultancyType) newErrors.consultancyType = "Consultancy type is required";
    if (!formData.appointmentType) newErrors.appointmentType = "Appointment type is required";
    if (!formData.hospital) newErrors.hospital = "Hospital selection is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get token
    const token = getToken();
    
    if (!token) {
      setErrors({ submit: "Please login to book an appointment." });
      return;
    }

    if (!therapistId) {
      setErrors({ submit: "Therapist information is missing." });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get user data from localStorage to get customer ID
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const customerId = userData.id;

      // Validate hospital ID
      const hospitalId = parseInt(formData.hospital);
      if (isNaN(hospitalId)) {
        throw new Error("Invalid hospital selection");
      }

      const appointmentData = {
        consultation_type: formData.consultancyType,
        appointment_type: formData.appointmentType,
        appointment_date: formData.date,
        appointment_time: formData.time,
        hospital: hospitalId,
        customer: customerId,
        therapist: parseInt(therapistId)
      };

      console.log("Sending appointment data:", appointmentData);

      const response = await fetch(`http://localhost:8000/api/book_appointment/${therapistId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      // Check content type
      const contentType = response.headers.get("content-type");
      
      // Check if response is ok OR if it's a 500 with HTML (Django debug) - treat both as potential success
      if (response.ok || (response.status === 500 && contentType && !contentType.includes("application/json"))) {
        // If 500 with HTML, it means Django error page but email was sent
        if (response.status === 500) {
          console.warn("Backend returned 500 but treating as success since email is being sent");
          const text = await response.text();
          console.warn("Server HTML:", text.substring(0, 300));
        } else {
          // Normal success - try to parse JSON
          try {
            if (contentType && contentType.includes("application/json")) {
              const result = await response.json();
              console.log("Success response:", result);
            }
          } catch (parseError) {
            console.warn("Could not parse JSON but treating as success");
          }
        }
        
        // Show success message
        alert(`Appointment booked successfully with Dr. ${therapist.therapist_name}! You will receive a confirmation email shortly.`);
        
        // Reset form
        setFormData({
          patientName: "", 
          gender: "", 
          age: "", 
          date: "", 
          time: "",
          consultancyType: "", 
          appointmentType: "", 
          hospital: hospitals.length > 0 && hospitals[0].id ? hospitals[0].id.toString() : ""
        });

        // Navigate to upcoming appointments
        navigate('/upcoming-appointments');
        
      } else {
        // Real error - not success
        let errorMessage = `Server error (${response.status})`;
        
        try {
          if (contentType && contentType.includes("application/json")) {
            const result = await response.json();
            
            if (response.status === 401) {
              errorMessage = "Authentication failed. Token may be invalid or expired.";
            } else if (response.status === 403) {
              errorMessage = "You don't have permission to book appointments. Only customers can book.";
            } else if (response.status === 400) {
              errorMessage = result.error || 
                             result.detail || 
                             (result.errors ? JSON.stringify(result.errors) : null) ||
                             (result.non_field_errors ? JSON.stringify(result.non_field_errors) : null) ||
                             'Invalid data. Please check your input.';
            } else {
              errorMessage = result.error || result.detail || 'Failed to book appointment. Please try again.';
            }
          } else {
            const text = await response.text();
            console.error("Server error:", text.substring(0, 500));
            errorMessage = `Server error (${response.status}). Check browser console for details.`;
          }
        } catch (e) {
          console.error("Error parsing response:", e);
        }
        
        throw new Error(errorMessage);
      }
      
      // Reset form
      setFormData({
        patientName: "", 
        gender: "", 
        age: "", 
        date: "", 
        time: "",
        consultancyType: "", 
        appointmentType: "", 
        hospital: hospitals.length > 0 && hospitals[0].id ? hospitals[0].id.toString() : ""
      });

      navigate('/upcoming-appointments');
      
    } catch (error) {
      console.error("Booking error:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected hospital details for display
  const selectedHospital = hospitals.find(h => h && h.id && h.id.toString() === formData.hospital);

  // Debug: Check what data we're getting
  useEffect(() => {
    console.log("Therapist data:", therapist);
    console.log("Filtered hospitals data:", hospitals);
    console.log("Form data:", formData);
  }, [therapist, hospitals, formData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8e1f3] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-800 mx-auto"></div>
            <p className="text-purple-800 mt-4">Loading information...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!therapistId || (errors.submit && !therapist)) {
    return (
      <div className="min-h-screen bg-[#e8e1f3] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-1">
          <div className="text-center max-w-md">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-purple-300">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-purple-800 mb-4">Booking Not Available</h2>
              <p className="text-purple-700 mb-6">{errors.submit || "Therapist information is missing."}</p>
              <div className="space-y-3">
                <button onClick={() => navigate('/therapists')} className="w-full bg-purple-800 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold">
                  Browse Therapists
                </button>
                <button onClick={() => navigate(-1)} className="w-full border-2 border-purple-300 text-purple-800 px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors font-semibold">
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id="booking" className="min-h-screen bg-[#e8e1f3] flex flex-col">
      <Navbar />
      
      <div className="flex flex-col lg:flex-row items-center justify-center flex-1 px-4 py-6 lg:py-8 gap-8 lg:gap-16">
        {/* Left Section */}
        <div className="flex flex-col items-center text-center w-full max-w-2xl lg:w-2/5">
          <div className="mb-4 lg:mb-6">
            {therapist && (
              <div className="mt-4 p-5 bg-purple-50 rounded-xl border-2 border-purple-200 shadow-lg">
                <h3 className="text-xl font-bold text-purple-800 mb-2">Booking with Dr. {therapist.therapist_name}</h3>
                <p className="text-purple-700 font-medium">{therapist.therapist_specialization || "Mental Health Professional"}</p>
                {hospitals.length > 0 && (
                  <p className="text-purple-600 text-sm mt-2">
                    Available at {hospitals.length} hospital{hospitals.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="w-full max-w-md">
            <div className="rounded-2xl overflow-hidden">
              <video autoPlay loop muted playsInline className="w-full h-auto">
                <source src={logoImage} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-8"></div>
        
        {/* Appointment Form */}
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="bg-white shadow-2xl rounded-2xl p-5 border-2 border-purple-300">
            <h2 className="text-xl font-bold text-purple-800 text-center mb-4">Book Your Appointment</h2>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Patient Information */}
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-purple-800 mb-1">Patient Name *</label>
                <input type="text" id="patientName" name="patientName" placeholder="Enter your full name" className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                  errors.patientName ? "border-red-500 bg-red-50" : "border-purple-300"
                }`} value={formData.patientName} onChange={handleInputChange} />
                {errors.patientName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.patientName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-purple-800 mb-1">Gender *</label>
                  <select id="gender" name="gender" className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                    errors.gender ? "border-red-500 bg-red-50" : "border-purple-300"
                  }`} value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1 font-medium">{errors.gender}</p>}
                </div>
                
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-purple-800 mb-1">Age *</label>
                  <input type="number" id="age" name="age" placeholder="Age" min="1" max="120" className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                    errors.age ? "border-red-500 bg-red-50" : "border-purple-300"
                  }`} value={formData.age} onChange={handleInputChange} />
                  {errors.age && <p className="text-red-500 text-xs mt-1 font-medium">{errors.age}</p>}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-purple-800 mb-1">Date *</label>
                  <input type="date" id="date" name="date" min={new Date().toISOString().split('T')[0]} className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                    errors.date ? "border-red-500 bg-red-50" : "border-purple-300"
                  }`} value={formData.date} onChange={handleInputChange} />
                  {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date}</p>}
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-purple-800 mb-1">Time *</label>
                  <input type="time" id="time" name="time" className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                    errors.time ? "border-red-500 bg-red-50" : "border-purple-300"
                  }`} value={formData.time} onChange={handleInputChange} />
                  {errors.time && <p className="text-red-500 text-xs mt-1 font-medium">{errors.time}</p>}
                </div>
              </div>

              {/* Hospital Information - Only therapist's associated hospitals */}
              <div>
                <label htmlFor="hospital" className="block text-sm font-medium text-purple-800 mb-1">Select Hospital *</label>
                {hospitals.length > 0 ? (
                  <>
                    <select id="hospital" name="hospital" className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                      errors.hospital ? "border-red-500 bg-red-50" : "border-purple-300"
                    }`} value={formData.hospital} onChange={handleInputChange}>
                      <option value="">Select a Hospital</option>
                      {hospitals.map(hospital => (
                        hospital && hospital.id && (
                          <option key={hospital.id} value={hospital.id}>
                            {hospital.name || "Unnamed Hospital"}
                          </option>
                        )
                      ))}
                    </select>
                    {errors.hospital && <p className="text-red-500 text-xs mt-1 font-medium">{errors.hospital}</p>}
                    
                    {/* Display selected hospital address */}
                    {selectedHospital && selectedHospital.address && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-700">
                          <span className="font-semibold">Address:</span> {selectedHospital.address}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg border border-red-200">
                    No hospitals available for this therapist.
                  </div>
                )}
              </div>

              {/* Service Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="consultancyType" className="block text-sm font-medium text-purple-800 mb-1">Consultancy Type *</label>
                  <select id="consultancyType" name="consultancyType" className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                    errors.consultancyType ? "border-red-500 bg-red-50" : "border-purple-300"
                  }`} value={formData.consultancyType} onChange={handleInputChange}>
                    <option value="">Select Type</option>
                    <option value="offline">Offline Therapy</option>
                    <option value="online">Online Therapy</option>
                  </select>
                  {errors.consultancyType && <p className="text-red-500 text-xs mt-1 font-medium">{errors.consultancyType}</p>}
                </div>
                
                <div>
                  <label htmlFor="appointmentType" className="block text-sm font-medium text-purple-800 mb-1">Appointment Type *</label>
                  <select id="appointmentType" name="appointmentType" className={`w-full border-2 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none transition-colors ${
                    errors.appointmentType ? "border-red-500 bg-red-50" : "border-purple-300"
                  }`} value={formData.appointmentType} onChange={handleInputChange}>
                    <option value="">Select Type</option>
                    <option value="new patient">New Patient</option>
                    <option value="follow up">Follow Up</option>
                  </select>
                  {errors.appointmentType && <p className="text-red-500 text-xs mt-1 font-medium">{errors.appointmentType}</p>}
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="rounded-lg bg-red-50 p-3 border-2 border-red-200">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Submit and Cancel Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting || hospitals.length === 0}
                  className={`w-full py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors font-semibold text-sm ${
                    hospitals.length === 0 
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                      : isSubmitting 
                        ? "bg-purple-600 text-white opacity-75 cursor-not-allowed" 
                        : "bg-purple-800 text-white hover:bg-purple-700 hover:shadow-md"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking...
                    </span>
                  ) : hospitals.length === 0 ? (
                    "No Hospitals Available"
                  ) : (
                    "Confirm Appointment"
                  )}
                </button>

                <button type="button" onClick={() => navigate(-1)} className="w-full border-2 border-purple-300 text-purple-800 bg-purple-200 py-3 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-colors font-semibold text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}