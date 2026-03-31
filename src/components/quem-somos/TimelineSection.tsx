
interface TimelineEvent {
  year: number;
  title: string;
  description: string;
}

const TimelineSection = () => {
  const timelineEvents: TimelineEvent[] = [
    {
      year: 2014,
      title: "GrowthAG",
      description: "Nascemos como GrowthAG, focada em Pequenas e Médias empresas com estratégias de Mídia Paga."
    },
    {
      year: 2018,
      title: "A Era do Inbound",
      description: "Evolução para estratégias de Inbound Marketing, Automação e primeiras integrações de CRM."
    },
    {
      year: 2021,
      title: "Growth Agency",
      description: "Nos tornamos a Growth Agency. Consolidação da metodologia de Receita e expansão para grandes contas."
    },
    {
      year: 2025,
      title: "REVHACKERS",
      description: "O Rebranding definitivo. Deixamos de ser apenas serviço para ser um Hub de Tecnologia e Inteligência Artificial."
    },
    {
      year: 2026,
      title: "O Ápice da Essência",
      description: "Processo 100% Automatizado. Onboarding Orquestrado. Tudo Conectado. O estado da arte em Revenue Hacking."
    }
  ];

  return (
    <section className="py-24 md:py-48 bg-white overflow-hidden border-y border-zinc-100">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto mb-32">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-black rounded-full" />
                <span className="font-mono text-xxs text-zinc-400 uppercase tracking-[0.4em] font-black">
                  // Evolutionary_Roadmap
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[0.85]">
                JORNADA <br />
                EVOLUTIVA<span className="text-revgreen">.</span>
              </h2>
            </div>
            <p className="text-lg text-zinc-500 max-w-xs font-medium tracking-tight leading-relaxed">
              De Agência Local para um Ecossistema de Inteligência Integrada.
            </p>
          </div>
        </div>

        <div className="space-y-24 relative max-w-6xl mx-auto">
          {/* Vertical Technical Line */}
          <div className="absolute left-0 bottom-0 top-0 w-px bg-zinc-100" />

          {timelineEvents.map((event, index) => (
            <div key={index} className="relative pl-12 group">
              {/* Year Marker */}
              <div className="absolute left-0 -translate-x-1/2 top-1.5 flex flex-col items-center">
                <div className="w-3 h-3 bg-black rounded-full border-4 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] group-hover:bg-revgreen transition-colors" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-2">
                  <span className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none">
                    {event.year}
                  </span>
                </div>
                <div className="lg:col-span-10">
                  <div className="p-8 border border-zinc-100 rounded-none bg-white hover:border-black transition-all duration-500">
                    <h3 className="text-sm font-mono font-black text-zinc-400 uppercase tracking-widest mb-4">
                      PROTOCOL :: {event.title}
                    </h3>
                    <p className="text-zinc-600 font-medium leading-relaxed text-base max-w-3xl">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
