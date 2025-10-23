import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Link } from "react-router-dom";

export default function UserDashboard() {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userRole = localStorage.getItem('user_role');
  const accessToken = localStorage.getItem('access_token');
  
  // Get customer name
  const getUserName = () => {
    if (!userData) return "Customer";
    return userData.customer_name || "Customer";
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
    if (!userData) return "customer@demo.com";
    return userData.customer_email || "customer@demo.com";
  };

  const userName = getUserName();
  const userEmail = getUserEmail();

  // Check if user is actually logged in AND is a customer
  const isCustomer = accessToken && userRole === 'customer';


  return (
    <div id = "user-dashboard" className="min-h-screen bg-purple-200 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 md:py-12 relative">
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Left Content */}
          <div className="max-w-md lg:max-w-lg text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-800 leading-tight">
              Hello <span className="text-purple-900 font-italic capitalize leading-tight drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">{userName}!</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-purple-800 mt-4 leading-tight drop-shadow-[0_4px_3px_rgba(0,0,0,0.15)]">
              Welcome to <span className="italic">Let's Heal</span>
            </h2>
            <p className="mt-6 text-xl font-bold text-purple-800 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
              How well do you cope?
            </p>
            <p className="mt-4 text-purple-800 leading-relaxed text-base md:text-lg">
              Everyone faces mental health challenges at some point. This test
              helps you see how you're coping and whether you might benefit from
              talking to a therapist or getting other professional support.
            </p>
            <Link to="/assessments"><button className="mt-8 bg-purple-800 text-purple-200 px-8 py-3 rounded-lg shadow-md hover:bg-purple-700 transition duration-300 text-lg font-medium">
              Get Started
            </button></Link>
          </div>

          {/* Video Animation */}
          <div className="w-full max-w-md lg:max-w-lg transform scale-100">
            <div className="rounded-xl overflow-hidden">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-auto"
              >
                <source src="src/assets/Home1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        {/* Scroll down animation button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={scrollToFeatures}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-800 text-white shadow-lg hover:bg-purple-700 transition-all duration-300 hover:shadow-xl hover:scale-110 animate-bounce"
            aria-label="Scroll to features section"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </main>

      {/* Customer Features Section */}
      <section id="features-section" className="py-12 px-6 bg-[#dcccf5]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-purple-900 text-center mb-12 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
            Features for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-purple-50 rounded-lg p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">Mental Health Assessment</h3>
              <p className="text-purple-700">
                Take our comprehensive assessment to understand your current mental well-being and get personalized insights.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-purple-50 rounded-lg p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">Find Therapists</h3>
              <p className="text-purple-700">
                Connect with qualified therapists who specialize in areas that match your needs and preferences.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 rounded-lg p-6 shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-3">Progress Tracking</h3>
              <p className="text-purple-700">
                Monitor your mental health journey with tools to track your progress and celebrate your achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}