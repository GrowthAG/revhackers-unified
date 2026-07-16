
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '@/components/ui/Section';

const services = [
  {
    id: "01",
    title: "Tração",
    subtitle: "& Mídia Paga",
    desc: "Engenharia de receitas.",
    link: "/servicos/tracao-midia-paga",
    color: "group-hover:text-revgreen",
    border: "group-hover:border-revgreen/50"
  },
  {
    id: "02",
    title: "Ecossistema",
    subtitle: "& CRM",
    desc: "Verdade nos dados.",
    link: "/servicos/ecossistema-crm",
    color: "group-hover:text-revgreen",
    border: "group-hover:border-revgreen/50"
  },
  {
    id: "03",
    title: "Automação",
    subtitle: "Inteligente + IA",
    desc: "Máquina invisível.",
    link: "/servicos/automacao-inteligente",
    color: "group-hover:text-revgreen",
    border: "group-hover:border-revgreen/50"
  },
  {
    id: "04",
    title: "Founder-Led",
    subtitle: "Growth",
    desc: "CPF compra de CPF.",
    link: "/servicos/founder-led-growth",
    color: "group-hover:text-revgreen",
    border: "group-hover:border-revgreen/50"
  }
];

const ServicesSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Section variant="dark" className="bg-black py-32 border-b border-white/10">
      <div className="container-custom">
        {/* Header - Minimalist */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-xl">
            <span className="font-mono-tech text-revgreen text-xs uppercase tracking-widest mb-4 block">
              Capabilities
            </span>
            <h2 className="text-4xl md:text-6xl font-medium text-white tracking-tighter">
              O Que Entregamos
            </h2>
          </div>
          <div className="mb-2">
            <Link to="/servicos" onClick={scrollToTop} className="text-gray-400 hover:text-revgreen uppercase tracking-wider text-xs border-b border-transparent hover:border-revgreen transition-all pb-1">
              Ver Todos os Serviços
            </Link>
          </div>
        </div>

        {/* Minimalist Grid - High Impact, Low Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <Link
              key={service.id}
              to={service.link}
              onClick={scrollToTop}
              className={`group relative h-96 p-8 bg-white/5 border border-white/10 flex flex-col justify-between transition-all duration-500 hover:bg-white/10 ${service.border}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-mono-tech text-gray-600 text-xs tracking-widest">{service.id}</span>
                <ArrowUpRight className={`w-6 h-6 text-gray-600 transition-colors duration-300 ${service.color}`} />
              </div>

              <div>
                <h3 className={`text-3xl font-bold text-white mb-1 leading-none group-hover:translate-x-2 transition-transform duration-300 ${service.color}`}>
                  {service.title}
                  <br />
                  <span className="opacity-70">{service.subtitle}</span>
                </h3>
                <p className="mt-4 text-gray-500 text-sm font-light tracking-wide group-hover:text-gray-300 transition-colors">
                  {service.desc}
                </p>
              </div>

              {/* Hover Effect Line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-current w-0 group-hover:w-full transition-all duration-500 ${service.color.replace('group-hover:text-', 'bg-')}`}></div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default ServicesSection;
