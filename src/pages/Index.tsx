
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PartnersSection from '@/components/home/PartnersSection';
import JourneySection from '@/components/home/JourneySection';
import BenefitsSection from '@/components/home/BenefitsSection';
import FAQSection from '@/components/home/FAQSection';
import StatsSection from '@/components/home/StatsSection';
import QuoteSection from '@/components/home/QuoteSection';
import ContactFormSection from '@/components/home/ContactFormSection';
import CasesSection from '@/components/home/CasesSection';
import ROICalculator from '@/components/shared/ROICalculator';
import AnimatedSection from '@/components/shared/AnimatedSection';

const Index = () => {
  return (
    <PageLayout>
      <HeroSection />
      <AnimatedSection animation="fade-in-viewport">
        <StatsSection />
      </AnimatedSection>
      <AnimatedSection animation="slide-up-viewport" delay="stagger-1">
        <BenefitsSection />
      </AnimatedSection>
      <AnimatedSection animation="fade-in-viewport" delay="stagger-2">
        <ServicesSection />
      </AnimatedSection>
      <AnimatedSection animation="scale-in-viewport">
        <ROICalculator />
      </AnimatedSection>
      <AnimatedSection animation="slide-up-viewport">
        <CasesSection />
      </AnimatedSection>
      <AnimatedSection animation="fade-in-viewport" delay="stagger-1">
        <JourneySection />
      </AnimatedSection>
      <AnimatedSection animation="slide-up-viewport" delay="stagger-2">
        <PartnersSection />
      </AnimatedSection>
      <AnimatedSection animation="fade-in-viewport">
        <TestimonialsSection />
      </AnimatedSection>
      <AnimatedSection animation="slide-up-viewport" delay="stagger-1">
        <QuoteSection />
      </AnimatedSection>
      <AnimatedSection animation="fade-in-viewport" delay="stagger-2">
        <FAQSection />
      </AnimatedSection>
      <AnimatedSection animation="scale-in-viewport">
        <ContactFormSection />
      </AnimatedSection>
    </PageLayout>
  );
};

export default Index;
