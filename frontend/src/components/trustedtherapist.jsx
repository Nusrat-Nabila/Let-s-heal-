import React from "react";

const TrustedTherapist = () => {
  // Function to scroll directly to HowItWorks section
  const scrollToNextSection = () => {
    const nextSection = document.getElementById("howitWorks");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section id="trusted-therapist" className="bg-purple-350 border-purple-950 py-20 px-6 relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 border-4 border-dashed border-purple-800 rounded-2xl p-8 shadow-2xl shadow-purple-900/50">
          {/* Text Content */}
          <div className="flex-1 max-w-lg">
            <h1 className="text-5xl md:text-2xl font-bold text-purple-800 mb-4 leading-tight drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
              Professional and qualified therapists who you can trust
            </h1>
            <p className="text-purple-800 mb-6 leading-relaxed">
              Tap into the world's largest network of qualified and experienced therapists who can help you with a range of issues including depression, anxiety, relationships, trauma, grief and more. With our therapists, you get the same professionalism and quality you would expect from an in-office therapist, but with the ability to communicate when and how you want.
            </p>
            <a href="/findtherapist" target="_blank" rel="noopener noreferrer">
  <button className="bg-purple-800 hover:bg-purple-200 hover:text-purple-800 text-purple-200 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
    Get matched to a therapist
  </button>
</a>
          </div>

          {/* Video Animation */}
          <div className="flex-1">
            <div className="video-container rounded-xl overflow-hidden shadow-lg">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="video-animation w-full h-auto"
              >
                <source src="src/assets/trustedtharapist.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
<br /><br />
        {/* Scroll down animation button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={scrollToNextSection}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-800 text-white shadow-lg hover:bg-purple-700 transition-all duration-300 hover:shadow-xl hover:scale-110 animate-bounce"
            aria-label="Scroll to How It Works section"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>
    </>
  );
};

export default TrustedTherapist;
