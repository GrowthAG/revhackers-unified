
import { CheckCircle } from 'lucide-react';

interface ValueItem {
  title: string;
  description: string;
}

const ValuesSection = () => {
  const values: ValueItem[] = [
    {
      title: "Orientação por dados",
      description: "Todas as decisões e estratégias são fundamentadas em dados concretos, análises aprofundadas e evidências mensuráveis, não em suposições ou tendências passageiras."
    },
    {
      title: "Inovação constante",
      description: "Buscamos continuamente novas tecnologias, metodologias e abordagens para garantir que nossos clientes estejam sempre à frente em suas estratégias de crescimento."
    },
    {
      title: "Transparência",
      description: "Mantemos comunicação clara e honesta sobre resultados, desafios e oportunidades, construindo relações de confiança duradouras com nossos clientes e parceiros."
    },
    {
      title: "Resultados mensuráveis",
      description: "Focamos em KPIs claros e resultados tangíveis que impactam diretamente o crescimento e a lucratividade dos negócios que atendemos."
    },
    {
      title: "Transferência de conhecimento",
      description: "Não apenas implementamos soluções, mas capacitamos equipes para que possam continuar evoluindo e executando estratégias de crescimento com autonomia."
    },
    {
      title: "Excelência técnica",
      description: "Mantemos o mais alto padrão de qualidade técnica em nossas implementações, estratégias e recomendações, com equipe especializada e em constante atualização."
    }
  ];

  return (
    <section className="py-24 md:py-48 bg-white">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto mb-32">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-black rounded-full" />
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-[0.4em] font-black">
                  // Core_Principles
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[0.85]">
                NOSSOS <br />
                VALORES<span className="text-revgreen">.</span>
              </h2>
            </div>
            <p className="text-lg text-zinc-500 max-w-xs font-medium tracking-tight leading-relaxed">
              Princípios que guiam nossa atuação e nosso compromisso inegociável.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-100 border border-zinc-100 max-w-7xl mx-auto shadow-2xl shadow-zinc-200/50">
          {values.map((value, index) => (
            <div
              key={index}
              className="p-12 bg-white hover:bg-zinc-50 transition-all duration-500 group"
            >
              <div className="space-y-12">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-300 font-black tracking-widest uppercase">
                  <span>PR_VAL.{index + 1}</span>
                  <CheckCircle className="h-4 w-4 text-zinc-100 group-hover:text-revgreen transition-colors" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-black tracking-tighter leading-none uppercase italic">
                    {value.title}
                  </h3>
                  <p className="text-zinc-500 leading-relaxed text-[14px] font-medium">
                    {value.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
