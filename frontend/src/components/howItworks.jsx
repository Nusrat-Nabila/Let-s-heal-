import React from "react";
import { FaArrowDown } from "react-icons/fa";


const HowItWorks = () => {
    const scrollToNextSection = () => {
    const nextSection = document.getElementById("comparison");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  const steps = [
    {
      title: "Get matched to the best therapist for you",
      desc: "Finding the right therapist can be overwhelming—but it doesn’t have to be. Answer a few simple questions, and we’ll connect you with a qualified therapist who fits your unique needs and preferences. Tap into one of the largest online networks of credentialed providers, and start receiving the support you deserve from professionals you can trust.",
      images: ["/src/assets/HIW1.png"],
    },
    {
      title: "Communicate your way",
      desc: "Everyone has their own comfort zone when it comes to talking about mental health. That’s why we let you choose how you connect with your therapist—whether it’s through text, chat, audio, or video. You’ll experience the same level of professionalism, care, and guidance as an in-office session, with the flexibility to communicate in the way that feels most natural to you.",
      images: ["/src/assets/HIW2.png"],
    },
    {
      title: "Therapy when you need it",
      desc: "Life can be busy, unpredictable, and stressful. That’s why we make therapy easy to fit into your schedule. Message your therapist anytime, from anywhere, and schedule live sessions when it’s convenient for you. You can access support from any mobile device or computer.",
      images: ["/src/assets/HIW3.png"],
    },
  ];

  return (
    <section
      id="howitWorks" // ✅ Important for scroll
      className="relative bg-purple-200 py-16 px-6 md:px-12 lg:px-24"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-800 mb-12 drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
        How It Works
      </h2>

      <div className="flex flex-col items-center gap-10">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex flex-col md:flex-row items-center md:items-start gap-8 w-full max-w-5xl ${
                index % 2 !== 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Image Section */}
              <div className="flex justify-center flex-1">
                {step.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Step visual"
                    className="max-w-xs md:max-w-sm object-cover rounded-xl w-60 h-60"
                  />
                ))}
              </div>

              {/* Text Section */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-semibold text-purple-800 mb-4">
                  {step.title}
                </h3>
                <p className="text-purple-800 leading-relaxed">{step.desc}</p>
              </div>
            </div>

            {/* Down Arrow (except last step) */}
            {index < steps.length - 1 && (
              <div className="my-4">
                <FaArrowDown className="text-purple-800 text-2xl animate-bounce" />
              </div>
            )}
          </React.Fragment>
        ))}
        <br />
      </div>
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
  );
};

export default HowItWorks;
