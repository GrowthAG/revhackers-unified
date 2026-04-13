
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
        description="A primeira consultoria de Revenue Operations do Brasil. Integramos IA, CRM e automações para escalar operações B2B em São Paulo e todo o Brasil."
        canonical="https://revhackers.com.br/"
        faq={[
          { question: "O que faz a RevHackers?", answer: "A RevHackers é uma consultoria de Revenue Operations que integra Marketing, Vendas e Customer Success através de IA, CRM e automações para escalar receita de empresas B2B no Brasil." },
          { question: "O que é um Revenue Leak?", answer: "Revenue Leaks são falhas silenciosas na operação comercial - leads qualificados que se perdem, follow-ups esquecidos, dados desconectados entre CRM e marketing - que causam perda de receita sem que a empresa perceba." },
          { question: "Como agendar uma auditoria gratuita?", answer: "Você pode agendar uma auditoria de receita gratuita diretamente pelo site em revhackers.com.br/booking. A auditoria mapeia vazamentos na operação B2B e apresenta um plano de ação personalizado." }
        ]}
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
