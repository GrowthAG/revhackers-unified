
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { ArrowRight, BarChart2, Globe, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/shared/SEO';

const DiagnosticoGateway = () => {
  const navigate = useNavigate();

  const diagnostics = [
    {
      id: 'growth',
      title: 'Diagnóstico 360',
      icon: TrendingUp,
      path: '/score',
    },
    {
      id: 'revenue',
      title: 'Diagnóstico CRM',
      icon: BarChart2,
      path: '/score-revenue',
    },
    {
      id: 'founder',
      title: 'Diagnóstico do Fundador',
      icon: User,
      path: '/score-founder',
    },
    {
      id: 'site',
      title: 'Diagnóstico Site / LP',
      icon: Globe,
      path: '/score-site',
    },
  ];

  return (
    <PageLayout>
      <SEO title="Diagnóstico 360" description="Descubra onde estão os vazamentos na sua operação B2B com diagnósticos gratuitos de Growth, CRM, Founder e Site." canonical="https://revhackers.com.br/diagnostico" />
      <Section variant="light" className="py-24 md:py-32 bg-white min-h-[90vh] flex flex-col justify-center">
        <div className="container-custom max-w-5xl">

          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-black tracking-tight mb-6 uppercase">
              Descubra onde o seu <span className="text-revgreen bg-revgreen/10 px-2 py-1 mx-2">caixa vaza</span>
            </h1>
            <p className="text-xl text-zinc-500 font-medium max-w-3xl mx-auto leading-relaxed">
              Responda a perguntas hiper-qualificadas sobre sua estrutura em 1 minuto. Nossa IA calcula o seu gargalo principal e como a ineficiência técnica sabota suas metas.
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

                <h3 className="text-2xl font-bold text-black group-hover:translate-x-1 transition-transform duration-300">
                  {diag.title}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </Section>
    </PageLayout>
  );
};

export default DiagnosticoGateway;
