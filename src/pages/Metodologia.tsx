import { useEffect } from 'react';
import { Database, Layers, Target, Cpu, Network, Lock, Zap, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Section from '@/components/ui/Section';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SEO from '@/components/shared/SEO';

const Metodologia = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
            <SEO
                title="Metodologia RevOps - Como Funciona a Consultoria"
                description="Conheça a metodologia RevHackers: Diagnóstico, Fundação, Growth Loops e Escala. Integramos IA, CRM e automação para eliminar vazamentos de receita em operações B2B."
                canonical="https://revhackers.com.br/metodologia"
                breadcrumbs={[
                    { name: "Home", url: "https://revhackers.com.br/" },
                    { name: "Metodologia", url: "https://revhackers.com.br/metodologia" }
                ]}
                faq={[
                    { question: "Qual é a metodologia da RevHackers?", answer: "A metodologia RevHackers é baseada em 4 pilares: Aquisição Brutal (campanhas B2B com CAC calculado), IA para Filtragem (qualificação automatizada de leads), Automação de Follow-Up (sistemas que perseguem leads 24h) e CRM Vault (configuração blindada de CRM para registrar cada oportunidade)." },
                    { question: "Quanto tempo demora a implementação?", answer: "O ciclo completo de implementação leva de 90 a 120 dias, passando por 4 fases: Diagnóstico Deep Dive, Fundação de Revenue, Growth Loops e Escala & Otimização." }
                ]}
            />
            <Header />

            {/* --- HERO SECTION (WHITE MINIMAL) --- */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-white">
                <div className="container-custom text-center">
                    <div className="max-w-4xl mx-auto">
                        {/* Tag */}
                        <span className="font-bold text-revgreen bg-revgreen/10 px-3 py-1 text-xxs border border-revgreen/20 uppercase tracking-[0.2em] mb-6 inline-block">
                            Engenharia Reversa B2B
                        </span>

                        {/* Standard Headline H1 */}
                        <h1 className="text-5xl md:text-7xl font-black text-black mb-8 tracking-tighter text-balance leading-[1.05]">
                            Como a Máquina<br />Opera<span className="text-revgreen">.</span>
                        </h1>

                        {/* Standard Subheadline */}
                        <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed max-w-3xl mx-auto tracking-tight">
                            Sem teorias. Nós plugamos Inteligência Artificial, Automação e CRM na sua operação para você parar de depender passivamente de indicações.
                        </p>

                        <div className="mt-12 flex justify-center gap-4">
                            <Button asChild className="bg-revgreen text-black hover:bg-black hover:text-white h-16 px-12 rounded-sm text-sm font-black uppercase tracking-widest shadow-sm transition-all">
                                <Link to="/booking">Auditar Minha Operação</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PILLARS GRID (WHITE SECTION) --- */}
            <section className="py-24 bg-white border-t border-zinc-100">
                <div className="container-custom">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-black leading-[1.05]">
                            A Engenharia da Venda
                        </h2>
                        <p className="text-zinc-600 max-w-2xl mx-auto text-lg leading-relaxed font-semibold tracking-tight">
                            Nós não vendemos "horas de consultoria". Nós montamos esses 4 hardwares na sua operação.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Pillar 1 */}
                        <div className="group p-10 rounded-sm bg-white border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-sm bg-black flex items-center justify-center mb-8 text-white shadow-sm">
                                <Database className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-black tracking-tight">1. Aquisição Brutal</h3>
                            <p className="text-zinc-500 leading-relaxed text-base font-medium">
                                Operamos campanhas B2B injetando previsibilidade matemática. Extraímos leads do mercado (Inbound/Outbound) com teto calculado de CAC.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="group p-10 rounded-sm bg-white border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-sm bg-black flex items-center justify-center mb-8 text-white shadow-sm">
                                <Network className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-black tracking-tight">2. IA Filtra Curiosos</h3>
                            <p className="text-zinc-500 leading-relaxed text-base font-medium">
                                Entrou lead sujo? Seus vendedores não falam com ele. Nossa IA de qualificação corta quem não tem verba e agenda quem tem dor real.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="group p-10 rounded-sm bg-white border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-sm bg-black flex items-center justify-center mb-8 text-white shadow-sm">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-black tracking-tight">3. Automação de Follow-Up</h3>
                            <p className="text-zinc-500 leading-relaxed text-base font-medium">
                                Seu vendedor esqueceu de ligar? O sistema não. Plugamos robôs (Make/n8n) que perseguem o lead com consistência até ele preencher o calendário.
                            </p>
                        </div>

                        {/* Pillar 4 */}
                        <div className="group p-10 rounded-sm bg-white border border-zinc-200 hover:border-black transition-all duration-500 relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-sm bg-black flex items-center justify-center mb-8 text-white shadow-sm">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 text-black tracking-tight">4. CRM Vault (O Cofre)</h3>
                            <p className="text-zinc-500 leading-relaxed text-base font-medium">
                                Nenhuma reunião agendada escapa. Você e seu time operam 100% dentro do CRM configurado por nós para registrar cada ganho de receita.
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
                            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-black leading-[1.05]">
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
                                <h3 className="text-2xl font-black text-black mb-4 tracking-tight group-hover:translate-x-2 transition-transform">Diagnóstico Deep Dive</h3>
                                <p className="text-zinc-500 leading-relaxed text-base font-medium">Mergulhamos nos seus dados atuais, auditamos seu CRM e entrevistamos stakeholders para identificar os gargalos reais de receita.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-mono group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">02</span>
                                <h3 className="text-2xl font-black text-black mb-4 tracking-tight group-hover:translate-x-2 transition-transform">Fundação de Revenue</h3>
                                <p className="text-zinc-500 leading-relaxed text-base font-medium">Arrumamos a casa. Limpeza de dados, configuração de tracking correto, definição de ICP e implementação da arquitetura correta de CRM.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-mono group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">03</span>
                                <h3 className="text-2xl font-black text-black mb-4 tracking-tight group-hover:translate-x-2 transition-transform">Growth Loops</h3>
                                <p className="text-zinc-500 leading-relaxed text-base font-medium">Implementação das campanhas de aquisição e réguas de nutrição. Início dos testes A/B de conversão e otimização de canais pagos.</p>
                            </div>

                            {/* Step 4 */}
                            <div className="relative group">
                                <span className="absolute -left-[67px] md:-left-[99px] top-1 w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 text-sm font-bold font-mono group-hover:border-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">04</span>
                                <h3 className="text-2xl font-black text-black mb-4 tracking-tight group-hover:translate-x-2 transition-transform">Escala & Otimização</h3>
                                <p className="text-zinc-500 leading-relaxed text-base font-medium">Refinamento contínuo baseado em dados de coorte. Expansão para novos canais e automação avançada de retenção.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL (LIGHT) --- */}
            <section className="py-24 bg-zinc-50 border-t border-zinc-200 relative overflow-hidden">
                <div className="container-custom text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight leading-[1.05] mb-8 max-w-4xl mx-auto">
                        Pare de queimar caixa <span className="text-zinc-500 line-through">adivinhando</span>.
                    </h2>
                    <p className="text-xl text-zinc-500 mb-12 max-w-2xl mx-auto font-bold tracking-tight">
                        Deixe a IA e o CRM trabalharem suas conversões. Vagas Restritas (Max 3/mês).
                    </p>
                    <Button asChild className="bg-black text-white hover:bg-revgreen hover:text-black h-16 px-12 rounded-sm text-sm font-black tracking-widest uppercase transition-all shadow-sm hover:translate-y-[-2px]">
                        <Link to="/booking">Auditar Minha Operação</Link>
                    </Button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-xxs font-bold uppercase tracking-widest text-zinc-400">
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
