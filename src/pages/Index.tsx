
import PageLayout from '@/components/layout/PageLayout';
import PremiumHeroSection from '@/components/home/PremiumHeroSection';
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

const Index = () => {
  return (
    <PageLayout>
      <PremiumHeroSection />
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
    </PageLayout>
  );
};

export default Index;
