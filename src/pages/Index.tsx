import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/PricingSection";
import GrowthSection from "@/components/GrowthSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <StatsSection />
      <PricingSection />
      <GrowthSection />
      <Footer />
    </div>
  );
};

export default Index;
