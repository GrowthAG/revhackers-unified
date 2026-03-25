
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { ArrowRight, BarChart2, Globe, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DiagnosticoGateway = () => {
  const navigate = useNavigate();

  const diagnostics = [
    {
      id: 'growth',
      title: 'Diagnóstico 360',
      description: 'Visão Holística: Produto, Operação, Aquisição e Retenção para encontrar o gargalo da sua empresa.',
      icon: TrendingUp,
      path: '/score',
    },
    {
      id: 'revenue',
      title: 'Diagnóstico CRM',
      description: 'Deep Dive em Vendas: RevOps, Pipeline, Ferramentas e Processo Comercial.',
      icon: BarChart2,
      path: '/score-revenue',
    },
    {
      id: 'founder',
      title: 'Diagnóstico Founder',
      description: 'Como a sua autoridade e dependência operacional afetam o crescimento.',
      icon: User,
      path: '/score-founder',
    },
    {
      id: 'site',
      title: 'Diagnóstico Site',
      description: 'Auditoria técnica de Infraestrutura, Vitals, Conversão e Tracking.',
      icon: Globe,
      path: '/score-site',
    },
  ];

  return (
    <PageLayout>
      <Section variant="light" className="py-24 md:py-32 bg-white min-h-[90vh] flex flex-col justify-center">
        <div className="container-custom max-w-5xl">

          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight mb-6">
              Selecione seu <span className="text-zinc-400">Protocolo</span>
            </h1>
            <p className="text-xl text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed">
              Nossa inteligência artificial analisa diferentes dimensões do seu negócio. Escolha por onde começar a otimização.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diagnostics.map((diag) => (
              <div
                key={diag.id}
                onClick={() => navigate(diag.path)}
                className="group cursor-pointer bg-white border border-zinc-200 p-8 md:p-10 hover:border-black hover:bg-zinc-50 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                  <ArrowRight className="w-6 h-6 text-black" />
                </div>

                <div className="mb-6">
                  <diag.icon className="w-8 h-8 text-black" strokeWidth={1} />
                </div>

                <h3 className="text-2xl font-bold text-black mb-3 group-hover:translate-x-1 transition-transform duration-300">
                  {diag.title}
                </h3>

                <p className="text-zinc-500 font-light leading-relaxed group-hover:text-zinc-600 transition-colors">
                  {diag.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </Section>
    </PageLayout>
  );
};

export default DiagnosticoGateway;
