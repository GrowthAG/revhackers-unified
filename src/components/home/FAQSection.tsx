
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quanto tempo leva para ver os primeiros resultados?",
    answer: "Nossos clientes começam a ver resultados concretos entre 30 a 45 dias após o início da implementação. O tempo exato pode variar conforme a complexidade da sua operação e o nível de automação existente, mas trabalhamos com metas claras de curto e médio prazo para garantir que você perceba valor rapidamente."
  },
  {
    question: "Como vocês se diferenciam de consultorias tradicionais?",
    answer: "Diferentemente de consultorias tradicionais que entregam apenas relatórios e recomendações, implementamos as soluções tecnicamente, capacitamos suas equipes e acompanhamos a execução até a entrega dos resultados. Nossa metodologia combina estratégia e execução, com acompanhamento de KPIs concretos e mensuráveis."
  },
  {
    question: "Minha empresa precisa trocar todo o stack de tecnologia atual?",
    answer: "Não necessariamente. Nossa abordagem prioriza a integração com suas ferramentas existentes sempre que possível. Fazemos um diagnóstico completo da sua infraestrutura atual e recomendamos apenas as mudanças realmente necessárias para atingir seus objetivos de crescimento."
  },
  {
    question: "Como garantir que as equipes vão adotar os novos processos?",
    answer: "Nosso método inclui um plano estruturado de gestão de mudanças e treinamento das equipes. Trabalhamos diretamente com os usuários finais para garantir adoção, oferecemos sessões de capacitação e criamos documentação personalizada. O acompanhamento contínuo permite identificar e corrigir rapidamente quaisquer resistências ou dificuldades."
  },
  {
    question: "Qual é o investimento médio e o retorno esperado?",
    answer: "O investimento varia conforme o porte da empresa e a complexidade dos desafios, mas nossos projetos apresentam retorno médio de 5x sobre o investimento no primeiro ano. Trabalhamos com modelos flexíveis e desenvolvemos um plano de negócios detalhado para cada cliente, com projeções claras de impacto em receita, eficiência operacional e redução de custos."
  },
  {
    question: "Vocês trabalham com empresas pequenas ou apenas grandes corporações?",
    answer: "Atendemos empresas de diversos portes, desde startups em fase de escala até grandes corporações. O requisito principal é que sua empresa tenha um modelo B2B e busque crescimento através da integração eficiente entre marketing, vendas e sucesso do cliente."
  }
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-gray-600">
            Respostas para as dúvidas mais comuns sobre nossas soluções de RevOps
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
