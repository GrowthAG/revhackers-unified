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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-revgreen selection:text-black">
            <Header />

            {/* --- HERO SECTION (STANDARD PATTERN - DARK) --- */}
            {/* Matching Servicos.tsx structure exactly */}
            <Section variant="dark" className="pt-32 pb-20 md:pt-48 md:pb-32 border-b border-white/10">
                <div className="container-custom text-center">
                    <div className="max-w-4xl mx-auto">
                        {/* Tag */}
                        <span className="font-mono-tech text-revgreen text-xs uppercase tracking-widest mb-4 block">
                            RevHackers Framework
                        </span>

                        {/* Standard Headline H1 */}
                        <h1 className="text-5xl md:text-7xl font-normal text-white mb-8 tracking-tighter text-balance">
                            Nossa Metodologia
                        </h1>

                        {/* Standard Subheadline */}
                        <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto">
                            Unificamos ciência de dados, processos de revenue e tecnologia avançada para construir operações de crescimento previsível.
                        </p>

                        <div className="mt-12 flex justify-center gap-4">
                            <Button asChild className="btn-primary-pro h-12 px-8 rounded-full">
                                <Link to="/booking">Agendar Diagnóstico</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Section>

            {/* --- PILLARS GRID (LIGHT SECTION) --- */}
            <Section className="py-24 bg-white border-t border-gray-100 text-black">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-normal mb-6 tracking-tight text-black">
                            O Sistema Operacional de Growth
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                            Não acreditamos em hacks isolados. Construímos uma infraestrutura robusta baseada em quatro pilares fundamentais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                        {/* Pillar 1 */}
                        <div className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-revgreen/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-6 text-revgreen border border-gray-100 group-hover:bg-revgreen/10 transition-colors">
                                <Database className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-black">1. Data Intelligence</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Unificação de fontes de dados (CRM, Ads, Analytics) para criar uma única fonte de verdade. Dashboards em tempo real para decisões baseadas em fatos, não opiniões.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-revgreen/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-6 text-revgreen border border-gray-100 group-hover:bg-revgreen/10 transition-colors">
                                <Network className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-black">2. Revenue Operations (RevOps)</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Alinhamento total entre Marketing e Vendas. Padronização de processos, definição de SLA e garantia de fluidez no funil de ponta a ponta.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-revgreen/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-6 text-revgreen border border-gray-100 group-hover:bg-revgreen/10 transition-colors">
                                <Zap className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-black">3. Growth Engineering</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Otimização científica de conversão (CRO). Testes A/B constantes e personalização de jornadas para maximizar o LTV e reduzir o custo de aquisição.
                            </p>
                        </div>

                        {/* Pillar 4 */}
                        <div className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-revgreen/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-6 text-revgreen border border-gray-100 group-hover:bg-revgreen/10 transition-colors">
                                <Cpu className="w-6 h-6 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-black">4. Tech Stack Moderno</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                Implementação e integração das melhores ferramentas do mercado. Uma arquitetura de dados escalável que cresce junto com sua operação.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* --- PROCESS/ROADMAP (DARK) --- */}
            <section className="py-24 bg-black relative border-t border-black">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        <div className="md:w-1/3 md:sticky md:top-32">
                            <h2 className="text-4xl font-bold mb-6 tracking-tight text-white">Ciclo de Implementação</h2>
                            <p className="text-gray-400 mb-8">Como aplicamos nossa metodologia no seu negócio, passo a passo.</p>
                            <Button asChild className="bg-white/5 text-white hover:bg-revgreen hover:text-black border border-white/10 hover:border-revgreen transition-all rounded-full px-6">
                                <Link to="/booking">Iniciar Ciclo</Link>
                            </Button>
                        </div>

                        <div className="md:w-2/3 space-y-12 relative border-l border-white/10 pl-8 md:pl-12 ml-4 md:ml-0">
                            {/* Step 1 */}
                            <div className="relative group">
                                <span className="absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 rounded-full bg-black border border-revgreen/50 flex items-center justify-center text-revgreen text-xs font-bold font-mono">01</span>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-revgreen transition-colors">Diagnóstico Deep Dive</h3>
                                <p className="text-gray-400">Mergulhamos nos seus dados atuais, auditamos seu CRM e entrevistamos stakeholders para identificar os gargalos reais de receita.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative group">
                                <span className="absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-gray-500 text-xs font-bold font-mono group-hover:border-revgreen group-hover:text-revgreen transition-all">02</span>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-revgreen transition-colors">Fundação de Revenue</h3>
                                <p className="text-gray-400">Arrumamos a casa. Limpeza de dados, configuração de tracking correto, definição de ICP e implementação da arquitetura correta de CRM.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative group">
                                <span className="absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-gray-500 text-xs font-bold font-mono group-hover:border-revgreen group-hover:text-revgreen transition-all">03</span>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-revgreen transition-colors">Growth Loops</h3>
                                <p className="text-gray-400">Implementação das campanhas de aquisição e réguas de nutrição. Início dos testes A/B de conversão e otimização de canais pagos.</p>
                            </div>

                            {/* Step 4 */}
                            <div className="relative group">
                                <span className="absolute -left-[45px] md:-left-[61px] top-0 w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-gray-500 text-xs font-bold font-mono group-hover:border-revgreen group-hover:text-revgreen transition-all">04</span>
                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-revgreen transition-colors">Escala & Otimização</h3>
                                <p className="text-gray-400">Refinamento contínuo baseado em dados de coorte. Expansão para novos canais e automação avançada de retenção.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL (LIGHT) --- */}
            <section className="py-24 bg-gray-50 border-t border-gray-200 relative overflow-hidden">
                <div className="container-custom text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-black tracking-tighter mb-8 max-w-4xl mx-auto">
                        Sua estratégia precisa de <span className="text-revgreen">inteligência</span>.
                    </h2>
                    <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-light">
                        Pare de adivinhar e comece a escalar com previsibilidade.
                    </p>
                    <Button asChild className="bg-revgreen text-black hover:bg-black hover:text-white h-14 px-10 rounded-full text-base font-bold tracking-wide uppercase transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                        <Link to="/booking">Agendar Diagnóstico</Link>
                    </Button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Diagnóstico confidencial e sem compromisso.</span>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Metodologia;
