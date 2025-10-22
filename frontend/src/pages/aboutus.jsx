import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
const AboutUs = () => {
  return (
    <div id="about">
      <Navbar />
    <div className="min-h-screen bg-purple-200">
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-purple-800 mb-6 text-center drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">About Let's Heal</h1>
          <div className="h-px bg-purple-800 w-full mb-12"></div>
        </div>

        {/* Main Content Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-purple-800 mb-8 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">Discover Your Path to Wellness</h2>
          <div className="text-lg text-purple-800 leading-relaxed space-y-6">
            <p>
              Established in 2020, Let's Heal was founded with a clear vision: to eliminate traditional barriers to therapy and make professional mental health care accessible to all. Today, we stand as Bangladesh's premier teletherapy service—delivering expert, affordable, and personalized mental health support through a secure digital platform.
            </p>
            <p>
              Our network of over 500 certified therapists across Bangladesh has empowered thousands of individuals to reclaim their mental wellbeing and achieve personal growth. As the demand for mental health services continues to expand, Let's Heal remains dedicated to broadening therapeutic access throughout the nation while maintaining the highest standards of care.
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-purple-50 rounded-xl p-8 mb-16 border-l-4 border-purple-800 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
          <h3 className="text-2xl font-semibold text-purple-800 mb-4">Our Mission</h3>
          <p className="text-lg text-purple-800">
            To provide accessible, affordable, and evidence-based mental health care to everyone in Bangladesh, while actively reducing stigma and systemic barriers that prevent individuals from seeking support.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-4xl font-bold text-purple-800 mb-2">10,000+</div>
            <div className="text-purple-800">Individuals Supported</div>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <div className="text-4xl font-bold text-purple-800 mb-2">500+</div>
            <div className="text-purple-800">Licensed Professionals</div>
          </div>
          <div className="text-center p-6 bg-gray-50  rounded-lg">
            <div className="text-4xl font-bold text-purple-800 mb-2">95%</div>
            <div className="text-purple-800">Client Satisfaction Rate</div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-purple-800 mb-6 text-center drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-purple-350 rounded-lg hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-purple-700 mb-2">Accessibility</h4>
              <p className="text-purple-800">We believe everyone deserves access to quality mental health care, regardless of location, background, or financial circumstances.</p>
            </div>
            <div className="p-6 border border-purple-350 rounded-lg hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-purple-700 mb-2">Confidentiality</h4>
              <p className="text-purple-800">Your privacy is paramount. All sessions are conducted with strict confidentiality and enterprise-grade security measures.</p>
            </div>
            <div className="p-6 border border-purple-350 rounded-lg hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-purple-700 mb-2">Excellence</h4>
              <p className="text-purple-800">Our therapists are fully licensed, accredited professionals who participate in ongoing training and clinical supervision.</p>
            </div>
            <div className="p-6 border border-purple-350 rounded-lg hover:shadow-md transition-shadow">
              <h4 className="text-lg font-medium text-purple-700 mb-2">Compassionate Care</h4>
              <p className="text-purple-800">We approach every client with empathy, cultural sensitivity, and without judgment, creating a safe space for healing.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-purple-800 rounded-xl p-10 text-center text-purple-200 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Begin Your Therapeutic Journey Today</h3>
          <p className="mb-6 max-w-2xl mx-auto opacity-90">Join the growing community of Bangladeshis who have discovered renewed wellbeing through Let's Heal's professional support system.</p>
          <button className="bg-purple-200 text-purple-800 font-semibold px-8 py-3 rounded-lg hover:bg-purple-300 transition duration-300 shadow-md">
            Connect with a Therapist
          </button>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default AboutUs;