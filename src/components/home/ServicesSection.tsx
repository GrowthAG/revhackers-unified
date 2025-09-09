
import { ArrowRight, LineChart, Database, Zap, Bot, Layers, GitMerge, HeartPulse, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "Automação de Revenue",
    description: "Fluxos inteligentes que conectam marketing, vendas e CS para eliminar tarefas manuais e criar resultados concretos.",
    icon: Bot,
    link: "/servicos/automacao"
  },
  {
    title: "Revenue Intelligence",
    description: "Transforme dados brutos em decisões estratégicas precisas e antecipe comportamentos de compra no cenário B2B.",
    icon: Database,
    link: "/servicos/revenue-intelligence"
  },
  {
    title: "Revenue Operations",
    description: "Alinhamento estratégico entre departamentos com métricas e tecnologias que efetivamente geram crescimento.",
    icon: LineChart,
    link: "/servicos/revops"
  },
  {
    title: "Integração de Sistemas",
    description: "Conectamos suas ferramentas de CRM, Marketing e CS em um ecossistema tecnológico sem barreiras de dados.",
    icon: GitMerge,
    link: "/servicos/integracoes"
  },
  {
    title: "Customer Success",
    description: "Estratégias para maximizar a retenção e expansão da sua base de clientes através de experiências excepcionais.",
    icon: HeartPulse,
    link: "/servicos/customer-success"
  },
  {
    title: "Account Based Marketing",
    description: "Estratégias personalizadas para conquistar contas estratégicas com abordagem altamente direcionada.",
    icon: Target,
    link: "/servicos/abm"
  },
  {
    title: "Sales Enablement",
    description: "Capacitação e ferramentas para potencializar o desempenho da sua equipe de vendas.",
    icon: Users,
    link: "/servicos/sales-enablement"
  }
];

const ServicesSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="section-title mb-6 animate-fadeUp">
            Pare de perder <span className="text-transparent bg-gradient-to-r from-revgreen to-green-600 bg-clip-text">Leads</span> e comece a vender mais.
          </h2>
          <p className="text-xl text-gray-600 animate-fade-in-delayed">
            Nossas soluções de RevOps eliminam silos, otimizam seu funil e transformam caos em conversão.
          </p>
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.slice(0, 4).map((service, index) => (
              <Card key={index} className="interactive-card group animate-slide-in-stagger glow-effect" style={{ '--stagger-delay': `${index * 0.1}s` } as React.CSSProperties}>
                <CardHeader className="pb-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-revgreen/20 to-green-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shimmer-effect">
                    <service.icon className="h-7 w-7 text-revgreen" />
                  </div>
                  <CardTitle className="text-xl font-bold leading-tight">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-6 text-gray-600 leading-relaxed">{service.description}</CardDescription>
                  <Link 
                    to={service.link} 
                    onClick={scrollToTop} 
                    className="inline-flex items-center text-sm font-semibold text-revgreen hover:text-green-600 group-hover:translate-x-1 transition-all duration-300"
                  >
                    Saiba mais
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        
        <div className="mt-20 text-center animate-fade-up-delayed">
          <Button asChild variant="default" size="lg" className="rounded-full px-12">
            <Link to="/servicos" onClick={scrollToTop}>
              Ver todos os serviços
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
