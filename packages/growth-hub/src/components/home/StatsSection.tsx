
import { Card } from '@/components/ui/card';
import { TrendingUp, Target, BarChart3, Users } from 'lucide-react';
import StatsCounter from '@/components/shared/StatsCounter';

const stats = [
  {
    value: 150,
    suffix: "+",
    label: "Empresas B2B atendidas",
    description: "Em diversos segmentos e portes",
    icon: Users
  },
  {
    value: 32,
    suffix: "%",
    label: "Aumento médio em vendas",
    description: "Nos primeiros 6 meses de implementação",
    icon: TrendingUp
  },
  {
    value: 5,
    suffix: "x",
    label: "Retorno médio",
    description: "Multiplicação dos resultados no primeiro ano",
    icon: Target
  },
  {
    value: 2,
    suffix: "h",
    label: "Tempo médio de resposta",
    description: "Para diagnósticos e propostas comerciais",
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
            Números que mostram o impacto real que geramos
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="interactive-card p-8 text-center group glow-effect animate-slide-in-stagger" style={{ '--stagger-delay': `${index * 0.1}s` } as React.CSSProperties}>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-revgreen/20 to-green-100 text-revgreen mb-6 group-hover:scale-110 transition-transform duration-300 shimmer-effect">
                  <IconComponent className="h-8 w-8" />
                </div>
                <p className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-revgreen to-green-600 bg-clip-text text-transparent mb-3 animate-gradient-shift">
                  <StatsCounter end={stat.value} suffix={stat.suffix} />
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
