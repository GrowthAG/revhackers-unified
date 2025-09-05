
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
import ExitIntentPopup from '@/components/shared/ExitIntentPopup';
import SocialProofBar from '@/components/shared/SocialProofBar';
import SocialProofNotifications from '@/components/shared/SocialProofNotifications';
import TopSocialProof from '@/components/shared/TopSocialProof';

const Index = () => {
  return (
    <PageLayout>
      <ExitIntentPopup />
      {/* Social Proof no topo da página - 1 card a cada minuto */}
      <TopSocialProof />
      
      <HeroSection />
      <SocialProofBar />
      
      {/* Seção de Atividades Recentes - inline */}
      <section className="py-8 bg-gray-50/50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🔥 Atividades Recentes
              </h3>
              <p className="text-sm text-gray-600">
                Veja quem está aproveitando nossos conteúdos e serviços agora mesmo
              </p>
            </div>
            <SocialProofNotifications position="inline" limit={3} />
          </div>
        </div>
      </section>
      
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
