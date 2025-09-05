
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PartnersSection from '@/components/home/PartnersSection';
import JourneySection from '@/components/home/JourneySection';
import BenefitsSection from '@/components/home/BenefitsSection';
import FAQSection from '@/components/home/FAQSection';
import StatsSection from '@/components/home/StatsSection';
import ContactFormSection from '@/components/home/ContactFormSection';
import CasesSection from '@/components/home/CasesSection';
import ROICalculator from '@/components/shared/ROICalculator';
import ChatWidget from '@/components/shared/ChatWidget';
import UrgencyBanner from '@/components/shared/UrgencyBanner';
import ExitIntentPopup from '@/components/shared/ExitIntentPopup';
import SocialProofBar from '@/components/shared/SocialProofBar';

const Index = () => {
  return (
    <PageLayout>
      <UrgencyBanner />
      <ExitIntentPopup />
      <HeroSection />
      <SocialProofBar />
      <StatsSection />
      <BenefitsSection />
      <ServicesSection />
      <ROICalculator />
      <CasesSection />
      <JourneySection />
      <PartnersSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactFormSection />
      <ChatWidget />
    </PageLayout>
  );
};

export default Index;
