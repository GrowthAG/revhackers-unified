
import ContactForm from '../shared/ContactForm';
import Section from '@/components/ui/Section';

const ContactFormSection = () => {
  return (
    <Section variant="light" className="py-32 border-t border-gray-200 bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left Column: Context/Sales Copy */}
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-black tracking-tight leading-[1.1]">
              Pronto para Escalar<span className="text-revgreen">?</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-500 font-normal tracking-tight leading-relaxed mb-12 max-w-xl">
              Solicite um diagnóstico de engenharia de receita. Analisaremos sua stack, seus canais e seus gargalos.
            </p>

            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <span className="text-4xl font-bold text-zinc-200 group-hover:text-revgreen transition-colors duration-300">01</span>
                <div>
                  <h4 className="font-bold text-black text-xl mb-1">Análise de Dados</h4>
                  <p className="text-zinc-500 text-base leading-relaxed">Mergulhamos no seu CRM e Analytics para identificar oportunidades ocultas.</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <span className="text-4xl font-bold text-zinc-200 group-hover:text-revgreen transition-colors duration-300">02</span>
                <div>
                  <h4 className="font-bold text-black text-xl mb-1">Roadmap de 90 Dias</h4>
                  <p className="text-zinc-500 text-base leading-relaxed">Entregamos o plano exato de execução para dobrar sua eficiência.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-sm shadow-sm">
            <ContactForm formType="contact" />
          </div>

        </div>
      </div>
    </Section>
  );
};

export default ContactFormSection;
