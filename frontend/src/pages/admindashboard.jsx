import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const AdminDashboard = () => {
  // Get admin data from localStorage
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userRole = localStorage.getItem('user_role');
  const accessToken = localStorage.getItem('access_token');
  
  // Get admin name
  const getUserName = () => {
    if (!userData) return "Admin";
    return userData.admin_name || "Admin";
  };

  const getUserEmail = () => {
    if (!userData) return "admin@demo.com";
    return userData.admin_email || "admin@demo.com";
  };

  const userName = getUserName();
  const userEmail = getUserEmail();

  // Check if user is actually logged in AND is an admin
  const isAdmin = accessToken && userRole === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-purple-200 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-purple-800 mb-4">Access Denied</h1>
            <p className="text-purple-700">This dashboard is for administrators only.</p>
            <p className="text-purple-600 mt-2">Please log in with an admin account.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div id ="admin-dashboard" className="min-h-screen bg-purple-200 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex items-center m-10 justify-center px-6 py-10 md:py-12">
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Left Content */}
          <div className="max-w-md lg:max-w-lg text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-purple-900 leading-tight">
              Welcome <span className="text-purple-800 font-italic capitalize leading-tight drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">{userName}!</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-purple-800 mt-4 leading-tight drop-shadow-[0_4px_3px_rgba(0,0,0,0.15)]">
              Admin <span className="italic">Dashboard</span>
            </h2>
            <p className="mt-6 text-xl font-bold text-purple-800 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
              Manage Your Platform Efficiently
            </p>
            <p className="mt-4 text-purple-800 leading-relaxed text-base md:text-lg">
              As an administrator, you have access to all platform management tools. 
              Monitor user activities, manage therapists, and ensure the smooth operation 
              of the Let's Heal platform.
            </p>
            
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
                <source src="src/assets/admin.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;