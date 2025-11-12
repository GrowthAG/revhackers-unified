
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// This would normally come from an API or CMS
const servicosData = {
  "automacao": {
    title: "Automação de Revenue",
    description: "Automatizamos processos comerciais e de marketing para gerar mais resultados com menos esforço.",
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998",
    benefits: [
      "Redução de tarefas manuais e repetitivas",
      "Qualificação automática de leads",
      "Nurturing personalizado de prospects",
      "Integração entre marketing e vendas",
      "Otimização contínua baseada em dados"
    ],
    features: [
      {
        title: "Automação de Processos",
        description: "Mapeamento e automatização de processos críticos de marketing e vendas para eliminar tarefas manuais e repetitivas."
      },
      {
        title: "Implementação de CRM",
        description: "Seleção, implementação e customização de CRMs para atender às necessidades específicas do seu negócio."
      },
      {
        title: "Fluxos de Nutrição",
        description: "Desenvolvimento de fluxos de nutrição de leads personalizados para aumentar a conversão e reduzir o ciclo de vendas."
      },
      {
        title: "Otimização Contínua",
        description: "Análise constante de resultados e otimização dos fluxos para melhoria contínua do funil de vendas."
      }
    ],
    caseStudies: [
      {
        company: "Ambipar",
        result: "173% de aumento em leads qualificados",
        image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-Ambipar.png",
        slug: "ambipar"
      },
      {
        company: "NTT DATA",
        result: "267% aumento em MQLs",
        image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-NTTDATA.png",
        slug: "ntt-data"
      }
    ]
  },
  "revenue-intelligence": {
    title: "Revenue Intelligence",
    description: "Análise e insights a partir dos seus dados para melhorar a tomada de decisão em vendas e marketing.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    benefits: [
      "Decisões baseadas em dados concretos",
      "Visualização clara de métricas-chave",
      "Identificação de tendências e padrões",
      "Previsibilidade de resultados",
      "Otimização de estratégias baseada em dados"
    ],
    features: [
      {
        title: "Integração de Dados",
        description: "Integração de dados de diversas fontes para criar uma visão unificada do cliente e do funil de vendas."
      },
      {
        title: "Dashboards Personalizados",
        description: "Criação de dashboards personalizados para acompanhamento de métricas-chave do seu negócio."
      },
      {
        title: "Análise Preditiva",
        description: "Utilização de técnicas avançadas de análise para identificar tendências e prever resultados futuros."
      },
      {
        title: "Data-Driven Decisions",
        description: "Implementação de processos de tomada de decisão baseados em dados concretos e não em intuições."
      }
    ],
    caseStudies: [
      {
        company: "PetroReconcavo",
        result: "38% redução no CAC",
        image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-petroreconcavo.png",
        slug: "petroreconcavo"
      },
      {
        company: "Neoenergia",
        result: "124% aumento em oportunidades",
        image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-NEOENERGIA.png",
        slug: "neoenergia"
      }
    ]
  },
  "revops": {
    title: "Revenue Operations",
    description: "Alinhamento entre marketing, vendas e CS para uma gestão integrada do funil de vendas.",
    coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978",
    benefits: [
      "Alinhamento entre equipes de marketing, vendas e CS",
      "Visão integrada do funil de vendas",
      "Redução do ciclo de vendas",
      "Aumento da taxa de conversão",
      "Crescimento escalável e previsível"
    ],
    features: [
      {
        title: "Análise de Funil",
        description: "Análise detalhada do funil de vendas para identificar gargalos e oportunidades de melhoria."
      },
      {
        title: "Alinhamento de Processos",
        description: "Implementação de processos alinhados entre marketing, vendas e customer success."
      },
      {
        title: "Metodologias Ágeis",
        description: "Implementação de metodologias ágeis para permitir adaptação rápida às mudanças do mercado."
      },
      {
        title: "Otimização de Ciclo",
        description: "Otimização do ciclo de vendas para reduzir o tempo entre lead e fechamento de negócio."
      }
    ],
    caseStudies: [
      {
        company: "Ambipar",
        result: "173% de aumento em leads qualificados",
        image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-Ambipar.png",
        slug: "ambipar"
      },
      {
        company: "NTT DATA",
        result: "267% aumento em MQLs",
        image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-NTTDATA.png",
        slug: "ntt-data"
      }
    ]
  },
  "integracoes": {
    title: "Integração de Sistemas",
    description: "Conectamos suas ferramentas de CRM, Marketing e CS em um ecossistema tecnológico sem barreiras de dados.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
    benefits: [
      "Eliminação de silos de informação",
      "Visão unificada do cliente",
      "Automação de fluxos entre sistemas",
      "Redução de erros e inconsistências",
      "Tomada de decisão baseada em dados completos"
    ],
    features: [
      {
        title: "Mapeamento de Sistemas",
        description: "Identificação e mapeamento de todos os sistemas e ferramentas utilizados pela empresa para entender o fluxo de dados."
      },
      {
        title: "Desenvolvimento de APIs",
        description: "Criação de APIs personalizadas para conectar sistemas que não possuem integrações nativas."
      },
      {
        title: "Implementação de iPaaS",
        description: "Utilização de plataformas de integração como serviço para criar fluxos de dados automatizados entre sistemas."
      },
      {
        title: "Consultoria Técnica",
        description: "Suporte especializado para identificar as melhores soluções de integração para o seu ecossistema tecnológico."
      }
    ],
    caseStudies: [
      {
        company: "DataVoxx",
        result: "50% redução no tempo de implementação",
        image: "/lovable-uploads/b068bd61-d02d-4f35-a869-afd72751cf62.png",
        slug: "datavoxx"
      }
    ]
  },
  "customer-success": {
    title: "Customer Success",
    description: "Estratégias para maximizar a retenção e expansão da sua base de clientes.",
    coverImage: "https://images.unsplash.com/photo-1529070538774-1843cb3265df",
    benefits: [
      "Aumento da retenção de clientes",
      "Redução do churn",
      "Aumento da receita recorrente",
      "Melhoria na satisfação do cliente",
      "Identificação de oportunidades de upsell e cross-sell"
    ],
    features: [
      {
        title: "Implementação de processos de onboarding",
        description: "Desenvolvimento de processos estruturados para garantir o sucesso do cliente desde o primeiro dia."
      },
      {
        title: "Criação de programas de customer success",
        description: "Implementação de programas personalizados para diferentes segmentos de clientes."
      },
      {
        title: "Análise de churn e estratégias de retenção",
        description: "Identificação das causas de churn e desenvolvimento de estratégias para redução."
      },
      {
        title: "Desenvolvimento de estratégias de expansão",
        description: "Criação de estratégias para identificar e aproveitar oportunidades de upsell e cross-sell."
      }
    ],
    caseStudies: [
      {
        company: "Emagrecentro",
        result: "35% aumento na retenção",
        image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-emagrecentro.png",
        slug: "emagrecentro"
      },
      {
        company: "FMU Virtual",
        result: "45% redução no churn",
        image: "https://revhackers.com.br/wp-content/uploads/2023/04/Logotipo-da-FMU.png",
        slug: "fmu-virtual"
      }
    ]
  },
  "abm": {
    title: "Account Based Marketing",
    description: "Estratégias personalizadas para conquistar contas estratégicas com abordagem altamente direcionada.",
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    benefits: [
      "Foco em contas de alto valor",
      "Personalização de abordagem por conta",
      "Alinhamento entre marketing e vendas",
      "Aumento da taxa de conversão",
      "Redução do ciclo de vendas"
    ],
    features: [
      {
        title: "Identificação de contas-alvo",
        description: "Análise e seleção de contas com maior potencial de negócio para sua empresa."
      },
      {
        title: "Desenvolvimento de estratégias personalizadas",
        description: "Criação de estratégias específicas para cada conta ou segmento de contas."
      },
      {
        title: "Implementação de campanhas multicanal",
        description: "Desenvolvimento e execução de campanhas integradas em diversos canais."
      },
      {
        title: "Mensuração de resultados e otimização",
        description: "Acompanhamento constante de resultados e otimização das estratégias."
      }
    ],
    caseStudies: [
      {
        company: "ENICS",
        result: "3 mil ingressos em 30 dias",
        image: "/lovable-uploads/a05718ad-1822-4102-909a-7e86af151e98.png",
        slug: "enics"
      },
      {
        company: "Agence MR",
        result: "200% aumento em oportunidades",
        image: "/lovable-uploads/6c09375e-5298-4672-9226-27eb60a6b038.png",
        slug: "agence-mr"
      }
    ]
  },
  "sales-enablement": {
    title: "Sales Enablement",
    description: "Capacitação e ferramentas para potencializar o desempenho da sua equipe de vendas.",
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    benefits: [
      "Aumento da produtividade da equipe de vendas",
      "Redução do ciclo de vendas",
      "Melhoria na qualidade das apresentações",
      "Uniformização do discurso de vendas",
      "Aumento da taxa de fechamento"
    ],
    features: [
      {
        title: "Desenvolvimento de materiais de vendas",
        description: "Criação de apresentações, propostas e outros materiais que apoiam o processo de vendas."
      },
      {
        title: "Treinamento e capacitação de equipes",
        description: "Programas de treinamento para melhorar habilidades técnicas e comportamentais."
      },
      {
        title: "Implementação de ferramentas de produtividade",
        description: "Seleção e implementação de ferramentas para aumentar a eficiência da equipe."
      },
      {
        title: "Otimização de processos de vendas",
        description: "Análise e melhoria contínua dos processos de prospecção, qualificação e fechamento."
      }
    ],
    caseStudies: [
      {
        company: "TOEFL Junior Brasil",
        result: "Leads B2B para escolas",
        image: "/lovable-uploads/46993eff-c4c5-41af-b7ee-c93ef0366f59.png",
        slug: "toefl"
      },
      {
        company: "Funnels",
        result: "130% aumento em leads qualificados",
        image: "/lovable-uploads/e468ed87-3eee-496b-bb1a-3525f02f8429.png",
        slug: "funnels"
      }
    ]
  }
};

const ServicosDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const serviceData = slug ? servicosData[slug as keyof typeof servicosData] : null;

  if (!serviceData) {
    return (
      <PageLayout>
        <div className="container-custom py-32">
          <h1 className="text-3xl font-bold">Serviço não encontrado</h1>
          <p className="mt-4">O serviço que você está procurando não existe ou foi removido.</p>
          <Button asChild className="mt-8">
            <a href="/servicos">Voltar para serviços</a>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <section className="pt-32 pb-12 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {serviceData.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {serviceData.description}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <img 
              src={serviceData.coverImage} 
              alt={serviceData.title} 
              className="w-full h-auto rounded-xl mb-12 shadow-lg"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div>
                <h2 className="text-2xl font-bold mb-6">Benefícios</h2>
                <ul className="space-y-4">
                  {serviceData.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-revgreen mr-3 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-6">Como podemos ajudar</h2>
                <p className="text-gray-700 mb-6">
                  Nossa abordagem personalizada para {serviceData.title.toLowerCase()} é adaptada às necessidades específicas do seu negócio, garantindo resultados mensuráveis e escaláveis.
                </p>
                <Button asChild size="lg" className="w-full">
                  <a href="/diagnostico">Solicitar diagnóstico gratuito</a>
                </Button>
              </div>
            </div>
            
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">O que está incluso</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceData.features.map((feature, index) => (
                  <div key={index} className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6">Cases de Sucesso</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {serviceData.caseStudies.map((caseStudy, index) => (
                  <a href={`/cases/${caseStudy.slug}`} key={index}>
                    <Card className="overflow-hidden card-hover h-full border-0 shadow-sm">
                      <div className="h-32 overflow-hidden bg-white flex items-center justify-center p-6">
                        <img 
                          src={caseStudy.image} 
                          alt={caseStudy.company} 
                          className="w-3/4 h-auto object-contain transition-transform hover:scale-105 duration-500"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-2">{caseStudy.company}</h3>
                        <span className="text-xs px-3 py-1 bg-green-50 text-green-800 rounded-full font-medium">
                          {caseStudy.result}
                        </span>
                        <div className="mt-4 flex items-center text-revgreen font-medium text-sm">
                          <span>Ver case completo</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="bg-black text-white p-8 md:p-12 rounded-xl">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Pronto para transformar seu negócio?
                </h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Entre em contato agora mesmo e descubra como nossa solução de {serviceData.title} 
                  pode ajudar sua empresa a alcançar resultados extraordinários.
                </p>
                <Button asChild size="lg" variant="default">
                  <a href="/diagnostico">Solicitar diagnóstico gratuito</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default ServicosDetalhe;
