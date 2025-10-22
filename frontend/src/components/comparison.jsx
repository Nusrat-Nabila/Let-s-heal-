import React from "react";

const Comparison = () => {
  const data = [
    ["Provided by a qualified therapist", true, true],
    ["Chat sessions", true, false],
    ["Video sessions", true, false],
    ["Easy scheduling", true, false],
    ["Access from anywhere", true, false],
  ];

  const scrollToNextSection = () => {
    const nextSection = document.getElementById("faq");
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
    }
  };

  return (
    <section id="comparison" className="bg-traditional py-16 relative">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-purple-200 drop-shadow-[0_4px_3px_rgba(0,0,0,0.50)] text-center">
          Let's Heal vs. Traditional Therapy
        </h2>
        
        <div className="flex flex-col md:flex-row items-left md:items-start gap-20">
          {/* Image on the left */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-3 border-purple-300 shadow-lg mb-6">
              <img 
                src="src/assets/yoga.png" 
                alt="Therapist" 
                className="w-full h-full object-cover shadow-lg"
              />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-purple-100 mb-2">Mindful Therapy</h3>
              <p className="text-purple-200">Accessible mental health support</p>
            </div>
          </div>
          
          {/* Table on the right - made smaller */}
          <div className="w-full md:w-2/3 gap-14">
            <table className="w-full text-left border border-purple-200 rounded-lg overflow-hidden">
              <thead className="bg-purple-800 text-purple-100">
                <tr>
                  <th className="p-3 text-center text-sm md:text-base">Features</th>
                  <th className="p-3 text-center text-sm md:text-base">Let's Heal</th>
                  <th className="p-3 text-center text-sm md:text-base">In-office</th>
                </tr>
              </thead>
              <tbody>
                {data.map(([feature, online, office], i) => (
                  <tr key={i} className="border-t border-purple-900">
                    <td className="p-3 font-medium text-purple-200 text-sm md:text-base">{feature}</td>
                    <td className="p-3 text-center bg-purple-200">
                      {online ? (
                        <span className="text-purple-800 font-bold drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">✔</span>
                      ) : (
                        <span className="text-purple-800 font-bold">✘</span>
                      )}
                    </td>
                    <td className="p-3 text-center bg-purple-350">
                      {office ? (
                        <span className="text-white font-bold drop-shadow-[0_4px_3px_rgba(0,0,0,0.50)]">✔</span>
                      ) : (
                        <span className="text-purple-700 font-bold drop-shadow-[0_4px_3px_rgba(0,0,0,0.50)]">✘</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <br /> <br />
      {/* Scroll down animation button */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
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

export default Comparison;