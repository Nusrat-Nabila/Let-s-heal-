import React from "react";
import { Link} from "react-router-dom";
import { FiMail, FiFacebook, FiSend, FiInstagram, FiPhone, FiHeart } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-purple-800 text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <FiHeart className="text-purple-300 mr-2" size={24} />
              <span className="text-xl font-semibold">Let's Heal</span>
            </div>
            <p className="text-purple-200 text-sm mb-6 max-w-xs">
              Providing accessible mental health support through professional online therapy services.
            </p>
            <div className="flex space-x-3">
              <a aria-label="Email" href="#" className="p-2.5 rounded-lg bg-purple-700/50 hover:bg-purple-600 transition-colors">
                <FiMail size={18} />
              </a>
              <a aria-label="Facebook" href="#" className="p-2.5 rounded-lg bg-purple-700/50 hover:bg-purple-600 transition-colors">
                <FiFacebook size={18} />
              </a>
              <a aria-label="Instagram" href="#" className="p-2.5 rounded-lg bg-purple-700/50 hover:bg-purple-600 transition-colors">
                <FiInstagram size={18} />
              </a>
              <a aria-label="WhatsApp" href="#" className="p-2.5 rounded-lg bg-purple-700/50 hover:bg-purple-600 transition-colors">
                <FaWhatsapp size={16} />
              </a>
            </div>
          </div>

          {/* Navigation columns */}
          <nav className="space-y-4">
            <h3 className="font-semibold text-purple-300 text-sm uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-3">
              <li><a href="/" className="hover:text-purple-200 transition-colors text-sm">Home</a></li>
              <li><a href="/about" className="hover:text-purple-200 transition-colors text-sm">About</a></li>
              <li><a href="/findtherapist" className="hover:text-purple-200 transition-colors text-sm">Find a Therapist</a></li>
            </ul>
          </nav>

          <nav className="space-y-4">
            <h3 className="font-semibold text-purple-300 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              <li><a href="/help" className="hover:text-purple-200 transition-colors text-sm">FAQ</a></li>
            </ul>
          </nav>

          {/* Contact column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-purple-300 text-sm uppercase tracking-wider">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <FiPhone className="mt-0.5 mr-3 text-purple-300 flex-shrink-0" size={16} />
                <span>+1 (555) 123-HEAL</span>
              </div>
              <div className="flex items-start">
                <FiMail className="mt-0.5 mr-3 text-purple-300 flex-shrink-0" size={16} />
                <span>support@letsheal.com</span>
              </div>
              <div className="pt-2">
                <Link to ="/help"><button className="bg-white text-purple-800 hover:bg-purple-100 py-2 px-5 rounded-full font-medium transition-colors text-xs flex items-center">
                  <FiSend className="mr-1.5" size={14} />
                  Send Message
                </button></Link>
              </div>
            </div>
          </div>
        </div>


        {/* Divider */}
        <div className="mt-10 pt-6">
          <hr className="border-t border-purple-700/40" />
        </div>

        {/* Bottom legal links */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap gap-5 text-sm text-purple-200">
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Data Security</a>
          </div>

          <div className="flex items-center text-sm text-purple-200">
            <span className="flex items-center">
              Made with <FiHeart className="mx-1 text-red-400" size={14} /> © {new Date().getFullYear()} Let's Heal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;