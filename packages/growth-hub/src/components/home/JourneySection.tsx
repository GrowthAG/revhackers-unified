
import { Check } from 'lucide-react';
import Section from '@/components/ui/Section';

const journeySteps = [
  {
    id: "01",
    title: "Diagnóstico & Blueprint",
    desc: "Mapeamento completo de gargalos. Entregamos o plano de arquitetura de dados e funil em 7 dias.",
    items: ["Auditoria de CRM", "Análise de Unit Economics", "Definição de Stack"]
  },
  {
    id: "02",
    title: "Setup de Engenharia",
    desc: "Implementação técnica. Configuramos suas ferramentas para falarem a mesma língua (Marketing + Sales).",
    items: ["Integração via API/Webhook", "Tracking Avançado", "Score de Leads"]
  },
  {
    id: "03",
    title: "Tração & Otimização",
    desc: "Escala baseada em dados. Otimizamos campanhas e processos de vendas semanalmente.",
    items: ["Testes A/B em Canais", "Refinamento de Playbooks", "Reporting Executivo"]
  }
];

const JourneySection = () => {
  return (
    <Section variant="light" className="border-t border-gray-100 py-32 bg-white">
      {/* Centered Standard Header - Light Mode */}
      <div className="text-center mb-20 max-w-3xl mx-auto">
        <span className="font-mono-tech text-gray-400 text-xs uppercase tracking-widest mb-4 block">
          Metodologia Proprietária
        </span>
        <h2 className="text-4xl md:text-5xl font-medium mb-6 text-black tracking-tight">
          Como Construímos Máquinas
        </h2>
        <p className="text-gray-500 text-lg font-light">
          Do caos à previsibilidade em 3 etapas claras.
        </p>
      </div>

      <div className="container-custom relative z-10">
        {/* Connector Line (Desktop) - Gray for Light Mode */}
        <div className="absolute top-[80px] left-0 w-full h-[1px] bg-gray-200 hidden md:block -z-10"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {journeySteps.map((step, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 p-8 rounded-sm relative group hover:border-revgreen transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {/* Number Badge - Inverted */}
              <div className="w-16 h-16 bg-white border border-gray-200 text-black font-mono-tech text-xl flex items-center justify-center mb-8 group-hover:bg-revgreen group-hover:text-black group-hover:border-revgreen transition-colors duration-300 z-10 relative">
                {step.id}
              </div>

              <h3 className="text-2xl font-bold text-black mb-4">{step.title}</h3>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed font-light border-b border-gray-100 pb-8">
                {step.desc}
              </p>

              <ul className="space-y-3">
                {step.items.map((item, idx) => (
                  <li key={idx} className="flex items-center text-xs uppercase tracking-wider text-gray-500 font-mono-tech">
                    <div className="w-1.5 h-1.5 bg-revgreen mr-3"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default JourneySection;
