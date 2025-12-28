
const HistorySection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter text-black uppercase">
            Nossa história
          </h2>
          <p className="text-xl text-zinc-500 font-normal tracking-tight">
            Como nasceu a RevHackers e nossa missão de transformar o crescimento B2B no Brasil
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
              alt="Tecnologia e dados para crescimento de negócios"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4">Do problema à solução</h3>
            <p className="text-gray-700">
              Fundada em 2019, a RevHackers nasceu da percepção de que empresas B2B brasileiras
              enfrentavam desafios complexos para crescer de forma escalável e previsível. Nossa equipe
              de especialistas identificou que faltavam metodologias estruturadas e orientadas por dados
              para impulsionar o crescimento sustentável.
            </p>
            <p className="text-gray-700">
              Combinando experiência em marketing, tecnologia e dados, desenvolvemos frameworks próprios
              que já ajudaram mais de 150 empresas a transformar seus resultados através de estratégias
              como PLG, ABM e automação avançada.
            </p>
            <p className="text-gray-700">
              Hoje, trabalhamos com empresas de diversos setores e tamanhos, sempre com foco em
              entregar resultados mensuráveis e construir capacidades internas para crescimento contínuo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistorySection;
