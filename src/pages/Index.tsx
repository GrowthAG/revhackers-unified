
import PageLayout from '@/components/layout/PageLayout';
import PremiumHero from '@/components/premium/PremiumHero';
import PremiumStatsSection from '@/components/premium/PremiumStatsSection';
import PremiumBenefitsSection from '@/components/premium/PremiumBenefitsSection';
import PremiumServices from '@/components/premium/PremiumServices';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PartnersSection from '@/components/home/PartnersSection';
import JourneySection from '@/components/home/JourneySection';
import FAQSection from '@/components/home/FAQSection';
import ContactFormSection from '@/components/home/ContactFormSection';
import CasesSection from '@/components/home/CasesSection';
import ROICalculator from '@/components/shared/ROICalculator';

const Index = () => {
  return (
    <PageLayout>
      <PremiumHero />
      <PremiumStatsSection />
      <PremiumBenefitsSection />
      <PremiumServices />
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
