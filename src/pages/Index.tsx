import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PortugueseWordsSection from "@/components/PortugueseWordsSection";
import BenefitsSection from "@/components/BenefitsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlansSection from "@/components/PlansSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import CtaFinalSection from "@/components/CtaFinalSection";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

// Main landing page
export default function Index() {
  return (
    <LanguageProvider>
      <Navbar />
      <HeroSection />
      <PortugueseWordsSection />
      <BenefitsSection />
      <HowItWorksSection />
      <PlansSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaFinalSection />
      <Footer />
      <FloatingButtons />
    </LanguageProvider>
  );
}
