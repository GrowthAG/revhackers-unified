
import { Card } from '@/components/ui/card';
import { TrendingUp, Target, BarChart3, Users } from 'lucide-react';

const stats = [
  {
    value: "150+",
    label: "Empresas B2B atendidas",
    description: "Em diversos segmentos e portes",
    icon: Users
  },
  {
    value: "32%",
    label: "Aumento médio em vendas",
    description: "Nos primeiros 6 meses de implementação",
    icon: TrendingUp
  },
  {
    value: "5x",
    label: "ROI médio",
    description: "Retorno sobre investimento no primeiro ano",
    icon: Target
  },
  {
    value: "24%",
    label: "Redução média de churn",
    description: "Após implementação de RevOps",
    icon: BarChart3
  }
];

const StatsSection = () => {
  return (
    <section className="section-padding-sm bg-gray-50/50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="section-title mb-6 animate-fadeUp">
            Resultados que <span className="text-transparent bg-gradient-to-r from-revgreen to-green-600 bg-clip-text">entregamos</span>
          </h2>
          <p className="text-xl text-gray-600 animate-fade-in-delayed">
            Números que comprovam a eficácia da nossa metodologia
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="card-premium p-8 text-center group hover:shadow-2xl animate-scaleIn" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-revgreen/20 to-green-100 text-revgreen mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-8 w-8" />
                </div>
                <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-revgreen to-green-600 bg-clip-text text-transparent mb-3">
                  {stat.value}
                </p>
                <p className="text-xl font-semibold mb-3 text-gray-800">{stat.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{stat.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
