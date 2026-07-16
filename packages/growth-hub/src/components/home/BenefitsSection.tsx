
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
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Por que escolher a <img src="/lovable-uploads/00aac887-24ac-4c80-a2f3-d4912050bb97.png" alt="RevHackers" className="h-14 md:h-16 inline-block align-middle mx-2" />?
          </h2>
          <p className="text-lg text-gray-600">
            Entendemos suas dúvidas e desafios. Veja como nossa abordagem resolve os principais 
            pontos de dor de empresas B2B que buscam crescimento sustentável.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 bg-revgreen/10 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-revgreen" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
