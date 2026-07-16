
interface TimelineEvent {
  year: number;
  title: string;
  description: string;
}

const TimelineSection = () => {
  const timelineEvents: TimelineEvent[] = [
    {
      year: 2012,
      title: "Nascimento da ideia",
      description: "Fundação da agência digital com foco em marketing digital para pequenas empresas."
    },
    {
      year: 2014,
      title: "Expansão para marketing B2B",
      description: "Especialização em estratégias de marketing para empresas de tecnologia e SaaS."
    },
    {
      year: 2016,
      title: "Entrada no mercado de automação",
      description: "Primeiros projetos de automação de marketing e implementação de CRM integrado."
    },
    {
      year: 2018,
      title: "Desenvolvimento da metodologia RevOps",
      description: "Criação da metodologia própria de Revenue Operations para empresas B2B."
    },
    {
      year: 2019,
      title: "Nasce a RevHackers",
      description: "Rebranding e foco exclusivo em estratégias de crescimento baseadas em RevOps."
    },
    {
      year: 2021,
      title: "Expansão nacional",
      description: "Abertura de novas frentes de atuação em diferentes regiões do Brasil."
    },
    {
      year: 2023,
      title: "Comunidade RevHackers",
      description: "Lançamento da comunidade para profissionais de RevOps, Marketing e Vendas B2B."
    },
    {
      year: 2025,
      title: "Consolidação de metodologia",
      description: "Implementação de frameworks proprietários e consolidação da metodologia em grandes empresas."
    },
    {
      year: 2026,
      title: "Expansão internacional",
      description: "Início das operações na América Latina e parcerias estratégicas com empresas globais de tecnologia."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Nossa Jornada
          </h2>
          <p className="text-lg text-gray-600">
            De 2012 até 2026: Como construímos a RevHackers ao longo dos anos
          </p>
        </div>
        
        <div className="relative">
          {/* Timeline center line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-revgreen/30"></div>
          
          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <div key={index} className="relative">
                {/* Desktop layout */}
                <div className="hidden md:flex items-center">
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'order-last pl-12'}`}>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-revgreen">{event.year}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                  
                  <div className="z-10 flex items-center justify-center w-10 h-10 bg-revgreen rounded-full shrink-0 mx-auto">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  
                  <div className={`w-1/2 ${index % 2 === 0 ? 'order-last pl-12' : 'pr-12 text-right'}`}>
                    {index % 2 !== 0 && (
                      <>
                        <div className="mb-2">
                          <span className="text-4xl font-bold text-revgreen">{event.year}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                        <p className="text-gray-600">{event.description}</p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Mobile layout */}
                <div className="md:hidden flex gap-4">
                  <div className="z-10 flex items-center justify-center w-10 h-10 bg-revgreen rounded-full shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-revgreen">{event.year}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-600">{event.description}</p>
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
