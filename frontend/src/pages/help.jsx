// HelpPage.jsx
import React, { useState } from "react";
import { 
  FiHelpCircle, 
  FiSearch, 
  FiMessageCircle, 
  FiMail, 
  FiBook, 
  FiChevronDown,
  FiChevronUp,
  FiSend,
  FiPhone,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiSettings,
  FiCreditCard,
  FiHeart
} from "react-icons/fi";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  });

  // FAQ Data
  const faqCategories = {
    "Account": [
      {
        question: "How do I reset my password?",
        answer: "Go to your profile settings and click 'Edit Profile'. In the password section, enter your current password and your new password. Make sure your new password is at least 6 characters long."
      },
      {
        question: "Can I change my username?",
        answer: "Yes, you can change your username from the profile editing section. Note that your username must be unique and can only contain letters, numbers, and underscores."
      },
      {
        question: "How do I delete my account?",
        answer: "Account deletion can be requested by contacting our support team. We'll guide you through the process and ensure your data is properly removed from our systems."
      }
    ],
    "Wellness": [
      {
        question: "How often should I complete wellness sessions?",
        answer: "We recommend completing at least 3-5 sessions per week for optimal benefits. However, you can set your own pace based on your personal goals and schedule."
      },
      {
        question: "Can I track my progress over time?",
        answer: "Yes, your profile includes progress tracking with visual graphs and statistics. You can see your session history, mood patterns, and achievement milestones."
      },
      {
        question: "What if I miss a day in my streak?",
        answer: "Don't worry! While maintaining a streak is motivating, it's okay to miss days. The most important thing is consistency over time, not perfection."
      }
    ],
    "Technical": [
      {
        question: "The app is running slow, what should I do?",
        answer: "Try clearing your browser cache, ensuring you have a stable internet connection, or restarting the application. If issues persist, contact our technical support."
      },
      {
        question: "How do I update my app?",
        answer: "Web versions update automatically. For mobile apps, updates are available through your device's app store. Enable automatic updates to always have the latest version."
      },
      {
        question: "Is my data secure?",
        answer: "Yes, we use industry-standard encryption and security measures to protect your personal information and wellness data. Your privacy is our top priority."
      }
    ],
    "Billing": [
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards, PayPal, and in some regions, mobile payment options. All payments are processed securely through encrypted channels."
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period."
      },
      {
        question: "How do I get a receipt?",
        answer: "Receipts are automatically emailed to you after each payment. You can also access your billing history from your account settings at any time."
      }
    ]
  };

  // Filter FAQs based on search
  const filteredFAQs = Object.entries(faqCategories).reduce((acc, [category, questions]) => {
    const filteredQuestions = questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredQuestions.length > 0) {
      acc[category] = filteredQuestions;
    }
    return acc;
  }, {});

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Contact form submitted:", contactForm);
    alert("Thank you for your message! We'll get back to you within 24 hours.");
    setContactForm({ name: "", email: "", subject: "", message: "", category: "general" });
  };

  const handleInputChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCardClick = (tabId) => {
    setActiveTab(tabId);
    // Scroll to the tab content
    setTimeout(() => {
      const element = document.getElementById('tab-content');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const ContactInfoCard = ({ icon: Icon, title, description, action, tabId }) => (
    <button
      onClick={() => handleCardClick(tabId)}
      className="bg-white p-5 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 text-left w-full hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 group"
    >
      <div className="w-10 h-10 bg-purple-800 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
        <Icon className="text-white text-lg" />
      </div>
      <h3 className="font-semibold text-purple-900 text-base mb-2 group-hover:text-purple-700 transition-colors">{title}</h3>
      <p className="text-purple-700 text-sm mb-3 leading-relaxed">{description}</p>
      <div className="text-purple-600 group-hover:text-purple-700 font-medium text-sm flex items-center transition-colors">
        {action} 
        <FiChevronDown className="ml-1 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );

  const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="border-b border-purple-200 last:border-b-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-4 text-left flex justify-between items-center hover:bg-purple-50 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 group"
        >
          <span className="font-medium text-purple-900 text-sm pr-4 text-left group-hover:text-purple-700 transition-colors">{question}</span>
          {isOpen ? (
            <FiChevronUp className="text-purple-600 flex-shrink-0 transition-transform w-4 h-4" />
          ) : (
            <FiChevronDown className="text-purple-400 group-hover:text-purple-600 flex-shrink-0 transition-transform w-4 h-4" />
          )}
        </button>
        {isOpen && (
          <div className="px-4 pb-4">
            <p className="text-purple-800 text-sm leading-relaxed bg-purple-50 p-3 rounded-lg border border-purple-200">{answer}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="help" className="min-h-screen bg-purple-200">
      <Navbar />
      
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiHelpCircle className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-purple-900 mb-3">How can we help you?</h1>
            <p className="text-lg text-purple-700 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm text-purple-900 placeholder-purple-500 bg-white transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <ContactInfoCard
              icon={FiMessageCircle}
              title="Live Chat"
              description="Get instant help from our support team with real-time chat support"
              action="Start Chat"
              tabId="contact"
            />
            <ContactInfoCard
              icon={FiMail}
              title="Email Support"
              description="Send us a detailed message and we'll reply within 24 hours"
              action="Send Email"
              tabId="contact"
            />
            <ContactInfoCard
              icon={FiBook}
              title="Help Center"
              description="Browse our comprehensive documentation and guides"
              action="View Guides"
              tabId="faq"
            />
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border border-purple-200 p-1 mb-6 max-w-3xl mx-auto">
            <nav className="flex space-x-1">
              {[
                { id: "faq", name: "FAQ", count: Object.values(faqCategories).flat().length, icon: FiBook },
                { id: "contact", name: "Contact Support", icon: FiMessageSquare }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-purple-800 text-purple-200 shadow-sm"
                        : "text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                    }`}
                  >
                    <Icon className={`w-3 h-3 mr-2 ${activeTab === tab.id ? 'text-purple-200' : 'text-purple-500'}`} />
                    {tab.name}
                    {tab.count && (
                      <span className={`ml-2 py-0.5 px-1.5 rounded-full text-xs ${
                        activeTab === tab.id 
                          ? "bg-purple-200 text-purple-800" 
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div id="tab-content" className="max-w-3xl mx-auto">
            
            {/* FAQ Tab */}
            {activeTab === "faq" && (
              <div className="space-y-6">
                {Object.keys(filteredFAQs).length > 0 ? (
                  Object.entries(filteredFAQs).map(([category, questions]) => (
                    <div key={category} className="bg-white rounded-lg border border-purple-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-purple-200 bg-purple-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                            {category === "Account" && <FiUser className="w-4 h-4 text-purple-800" />}
                            {category === "Wellness" && <FiHeart className="w-4 h-4 text-purple-800" />}
                            {category === "Technical" && <FiSettings className="w-4 h-4 text-purple-800" />}
                            {category === "Billing" && <FiCreditCard className="w-4 h-4 text-purple-800" />}
                          </div>
                          <h2 className="text-lg font-semibold text-purple-900">{category}</h2>
                        </div>
                      </div>
                      <div className="divide-y divide-purple-200">
                        {questions.map((faq, index) => (
                          <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-purple-200 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiSearch className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">No results found</h3>
                    <p className="text-purple-700 text-sm max-w-md mx-auto">
                      Try adjusting your search terms or browse the categories above to find what you're looking for.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Support Tab */}
            {activeTab === "contact" && (
              <div className="bg-white rounded-lg border border-purple-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiMessageSquare className="text-white text-xl" />
                      </div>
                      <h2 className="text-xl font-semibold text-purple-900 mb-2">Contact Our Support Team</h2>
                      <p className="text-purple-700 text-sm">
                        Fill out the form below and we'll get back to you as soon as possible.
                      </p>
                    </div>
                    
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-800 mb-1">
                            Full Name *
                          </label>
                          <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-3 h-3" />
                            <input
                              type="text"
                              required
                              value={contactForm.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-purple-900 placeholder-purple-500 bg-white transition-colors text-sm"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-800 mb-1">
                            Email Address *
                          </label>
                          <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-3 h-3" />
                            <input
                              type="email"
                              required
                              value={contactForm.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-purple-900 placeholder-purple-500 bg-white transition-colors text-sm"
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-purple-800 mb-1">
                            Category *
                          </label>
                          <select
                            value={contactForm.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-purple-700 bg-white transition-colors text-sm"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="technical">Technical Support</option>
                            <option value="billing">Billing Issue</option>
                            <option value="feature">Feature Request</option>
                            <option value="bug">Bug Report</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-purple-800 mb-1">
                            Subject *
                          </label>
                          <input
                            type="text"
                            required
                            value={contactForm.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-purple-900 placeholder-purple-500 bg-white transition-colors text-sm"
                            placeholder="Brief description of your issue"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-800 mb-1">
                          Message *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-vertical text-purple-900 placeholder-purple-500 bg-white transition-colors text-sm"
                          placeholder="Please describe your issue in detail..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-semibold shadow-sm flex items-center justify-center gap-2 text-sm"
                      >
                        <FiSend className="w-3 h-3" />
                        Send Message
                      </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-purple-200">
                      <h3 className="font-semibold text-purple-900 mb-4 text-center text-sm">Other Ways to Reach Us</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="flex flex-col items-center text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <FiMail className="w-4 h-4 text-purple-800 mb-1" />
                          <span className="font-medium text-purple-900">Email</span>
                          <span className="text-purple-700">support@wellnessapp.com</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <FiPhone className="w-4 h-4 text-purple-800 mb-1" />
                          <span className="font-medium text-purple-900">Phone</span>
                          <span className="text-purple-700">1-800-WELLNESS</span>
                        </div>
                        <div className="flex flex-col items-center text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <FiClock className="w-4 h-4 text-purple-800 mb-1" />
                          <span className="font-medium text-purple-900">Support Hours</span>
                          <span className="text-purple-700">24/7 Emergency</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HelpPage;