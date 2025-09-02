import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, ArrowRight, Star, Zap, Target, TrendingUp } from 'lucide-react';

interface FeatureComparisonProps {
  title: string;
  description: string;
}

const FeatureComparison = ({ title, description }: FeatureComparisonProps) => {
  const [activeTab, setActiveTab] = useState('before');

  const beforeAfterData = {
    before: {
      title: "Situação Anterior",
      items: [
        { text: "Equipes trabalhando isoladamente", icon: "❌" },
        { text: "Dados espalhados em múltiplas ferramentas", icon: "❌" },
        { text: "Falta de visibilidade do funil completo", icon: "❌" },
        { text: "Processos manuais demorados", icon: "❌" },
        { text: "Dificuldade para medir ROI real", icon: "❌" }
      ],
      color: "from-red-500 to-red-600"
    },
    after: {
      title: "Com RevOps",
      items: [
        { text: "Alinhamento total entre Marketing, Vendas e CS", icon: "✅" },
        { text: "Dados centralizados e acessíveis", icon: "✅" },
        { text: "Visão 360° da jornada do cliente", icon: "✅" },
        { text: "Automações inteligentes", icon: "✅" },
        { text: "Métricas claras e acionáveis", icon: "✅" }
      ],
      color: "from-revgreen to-green-600"
    }
  };

  return (
    <section className="section-padding bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="section-title mb-6 animate-fadeUp">
            {title}
          </h2>
          <p className="text-xl text-gray-600 animate-fade-in-delayed">
            {description}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-12 h-14">
              <TabsTrigger value="before" className="text-lg font-medium h-full">
                Antes da RevOps
              </TabsTrigger>
              <TabsTrigger value="after" className="text-lg font-medium h-full">
                Com RevOps
              </TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <TabsContent value="before" className="lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <Card className="interactive-card border-red-200">
                    <CardContent className="p-8">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${beforeAfterData.before.color} text-white mb-6`}>
                        <span className="font-medium">{beforeAfterData.before.title}</span>
                      </div>
                      <div className="space-y-4">
                        {beforeAfterData.before.items.map((item, index) => (
                          <div key={index} className="flex items-center animate-slide-in-stagger" 
                               style={{ '--stagger-delay': `${index * 0.1}s` } as React.CSSProperties}>
                            <span className="text-2xl mr-3">{item.icon}</span>
                            <span className="text-gray-700">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="interactive-card border-green-200 glow-effect">
                    <CardContent className="p-8">
                      <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${beforeAfterData.after.color} text-white mb-6`}>
                        <span className="font-medium">{beforeAfterData.after.title}</span>
                      </div>
                      <div className="space-y-4">
                        {beforeAfterData.after.items.map((item, index) => (
                          <div key={index} className="flex items-center animate-slide-in-stagger" 
                               style={{ '--stagger-delay': `${index * 0.1}s` } as React.CSSProperties}>
                            <span className="text-2xl mr-3">{item.icon}</span>
                            <span className="text-gray-700">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="after" className="lg:col-span-2">
                <Card className="interactive-card border-green-200 glow-effect">
                  <CardContent className="p-8">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${beforeAfterData.after.color} text-white mb-6`}>
                      <span className="font-medium">{beforeAfterData.after.title}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {beforeAfterData.after.items.map((item, index) => (
                        <div key={index} className="flex items-center animate-slide-in-stagger" 
                             style={{ '--stagger-delay': `${index * 0.1}s` } as React.CSSProperties}>
                          <span className="text-2xl mr-3">{item.icon}</span>
                          <span className="text-gray-700">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

// Componente de badges animados para social proof
export const AnimatedBadges = () => {
  const badges = [
    { text: "150+ Clientes", icon: Star, color: "bg-blue-100 text-blue-800" },
    { text: "32% Crescimento Médio", icon: TrendingUp, color: "bg-green-100 text-green-800" },
    { text: "5x ROI Médio", icon: Target, color: "bg-purple-100 text-purple-800" },
    { text: "Implementação Rápida", icon: Zap, color: "bg-yellow-100 text-yellow-800" }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {badges.map((badge, index) => {
        const IconComponent = badge.icon;
        return (
          <Badge 
            key={index} 
            className={`${badge.color} px-4 py-2 text-sm font-medium animate-bounce-gentle shimmer-effect`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <IconComponent className="w-4 h-4 mr-2" />
            {badge.text}
          </Badge>
        );
      })}
    </div>
  );
};

export default FeatureComparison;