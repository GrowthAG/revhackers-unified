
import { CheckCircle } from 'lucide-react';
import ContactForm from '../shared/ContactForm';

const benefits = [
  "Análise completa do stack tecnológico e fluxo de dados entre marketing, vendas e CS",
  "Identificação de lacunas de automação e ineficiências em seu funil de receita",
  "Comparativo de maturidade em RevOps com os líderes do seu segmento",
  "Plano estratégico customizado para integração de sistemas e melhoria de processos",
  "Cálculo de retorno esperado com aplicação de sistemas integrados e automações",
  "Roteiro técnico e estratégico para implementação estruturada"
];

const DiagnosticSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Diagnóstico executivo de <span className="text-revgreen">Revenue Operations</span>
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Uma análise estratégica da sua infraestrutura de crescimento B2B desenvolvida para CEOs e diretores
              que precisam expandir receita de forma consistente e eficiente.
            </p>
            
            <div className="space-y-5">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-revgreen mr-3 flex-shrink-0 mt-1" />
                  <span className="leading-snug text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-xl shadow-xl border border-gray-200">
            <h3 className="text-xl font-medium mb-6 text-center text-revgreen">
              Solicite seu diagnóstico gratuito
            </h3>
            <ContactForm formType="diagnosis" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiagnosticSection;
