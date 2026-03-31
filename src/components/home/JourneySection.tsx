
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
    title: "Setup de Arquitetura",
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
    <Section variant="light" className="border-t border-zinc-100 py-24 md:py-40 bg-white overflow-hidden">
      {/* Centered Standard Header - Light Mode */}
      <div className="text-center mb-24 md:mb-32 max-w-4xl mx-auto">
        <span className="font-mono text-xs text-zinc-400 uppercase tracking-[0.2em] mb-6 block">
          Metodologia Proprietária
        </span>
        <h2 className="text-4xl md:text-6xl font-black mb-8 text-zinc-900 tracking-tighter text-balance">
          Como Construímos Máquinas.
        </h2>
        <p className="text-xl md:text-2xl text-zinc-500 font-light tracking-tight max-w-2xl mx-auto leading-relaxed">
          Do caos à previsibilidade em 3 etapas de integração sistêmica.
        </p>
      </div>

      <div className="container-custom relative z-10">
        {/* Connector Line (Desktop) - Subtle Zinc */}
        <div className="absolute top-[100px] left-0 w-full h-px bg-zinc-100 hidden md:block -z-10"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {journeySteps.map((step, index) => (
            <div
              key={index}
              className="bg-white border border-zinc-100 p-10 md:p-12 rounded-[2.5rem] relative group hover:shadow-sm hover:shadow-zinc-200/50 transition-all duration-700 shadow-sm flex flex-col h-full"
            >
              {/* Number Badge - Inverted Mono */}
              <div className="w-16 h-16 bg-zinc-900 text-white font-mono text-xl flex items-center justify-center mb-10 group-hover:bg-black transition-all duration-500 shadow-sm shadow-zinc-200 group-hover:scale-110">
                {step.id}
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6 tracking-tight">{step.title}</h3>
              <p className="text-zinc-500 text-body mb-10 leading-relaxed font-normal flex-1">
                {step.desc}
              </p>

              <div className="pt-8 border-t border-zinc-50">
                <ul className="space-y-4">
                  {step.items.map((item, idx) => (
                    <li key={idx} className="flex items-center text-tiny font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 transition-colors">
                      <div className="w-2 h-2 bg-zinc-900 mr-4 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default JourneySection;
