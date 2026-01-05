
import { CheckCircle2, ShieldCheck, TrendingUp, Users, LineChart, BarChart4 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const benefits = [
  {
    icon: TrendingUp,
    title: "Crescimento Acelerado",
    description: "Aumente sua receita recorrente em média 32% nos primeiros 6 meses com nossas estratégias de Revenue Operations."
  },
  {
    icon: Users,
    title: "Alinhamento de Times",
    description: "Elimine silos entre marketing, vendas e CS, criando uma experiência fluida para seu cliente e reduzindo atrito interno."
  },
  {
    icon: LineChart,
    title: "Previsibilidade de Resultados",
    description: "Obtenha visibilidade clara sobre seu funil de vendas com dashboards inteligentes e métricas consistentes entre departamentos."
  },
  {
    icon: ShieldCheck,
    title: "Redução de Churn",
    description: "Nossos clientes reduzem em média 24% a taxa de cancelamento ao implementar nossas estratégias de RevOps."
  },
  {
    icon: BarChart4,
    title: "Resultados Concretos",
    description: "Retorno médio de 5x sobre o investimento em nossas soluções, com casos de sucesso em diversos segmentos B2B."
  },
  {
    icon: CheckCircle2,
    title: "Implementação Rápida",
    description: "Primeiros resultados visíveis em 30-45 dias, com metodologia estruturada e equipe técnica especializada."
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-24 md:py-40 bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-24 md:mb-32">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-10 tracking-tighter text-zinc-900 leading-[1.05] text-balance">
            Por que a RevHackers?
          </h2>
          <p className="text-xl md:text-2xl text-zinc-500 font-light tracking-tight max-w-2xl mx-auto leading-relaxed">
            Entendemos seus desafios. Veja como nossa abordagem resolve os pontos de dor de empresas B2B que buscam escala real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="card-apple p-12 md:p-14 group border-none bg-zinc-50"
            >
              <div className="flex flex-col items-start text-left">
                <div className="h-20 w-20 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mb-12 shadow-2xl shadow-zinc-200 group-hover:bg-black group-hover:scale-105 transition-all duration-700">
                  <benefit.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-6 text-zinc-900 tracking-tighter leading-tight">
                  {benefit.title}
                </h3>
                <p className="text-zinc-500 leading-relaxed text-lg font-normal">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
