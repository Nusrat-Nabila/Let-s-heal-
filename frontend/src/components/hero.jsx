import React from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const scrollToNextSection = () => {
    const nextSection = document.getElementById("trusted-therapist");
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleHowItWorks = () => {
    const howItWorksSection = document.getElementById("howitWorks");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    } else {
      // Fallback: If the section doesn't exist yet, navigate to home and then scroll
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById("howitWorks");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return(
    <section id="home" className="bg-purple-200 min-h-screen flex items-start pt-24 pb-12 relative"> 
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 px-4 mt-8">
        {/* Hero Content */}
        <div className="flex-1 max-w-md md:max-w-lg text-center md:text-left -mt-8">
          <h1 className="text-5xl md:text-6xl font-bold text-purple-800 mb-4 leading-tight drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
            Let's Heal
          </h1>
          <p className="text-xl md:text-2xl text-purple-800 mb-8 font-semibold">
            Where Healing Begins, Gently
          </p>

          <ul className="text-purple-800 mb-10 space-y-3">
            {[
              "Convenient access to professional support",
              "Personalized care according to your needs",
              "Affordable options for every budget",
              "Safe and confidential environment"
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-5 h-5 text-purple-800 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleGetStarted}
              className="bg-purple-800 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-purple-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center"
            >
              Get Started
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={handleHowItWorks}
              className="bg-white text-purple-800 border border-purple-800 px-8 py-3.5 rounded-full font-semibold hover:bg-purple-50 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 flex items-center justify-center"
            >
              How It Works
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex-1 flex justify-center -mt-8">
          <img
            src="src/assets/Home.png"
            alt="Healing Illustration"
            className="w-80 md:w-96 lg:w-[500px] h-auto rounded-lg"
          />
        </div>
      </div>

      {/* Scroll down animation button */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <button 
          onClick={scrollToNextSection}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-800 text-white shadow-lg hover:bg-purple-700 transition-all duration-300 hover:shadow-xl hover:scale-110 animate-bounce"
          aria-label="Scroll to next section"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Hero;