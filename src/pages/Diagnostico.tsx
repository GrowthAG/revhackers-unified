
import { CheckCircle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import DiagnosticWizard from '@/components/diagnostic/DiagnosticWizard';
import Section from '@/components/ui/Section';

const benefits = [
  "Análise da Estratégia Digital",
  "Oportunidades de Crescimento",
  "Benchmarks do Segmento",
  "Plano de Ação Personalizado",
  "Tecnologias de Revenue",
  "Roadmap de Aceleração"
];

const DiagnosticoPage = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <Section variant="light" className="relative pt-24 pb-16 md:pt-32 md:pb-24 min-h-[50vh] flex flex-col justify-center items-center overflow-hidden bg-white">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

        <div className="container-custom relative z-10 text-center">
          {/* Badge */}
          <div className="mb-6 flex items-center justify-center animate-fade-in">
            <span className="text-xs font-semibold text-gray-700 tracking-wide uppercase bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
              Diagnóstico de Growth
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-[1.05] tracking-tight">
            Descubra o Score da <br className="hidden md:block" />
            <span className="text-zinc-400 font-light">sua Máquina de Vendas</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-zinc-500 mb-8 max-w-3xl mx-auto leading-relaxed font-light tracking-tight">
            Responda 15 perguntas estratégicas para mapear o nível de maturidade da sua operação.
            Receba um relatório imediato com os próximos passos para escala.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-left">
                <CheckCircle className="w-5 h-5 text-revgreen flex-shrink-0" />
                <span className="text-sm text-black font-semibold uppercase tracking-widest text-[10px]">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Wizard Section */}
      <Section variant="light" className="py-16 bg-white border-t border-zinc-100">
        <div className="container-custom">
          <DiagnosticWizard />
        </div>
      </Section>
    </PageLayout>
  );
};

export default DiagnosticoPage;
