import React from 'react';
import SectionHeader from '@/components/plan/SectionHeader';
import { ShieldCheck, Target, Zap, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { EditableField } from '@/components/plan/PlanEditContext';

interface SlaSectionProps {
    plan: any;
    client: any;
}

export default function SlaSection({ plan, client }: SlaSectionProps) {
    const isCrmOps = plan?.diagnostic_data?.enriched_analysis?.submission_type === 'CRM_CS_OPS' ||
        plan?.diagnostic_data?.submission_type === 'CRM_CS_OPS' ||
        plan?.project_type === 'crm_ops';

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto">
            <div className="flex-none p-6 md:p-10 lg:p-12 pb-0">
                <SectionHeader
                    eyebrow="Acordo Operacional"
                    titleLine1="Regras do Jogo:"
                    titleLine2={isCrmOps ? "Arquitetura vs Cultura" : "Growth vs Vendas"}
                    description={isCrmOps
                        ? "Para garantir a estabilidade do RevOps, a implantação tecnológica precisa estar perfeitamente alinhada com a adoção e cultura do seu time."
                        : "Para garantir o ROI do projeto, as responsabilidades de geração de demanda e execução comercial precisam estar perfeitamente alinhadas e respeitadas."}
                />
            </div>

            <div className="flex-1 p-6 md:p-10 lg:p-12 pt-0 max-w-[1600px] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                    {/* HUB Column - Left (Now Light minimalist) */}
                    <div className="relative group rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-0 pointer-events-none group-hover:opacity-5 transition-opacity duration-700">
                            <Zap size={180} className="text-black" />
                        </div>
                        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-zinc-100 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-black mb-1">Nosso Escopo</p>
                                    <h3 className="text-2xl font-bold text-black tracking-tight flex items-center gap-2">RevHackers <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z" /></svg></h3>
                                </div>
                            </div>

                            <ul className="space-y-6">
                                {isCrmOps ? [
                                    { title: "Arquitetura do Hub B2B", desc: "Configuração do Funnels HQ, Workflows e Integrações com fontes/ERPs." },
                                    { title: "Governança de Dados", desc: "Higienização e modelagem de propriedades para a passagem bastão SDR > Closer." },
                                    { title: "Playbooks de Vendas", desc: "Scripts, cadências e templates de email mapeados na automação." },
                                    { title: "Treinamento & Adoção", desc: "Sessões hands-on com o time para garantir que o CRM seja a única fonte da verdade." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1">
                                            <CheckCircle2 className="w-5 h-5 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-black mb-1">{item.title}</h4>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                )) : [
                                    { title: "Engenharia de Demanda", desc: "Criação, gestão e otimização diária de campanhas (Meta/Google)." },
                                    { title: "Geração de MQLs", desc: "Atração e qualificação de leads dentro do Perfil Ideal de Cliente (ICP)." },
                                    { title: "Arquitetura de Dados", desc: "Integração do ecossistema tecnológico (Tracking, Automações e CRM)." },
                                    { title: "Defesa do Custo de Aquisição", desc: "Monitoramento e otimização contínua para redução de CAC/CPL." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1">
                                            <CheckCircle2 className="w-5 h-5 text-black" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-black mb-1">{item.title}</h4>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Client Column - Right (Light minimalist) */}
                    <div className="relative group rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-0 pointer-events-none group-hover:opacity-5 transition-opacity duration-700">
                            <Target size={180} className="text-black" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-black mb-1">Time B2B</p>
                                    <h3 className="text-2xl font-bold text-black tracking-tight">{client?.company || 'Líderes de Operação'}</h3>
                                </div>
                            </div>

                            <ul className="space-y-6">
                                {isCrmOps ? [
                                    { title: "Definição de Workflow", desc: "Aprovação rápida de processos e SLA de playbook desenhado." },
                                    { title: "Engajamento da Liderança", desc: "Cobrar higiene e uso diário por parte de SDRs e Closers." },
                                    { title: "Disponibilizar Acessos", desc: "Acesso total as ferramentas atuais para mapeamento de débito técnico." },
                                    { title: "Higiene do CRM (Live)", desc: "Não aceitar fechamentos ou contatos por fora da ferramenta centralizada." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1">
                                            <div className="w-5 h-5 rounded-full border border-black/20 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-black/60" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-black mb-1">{item.title}</h4>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                )) : [
                                    { title: "Atendimento Rápido (Speed to Lead)", desc: "Garantir o primeiro contato com o lead em tempo hábil para alta conversão." },
                                    { title: "Execução Comercial", desc: "Pitching, quebra de objeções e condução das negociações de fechamento." },
                                    { title: "Higiene do CRM", desc: "Manter status, anotações e etapas do funil de vendas atualizadas diariamente." },
                                    { title: "Sinalização de MQLs Ruins", desc: "Dar feedback imediato com motivos claros de perda (Lost) para otimizarmos a origem." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="mt-1">
                                            <div className="w-5 h-5 rounded-full border border-black/20 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-black/60" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-black mb-1">{item.title}</h4>
                                            <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Critical SLA Banner - Light/Red Aesthetic */}
                <div className="relative rounded-2xl bg-white border border-red-200 p-6 md:p-8 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <div className="absolute inset-0 bg-red-50/30" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div className="flex gap-6 items-start md:items-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center border border-red-200 shrink-0">
                                <Clock className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-black tracking-tight flex items-center gap-3 mb-2">
                                    {isCrmOps ? 'SLA Inegociável de Higiene' : 'SLA Inegociável de Atendimento'}
                                    <span className="px-2 py-0.5 rounded text-[11px] uppercase tracking-widest font-black bg-red-100 text-red-600 border border-red-200">
                                        CRÍTICO
                                    </span>
                                </h4>
                                <EditableField
                                    path="sla_data.warning_text"
                                    className="text-sm text-zinc-600 leading-relaxed max-w-2xl"
                                    placeholder={isCrmOps
                                        ? "Sistemas só refletem a realidade se as pessoas atualizarem os dados. O sucesso da arquitetura RevOps exige liderança ativa na cobrança de log diário. Pipeline estático gera reports inválidos."
                                        : "Tempo de resposta é o maior fator de sucesso. Se os leads não forem contatados no prazo e as perdas não forem justificadas no CRM, não poderemos garantir o ROAS."}
                                />
                            </div>
                        </div>

                        <div className="shrink-0 flex items-center justify-center bg-white border border-red-200 rounded-xl px-6 py-4 shadow-sm">
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-widest text-red-500 font-black mb-1">Target</p>
                                <EditableField
                                    path="sla_data.target_time"
                                    className="text-3xl font-black text-black tracking-tighter"
                                    placeholder={isCrmOps ? "100% Daily log" : "< 15 min"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
