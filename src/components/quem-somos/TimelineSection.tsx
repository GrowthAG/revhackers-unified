
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
    <section className="py-20 md:py-32 bg-zinc-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">
            Nossa Jornada Evolutiva
          </h2>
          <p className="text-lg text-gray-600">
            De Agência Local para um Ecossistema Global de Inteligência
          </p>
        </div>

        <div className="relative">
          {/* Timeline center line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gray-200"></div>

          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <div key={index} className="relative">
                {/* Desktop layout */}
                <div className="hidden md:flex items-center">
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'order-last pl-12'}`}>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-revgreen tracking-tighter">{event.year}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 font-light">{event.description}</p>
                  </div>

                  <div className="z-10 flex items-center justify-center w-4 h-4 bg-white border-2 border-revgreen rounded-full shrink-0 mx-auto">
                  </div>

                  <div className={`w-1/2 ${index % 2 === 0 ? 'order-last pl-12' : 'pr-12 text-right'}`}>
                    {index % 2 !== 0 && (
                      <>
                        <div className="mb-2">
                          <span className="text-4xl font-bold text-revgreen tracking-tighter">{event.year}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-900">{event.title}</h3>
                        <p className="text-gray-600 font-light">{event.description}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="md:hidden flex gap-4 pl-4 border-l border-gray-200 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-2 w-3 h-3 bg-white border-2 border-revgreen rounded-full"></div>
                  </div>
                  <div className="pb-8">
                    <div className="mb-1">
                      <span className="text-2xl font-bold text-revgreen tracking-tighter">{event.year}</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
