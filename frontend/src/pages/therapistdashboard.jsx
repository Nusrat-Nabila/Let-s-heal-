import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function TherapistDashboard() {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userRole = localStorage.getItem('user_role');
  const accessToken = localStorage.getItem('access_token');
  
  // Get therapist name
  const getUserName = () => {
    if (!userData) return "Therapist";
    return userData.therapist_name || "Therapist";
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features-section");
    if (featuresSection) {
      featuresSection.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const getUserEmail = () => {
    if (!userData) return "therapist@demo.com";
    return userData.therapist_email || "therapist@demo.com";
  };

  const userName = getUserName();
  const userEmail = getUserEmail();

  // Check if user is actually logged in AND is a therapist
  const isTherapist = accessToken && userRole === 'therapist';

  if (!isTherapist) {
    return (
      <div className="min-h-screen bg-purple-200 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-purple-800 mb-4">Access Denied</h1>
            <p className="text-purple-700">This dashboard is for therapists only.</p>
            <p className="text-purple-600 mt-2">Please log in with a therapist account.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id= "therapist-dashboard" className="min-h-screen bg-purple-200 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Reduced margin and padding */}
      <main className="flex-1 flex items-center justify-center min-h-[85vh] px-2 py-4 md:py-12 relative"> 
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          {/* Left Content */}
          <div className="max-w-md lg:max-w-lg text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-800 leading-tight">
              Welcome <span className="text-purple-900 font-italic capitalize leading-tight drop-shadow-[0_4px_3px_rgba(0,0,0,0.25)]">{userName}!</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-purple-800 mt-3 leading-tight drop-shadow-[0_4px_3px_rgba(0,0,0,0.15)]">
              Therapist <span className="italic">Dashboard</span>
            </h2>
            <p className="mt-4 text-xl font-bold text-purple-800 drop-shadow-[0_4px_3px_rgba(0,0,0,0.25)]">
              Empower Healing, Transform Lives
            </p>
            <p className="mt-3 text-purple-800 leading-relaxed text-base md:text-lg"> 
              Welcome to your professional workspace. Manage your appointments, 
              connect with clients, and provide the support that makes a difference 
              in people's mental health journeys.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button className="bg-purple-800 text-purple-100 px-8 py-3 rounded-lg shadow-md hover:bg-purple-700 transition duration-300 text-lg font-medium">
                View Appointments
              </button>
              <button className="bg-white text-purple-800 border border-purple-300 px-8 py-3 rounded-lg shadow-md hover:bg-purple-50 transition duration-300 text-lg font-medium">
                My Clients
              </button>
            </div>
          </div>

          {/* Video Animation */}
          <div className="w-full max-w-md lg:max-w-lg transform scale-120">
            <div className="rounded-xl overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="video-animation w-full h-auto"
              >
                <source src="src/assets/tdash.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
           
        {/* Scroll down animation button */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2"> 
          <button 
            onClick={scrollToFeatures}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-800 text-white shadow-lg hover:bg-purple-700 transition-all duration-300 hover:shadow-xl hover:scale-110 animate-bounce"
            aria-label="Scroll to How It Works section"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </main>

      {/* Reduced spacer */}
      <div className="h-12 bg-purple-200"></div> 

      {/* Therapist Features Section */}
      <section id="features-section" className="py-12 px-6 bg-[#dcccf5]"> 
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-purple-900 text-center mb-10 drop-shadow-[0_4px_3px_rgba(0,0,0,0.15)]"> 
            Professional Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-800 mb-3 text-center">Appointment Management</h3>
              <p className="text-purple-700 text-center text-sm">
                Schedule, reschedule, and manage your therapy sessions with an intuitive calendar system.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-800 mb-3 text-center">Client Profiles</h3>
              <p className="text-purple-700 text-center text-sm">
                Access comprehensive client information, session notes, and progress tracking in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-800 mb-3 text-center">Secure Sessions</h3>
              <p className="text-purple-700 text-center text-sm">
                Conduct secure, encrypted video sessions with built-in tools for effective remote therapy.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-800 mb-3 text-center">Peer Network</h3>
              <p className="text-purple-700 text-center text-sm">
                Connect with fellow therapists for collaboration, supervision, and professional growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}