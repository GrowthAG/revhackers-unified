import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

interface BookingPageProps {
    title: string;
    subtitle?: string;
    iframeSrc: string;
    iframeId?: string;
    label?: string;
    avatarSrc?: string;
    showLogoHeadline?: boolean;
}

const BookingPageTemplate = ({
    title,
    subtitle = "Selecione o melhor horário abaixo para falarmos sobre o crescimento da sua empresa.",
    iframeSrc,
    iframeId,
    label = "Próxima Etapa",
    avatarSrc,
    showLogoHeadline = false,
    children
}: BookingPageProps & { children?: React.ReactNode }) => {
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
            <Section className="pt-12 pb-12 md:pt-24 md:pb-24 min-h-screen flex flex-col justify-center bg-white">
                <div className="container-custom text-center relative z-10">

                    <div className="max-w-2xl mx-auto mb-12">
                        {avatarSrc && (
                            <div className="mb-6 flex justify-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-100 shadow-sm">
                                    <img src={avatarSrc} alt={title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        <div className="inline-block mb-6">
                            <span className="font-mono-tech text-zinc-400 text-2xs uppercase tracking-[0.25em] px-3 py-1 border border-zinc-100 bg-zinc-50/50">
                                {label}
                            </span>
                        </div>

                        {showLogoHeadline ? (
                            <>
                                <div className="flex justify-center mb-6">
                                    <img
                                        src="/brand/revhackers-wordmark-white.png"
                                        alt="RevHackers"
                                        className="w-48 md:w-56 max-w-full h-auto brightness-0 opacity-90 hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                <h1 className="text-xl md:text-2xl font-medium text-zinc-900 mb-3 tracking-tighter text-balance uppercase leading-tight">
                                    {title}
                                </h1>
                            </>
                        ) : (
                            <h1 className="text-3xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tighter text-balance uppercase leading-none">
                                {title}
                            </h1>
                        )}

                        <p className="text-base md:text-xl text-zinc-500 font-normal tracking-tight leading-relaxed max-w-xl mx-auto">
                            {subtitle}
                        </p>
                    </div>

                    <div className="bg-white overflow-hidden max-w-3xl mx-auto min-h-[700px] border border-zinc-100 shadow-sm shadow-zinc-100/50">
                        <iframe
                            src={iframeSrc}
                            id={iframeId}
                            style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }}
                            scrolling="no"
                        />
                    </div>

                    {children && (
                        <div className="max-w-3xl mx-auto mt-12 text-left">
                            {children}
                        </div>
                    )}
                </div>
            </Section>
        </PageLayout>
    );
};

export default BookingPageTemplate;
