import React from "react";
import Hero from "../components/hero";
import Navbar from "../components/navbar";
import TrustedTherapist from "../components/trustedtherapist";
import HowItWorks from "../components/howitworks";
import Comparison from "../components/comparison";
import FAQ from "../components/faq";
import Footer from "../components/footer";
const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <TrustedTherapist />
     <HowItWorks />
     <Comparison />
     <FAQ />
     <Footer />
    </div>
  );
};

export default LandingPage;