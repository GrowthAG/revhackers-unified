import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';

const BOOKING_URL = 'https://pages.revhackers.com.br/widget/booking/MmyRuRPox3ZComQA3jJ1';
const IFRAME_ID = 'MmyRuRPox3ZComQA3jJ1_1775263729923';

const AgendaGiulliano = () => {
    useEffect(() => {
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
            <SEO title="Agendar com Giulliano" description="Agende uma conversa com Giulliano Alves sobre Revenue Operations e Growth B2B." canonical="https://revhackers.com.br/agenda-giulliano" />
            <div className="min-h-screen bg-white flex flex-col">
                {/* Header compacto */}
                <div className="w-full pt-8 pb-4 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-tight mb-1">
                            Agende um horário comigo
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium">
                            Escolha o melhor momento para conversarmos.
                        </p>
                    </div>
                </div>

                {/* Calendario embed */}
                <div className="flex-1 w-full max-w-4xl mx-auto px-4 pb-8">
                    <iframe
                        src={BOOKING_URL}
                        id={IFRAME_ID}
                        style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
                        scrolling="no"
                        title="Agendar horário com Giulliano Alves"
                    />
                </div>
            </div>
        </PageLayout>
    );
};

export default AgendaGiulliano;
