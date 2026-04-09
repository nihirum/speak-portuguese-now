import { useState } from "react";
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
import RegistrationModal from "@/components/RegistrationModal";

export default function Index() {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);

  return (
    <LanguageProvider>
      <Navbar onCtaClick={openModal} />
      <HeroSection onCtaClick={openModal} />
      <PortugueseWordsSection />
      <BenefitsSection />
      <HowItWorksSection onCtaClick={openModal} />
      <PlansSection onCtaClick={openModal} />
      <TestimonialsSection />
      <FaqSection />
      <CtaFinalSection />
      <Footer />
      <FloatingButtons />
      <RegistrationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </LanguageProvider>
  );
}
