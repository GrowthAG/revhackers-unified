
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
    <section className="py-20 md:py-32 bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter text-gray-900 uppercase">
            Nossos valores
          </h2>
          <p className="text-xl text-gray-600 font-normal tracking-tight">
            Princípios que guiam nossa atuação e nosso compromisso com os clientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-gray-50 border border-transparent p-8 rounded-sm hover:border-revgreen/30 transition-colors duration-300">
              <div className="h-12 w-12 bg-revgreen/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-revgreen" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
