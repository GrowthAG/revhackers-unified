
import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

const Agenda = () => {
    useEffect(() => {
        // Ensure the external script for the form embed is loaded if needed, 
        // although the iframe usually works standalone.
        const scriptId = "revhackers-booking-script";
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://pages.revhackers.com.br/js/form_embed.js";
            script.type = "text/javascript";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <PageLayout>
            <Section variant="dark" className="pt-32 pb-20 md:pt-48 md:pb-32 min-h-screen flex flex-col justify-center">
                <div className="container-custom text-center">

                    <div className="max-w-3xl mx-auto mb-12">
                        <span className="font-mono-tech text-revgreen text-xs uppercase tracking-widest mb-4 block">
                            Próxima Etapa
                        </span>
                        <h1 className="text-4xl md:text-5xl font-normal text-white mb-6 tracking-tighter text-balance">
                            Agende seu Diagnóstico
                        </h1>
                        <p className="text-xl text-gray-400 font-light leading-relaxed">
                            Selecione o melhor horário abaixo para falarmos sobre o crescimento da sua empresa.
                        </p>
                    </div>

                    <div className="bg-white rounded-sm overflow-hidden max-w-4xl mx-auto min-h-[700px]">
                        <iframe
                            src="https://pages.revhackers.com.br/widget/booking/E6Mw5guvWZc7ADFgxnJh"
                            style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
                            scrolling="no"
                            id="E6Mw5guvWZc7ADFgxnJh_1766095834075"
                        />
                    </div>
                </div>
            </Section>
        </PageLayout>
    );
};

export default Agenda;
