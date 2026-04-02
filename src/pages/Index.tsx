import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PlansSection from "@/components/PlansSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CtaFinalSection from "@/components/CtaFinalSection";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

export default function Index() {
  return (
    <LanguageProvider>
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <PlansSection />
      <TestimonialsSection />
      <CtaFinalSection />
      <Footer />
      <FloatingButtons />
    </LanguageProvider>
  );
}
