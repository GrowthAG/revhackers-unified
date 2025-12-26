
import ContactForm from '../shared/ContactForm';
import Section from '@/components/ui/Section';

const ContactFormSection = () => {
  return (
    <Section variant="light" className="py-32 border-t border-gray-200 bg-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left Column: Context/Sales Copy */}
          <div>
            <span className="font-mono-tech text-revgreen text-xs uppercase tracking-widest mb-4 block">
              Comece Agora
            </span>
            <h2 className="text-4xl md:text-6xl font-medium mb-8 text-black tracking-tight">
              Pronto para <br /> Escalar?
            </h2>
            <p className="text-xl text-gray-600 mb-8 font-light">
              Solicite um diagnóstico de engenharia de receita. Analisaremos sua stack, seus canais e seus gargalos.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center font-mono-tech text-revgreen">01</div>
                <div>
                  <h4 className="font-bold text-black text-lg">Análise de Dados</h4>
                  <p className="text-gray-500 text-sm">Mergulhamos no seu CRM e Analytics.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center font-mono-tech text-revgreen">02</div>
                <div>
                  <h4 className="font-bold text-black text-lg">Roadmap de 90 Dias</h4>
                  <p className="text-gray-500 text-sm">Entregamos o plano exato de execução.</p>
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
