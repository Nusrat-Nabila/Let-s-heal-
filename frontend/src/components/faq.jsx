import React, { useState } from "react";

const faqs = [
  {
    question: "Who are the therapists?",
    answer:
      "Our therapists are licensed professionals with extensive experience in various therapeutic approaches. All providers undergo a rigorous vetting process to ensure they meet our high standards of care.",
  },
  {
    question: "Who will be helping me?",
    answer:
      "You'll be matched with a licensed therapist based on your specific needs, preferences, and therapeutic goals. Our matching algorithm considers specialty areas, therapeutic approach, and personality compatibility.",
  },
  {
    question: "Is Let's Heal right for me?",
    answer:
      "Let's Heal is designed for individuals seeking convenient, professional mental health support. We're ideal for those with busy schedules or who prefer the comfort of accessing therapy from their own space.",
  },
  {
    question: "How much does it cost?",
    answer:
      "We offer tiered pricing plans to accommodate different needs and budgets. All plans include unlimited messaging and scheduled sessions with your matched therapist.",
  },
  {
    question: "I signed up. How long until I'm matched with a therapist?",
    answer:
      "Most clients are matched within 24-48 hours after completing our detailed assessment. We prioritize finding the right therapeutic match rather than rushing the process.",
  },
  {
    question: "How will I communicate with my therapist?",
    answer:
      "Our secure platform offers multiple communication options including messaging, video sessions, and voice calls. You and your therapist can decide which methods work best for your therapeutic journey.",
  },
  {
    question: "Can Let's Heal substitute for traditional face-to-face therapy?",
    answer:
      "While online therapy is effective for many concerns, it may not be suitable for severe mental health conditions requiring in-person care. We recommend consulting with a healthcare provider to determine the best approach for your specific situation.",
  },
  {
    question: "How long can I use Let's Heal?",
    answer:
      "You can use our services for as long as you find them beneficial. Many clients engage in short-term solution-focused work, while others continue longer-term for ongoing support and personal growth.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Split FAQs into pairs for two columns
  const faqPairs = [];
  for (let i = 0; i < faqs.length; i += 2) {
    faqPairs.push(faqs.slice(i, i + 2));
  }

  return (
    <div id="faq" className="flex flex-col justify-center items-center  bg-purple-350  px-4 py-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-3 text-center drop-shadow-[0_4px_3px_rgba(0,0,0,0.30)]">
        Frequently Asked Questions
      </h1>
      <p className="text-base text-purple-800 mb-8 text-center max-w-2xl">
        Find answers to common questions about our therapy services
      </p>
      
      <div className="bg-purple-350  rounded-2xl p-6 max-w-6xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {faqPairs.map((pair, pairIndex) => (
            <React.Fragment key={pairIndex}>
              {pair.map((faq, index) => {
                const faqIndex = pairIndex * 2 + index;
                return (
                  <div
                    key={faqIndex}
                    className="rounded-lg overflow-hidden border border-purple-350 transition-all"
                  >
                    <button
                      className="w-full flex justify-between items-center p-4 bg-purple-200 text-left hover:bg-purple-50 transition-colors"
                      onClick={() => toggleFAQ(faqIndex)}
                    >
                      <span className="font-medium text-purple-800 flex-1 text-base pr-3">
                        {faq.question}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform flex-shrink-0 text-purple-800 ${
                          activeIndex === faqIndex ? "transform rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        activeIndex === faqIndex ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      <div className="p-4 bg-purple-200 text-purple-800 w-full">
                        <p className="leading-relaxed text-sm">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="mt-8 text-center">
          <a
            href="/help"
            className="text-l font-medium underline text-purple-800 hover:text-purple-900  transition-colors"
          >
            More frequently asked questions
          </a>
          <br />
          <a href="/login">
          <button className="mt-5 bg-purple-800 hover:bg-purple-700 text-purple-200 py-2 px-6 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm">
            Get started
          </button></a>
        </div>
    </div>
  );
};

export default FAQ;