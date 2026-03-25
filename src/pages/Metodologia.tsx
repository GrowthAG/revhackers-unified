import { useEffect } from 'react';
import { Database, Layers, Target, Cpu, Network, Lock, Zap, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Section from '@/components/ui/Section';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Metodologia = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
            <Header />

            {/* --- HERO SECTION (WHITE MINIMAL) --- */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-white">
                <div className="container-custom text-center">
                    <div className="max-w-4xl mx-auto">
                        {/* Tag */}
                        <span className="font-bold text-zinc-400 text-[10px] uppercase tracking-[0.2em] mb-6 block">
                            RevHackers Framework
                        </span>

                        {/* Standard Headline H1 */}
                        <h1 className="text-5xl md:text-8xl font-semibold text-black mb-8 tracking-tighter text-balance uppercase leading-[0.9]">
                            Nossa<br />Metodologia<span className="text-revgreen">.</span>
                        </h1>

                        {/* Standard Subheadline */}
                        <p className="text-xl md:text-2xl text-zinc-500 font-normal leading-relaxed max-w-3xl mx-auto tracking-tight">
                            Unificamos ciência de dados, processos de revenue e tecnologia avançada para construir operações de crescimento previsível.
                        </p>

                        <div className="mt-12 flex justify-center gap-4">
                            <Button asChild className="bg-black text-white hover:bg-zinc-800 h-14 px-10 rounded-sm text-xs font-bold uppercase tracking-widest shadow-sm transition-all">
                                <Link to="/booking">Agendar Diagnóstico</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PILLARS GRID (WHITE SECTION) --- */}
            <section className="py-24 bg-white border-t border-zinc-100">
                <div className="container-custom">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-semibold mb-6 tracking-tighter text-black uppercase">
                            O Sistema Operacional
                        </h2>
                        <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed font-light tracking-tight">
                            Não acreditamos em hacks isolados. Construímos uma infraestrutura robusta baseada em quatro pilares fundamentais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Pillar 1 */}
                        <div className="group p-10 rounded-sm bg-zinc-50 border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-sm bg-white flex items-center justify-center mb-8 text-black border border-zinc-200 shadow-sm">
                                <Database className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-black uppercase tracking-tight">1. Data Intelligence</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm font-medium">
                                Unificação de fontes de dados (CRM, Ads, Analytics) para criar uma única fonte de verdade. Dashboards em tempo real para decisões baseadas em fatos.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="group p-10 rounded-sm bg-zinc-50 border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-sm bg-white flex items-center justify-center mb-8 text-black border border-zinc-200 shadow-sm">
                                <Network className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-black uppercase tracking-tight">2. Revenue Operations</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm font-medium">
                                Alinhamento total entre Marketing e Vendas. Padronização de processos, definição de SLA e garantia de fluidez no funil de ponta a ponta.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="group p-10 rounded-sm bg-zinc-50 border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-sm bg-white flex items-center justify-center mb-8 text-black border border-zinc-200 shadow-sm">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-black uppercase tracking-tight">3. Growth Engineering</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm font-medium">
                                Otimização científica de conversão (CRO). Testes A/B constantes e personalização de jornadas para maximizar o LTV e reduzir o CAC.
                            </p>
                        </div>

                        {/* Pillar 4 */}
                        <div className="group p-10 rounded-sm bg-zinc-50 border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-sm bg-white flex items-center justify-center mb-8 text-black border border-zinc-200 shadow-sm">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-black uppercase tracking-tight">4. Tech Stack Moderno</h3>
                            <p className="text-zinc-500 leading-relaxed text-sm font-medium">
                                Implementação e integração das melhores ferramentas do mercado. Uma arquitetura de dados escalável que cresce junto com sua operação.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PROCESS/ROADMAP (WHITE MINIMAL) --- */}
            <section className="py-32 bg-white relative border-t border-zinc-100">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row gap-20 items-start">
                        <div className="md:w-1/3 md:sticky md:top-32">
                            <h2 className="text-4xl md:text-5xl font-semibold mb-8 tracking-tighter text-black uppercase leading-none">
                                Ciclo de<br />Implementação
                            </h2>
                            <p className="text-zinc-500 mb-10 text-lg font-light tracking-tight">
                                Como aplicamos nossa metodologia no seu negócio, passo a passo.
                            </p>
                            <Button asChild className="bg-zinc-100 text-black hover:bg-black hover:text-white border border-zinc-200 hover:border-black transition-all rounded-sm px-8 h-12 text-xs font-bold uppercase tracking-widest shadow-sm">
                                <Link to="/booking">Iniciar Ciclo</Link>
                            </Button>
                        </div>

                        <div className="md:w-2/3 space-y-20 relative border-l border-zinc-200 pl-12 md:pl-20 ml-6 md:ml-0 warning-timeline">
                            {/* Step 1 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-black text-sm font-bold font-mono group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">01</span>
                                <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight group-hover:translate-x-2 transition-transform">Diagnóstico Deep Dive</h3>
                                <p className="text-zinc-500 leading-relaxed text-base font-medium">Mergulhamos nos seus dados atuais, auditamos seu CRM e entrevistamos stakeholders para identificar os gargalos reais de receita.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-mono group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">02</span>
                                <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight group-hover:translate-x-2 transition-transform">Fundação de Revenue</h3>
                                <p className="text-zinc-500 leading-relaxed text-base font-medium">Arrumamos a casa. Limpeza de dados, configuração de tracking correto, definição de ICP e implementação da arquitetura correta de CRM.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-mono group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">03</span>
                                <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight group-hover:translate-x-2 transition-transform">Growth Loops</h3>
                                <p className="text-zinc-500 leading-relaxed text-base font-medium">Implementação das campanhas de aquisição e réguas de nutrição. Início dos testes A/B de conversão e otimização de canais pagos.</p>
                            </div>

                            {/* Step 4 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-mono group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">04</span>
                                <h3 className="text-2xl font-bold text-black mb-4 uppercase tracking-tight group-hover:translate-x-2 transition-transform">Escala & Otimização</h3>
                                <p className="text-zinc-500 leading-relaxed text-base font-medium">Refinamento contínuo baseado em dados de coorte. Expansão para novos canais e automação avançada de retenção.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL (LIGHT) --- */}
            <section className="py-24 bg-zinc-50 border-t border-zinc-200 relative overflow-hidden">
                <div className="container-custom text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter mb-8 max-w-4xl mx-auto uppercase">
                        Sua estratégia precisa de <span className="text-revgreen">inteligência</span>.
                    </h2>
                    <p className="text-xl text-zinc-500 mb-12 max-w-2xl mx-auto font-medium tracking-tight">
                        Pare de adivinhar e comece a escalar com previsibilidade.
                    </p>
                    <Button asChild className="bg-black text-white hover:bg-revgreen hover:text-black h-16 px-12 rounded-sm text-xs font-black tracking-widest uppercase transition-all shadow-sm hover:translate-y-[-2px]">
                        <Link to="/booking">Agendar Diagnóstico</Link>
                    </Button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Diagnóstico confidencial e sem compromisso.</span>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Metodologia;
