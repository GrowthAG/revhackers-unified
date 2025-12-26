
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import PartnersSection from '@/components/home/PartnersSection';
import ServicesSection from '@/components/home/ServicesSection';
import CasesSection from '@/components/home/CasesSection';
import JourneySection from '@/components/home/JourneySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactFormSection from '@/components/home/ContactFormSection';

const Index = () => {
  return (
    <PageLayout>
      <HeroSection />
      <PartnersSection />
      <ServicesSection />
      <CasesSection />
      <JourneySection />
      <TestimonialsSection />
      <ContactFormSection />
    </PageLayout>
  );
};

export default Index;
