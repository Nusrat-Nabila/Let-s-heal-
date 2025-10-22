import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingpage";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Findtherapist from "./pages/findtherapist";
import TherapistProfile from "./pages/therapistprofile";
import Appointment from "./pages/appointment";
import AboutUs from "./pages/aboutus";
import UserDashboard from "./pages/userdashboard";
import BlogPage from "./pages/blogPost";
import CreatePost from "./pages/createpost";
import UpcomingAppointments from "./pages/upcomingappointments";
import UserProfile from "./pages/userprofile";
import HelpPage from "./pages/help";
import TherapistDashboard from "./pages/therapistdashboard";
import Chat from "./pages/chats";
import TherapistProfileOwn from "./pages/therapistprofileown";
import AdminDashboard from "./pages/admindashboard";
import TherapistRequests from "./pages/therapist-requests";
import AdminCustomers from "./pages/admin-customers";
import BlogDetailsPage from './pages/BlogDetailsPage';
import EditBlogPage from './pages/EditBlogPage';
import AdminTherapists from "./pages/admin-therapists";
import AdminHospitals from "./pages/admin-hospitals";
import CurrentAppointment from "./pages/current-appointment";
import AdminQuiz from "./pages/admin-quiz";
import CustomerQuiz from "./pages/assessments";
const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/findtherapist" element={<Findtherapist />} />
        <Route path="/profile/:id" element={<TherapistProfile />} />
        <Route path="/booking/:id" element={<Appointment />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/blog-posts" element={<BlogPage />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/upcoming-appointments" element={<UpcomingAppointments />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/therapistprofileown" element={<TherapistProfileOwn />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/therapist-requests" element={<TherapistRequests />} />
        <Route path="/admin-customers" element={<AdminCustomers />} />
        <Route path="/blog/:id" element={<BlogDetailsPage />} />
        <Route path="/edit-blog/:id" element={<EditBlogPage />} />
        <Route path="/admin-therapist" element={<AdminTherapists />} />
        <Route path="/admin-hospitals" element={<AdminHospitals />} />
        <Route path="/current-appointment" element={<CurrentAppointment />} />
        <Route path="/admin-quiz" element={<AdminQuiz />} />
        <Route path="/assessments" element={<CustomerQuiz />} />
      </Routes>
    </div>
  );
};

export default App;

