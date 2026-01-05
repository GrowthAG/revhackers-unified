
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import PartnersSection from '@/components/home/PartnersSection';
import ServicesSection from '@/components/home/ServicesSection';
import CasesSection from '@/components/home/CasesSection';
import JourneySection from '@/components/home/JourneySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactFormSection from '@/components/home/ContactFormSection';
import SEO from '@/components/shared/SEO';

const Index = () => {
  return (
    <PageLayout>
      <SEO
        title="Home"
        description="A primeira consultoria de Revenue Operations do Brasil. Unificamos Marketing, Vendas e CS para escalar operações B2B."
        canonical="https://revhackers.com"
      />
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
