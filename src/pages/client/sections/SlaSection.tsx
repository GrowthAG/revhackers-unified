import React from 'react';
import SectionHeader from '@/components/plan/SectionHeader';
import { EditableField } from '@/components/plan/PlanEditContext';

interface SlaSectionProps {
    plan: any;
    client: any;
}

export default function SlaSection({ plan, client }: SlaSectionProps) {
    const isCrmOps = plan?.diagnostic_data?.enriched_analysis?.submission_type === 'CRM_CS_OPS' ||
        plan?.diagnostic_data?.submission_type === 'CRM_CS_OPS' ||
        plan?.rei_projects?.type === 'crm_ops' ||
        plan?.project_type === 'crm_ops';

    const durationStr = String(plan?.project_duration || plan?.rei_projects?.project_duration || plan?.rei_projects?.duration || '').toLowerCase();
    const isConsultative = durationStr.includes('30') || durationStr.includes('4 sem') || durationStr.includes('1 mês') || durationStr.includes('1 mes');

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            <div className="flex-none p-6 md:px-10 lg:px-12 pt-8 pb-4">
                <SectionHeader
                    eyebrow="Acordo Operacional"
                    titleLine1="Regras do Jogo:"
                    titleLine2={isConsultative ? "Estratégia vs Execução" : (isCrmOps ? "Arquitetura vs Cultura" : "Growth vs Vendas")}
                    description={isConsultative 
                        ? "Neste modelo consultivo de 30 dias, nosso foco é desenhar a arquitetura ideal e orientar as melhores práticas. A execução prática e configuração técnica ficam a cargo do seu time interno."
                        : (isCrmOps
                            ? "Para garantir a estabilidade do RevOps, a implantação tecnológica precisa estar perfeitamente alinhada com a adoção e cultura do seu time."
                            : "Para garantir o ROI do projeto, as responsabilidades de geração de demanda e execução comercial precisam estar perfeitamente alinhadas e respeitadas.")}
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-12 pb-8 max-w-[1600px] mx-auto w-full flex flex-col justify-between overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                    {/* HUB Column - Left */}
                    <div className="relative border border-zinc-200 bg-white p-6 rounded-xl">
                        <div>
                            <div className="mb-5">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Nosso Escopo</p>
                                <h3 className="text-xl font-bold text-black tracking-tight">RevHackers</h3>
                            </div>

                            <ul className="space-y-4">
                                {isConsultative ? [
                                    { title: "Auditoria e Diagnóstico", desc: "Mapeamento profundo do processo atual e gargalos operacionais." },
                                    { title: "Desenho da Solução Técnica", desc: "Criação do mapa da arquitetura ideal e recomendação de workflows." },
                                    { title: "Playbooks e Modelos", desc: "Fornecimento de processos de vendas e templates de passagens de bastão." },
                                    { title: "Direcionamento Estratégico", desc: "Acompanhamento consultivo e tático para a sua equipe executar o plano." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="text-zinc-300 shrink-0 text-xs mt-0.5">/</span>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-black mb-0.5">{item.title}</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                )) : (isCrmOps ? [
                                    { title: "Arquitetura do Hub B2B", desc: "Configuração do Funnels HQ, Workflows e Integrações com fontes/ERPs." },
                                    { title: "Governança de Dados", desc: "Higienização e modelagem de propriedades para a passagem bastão SDR > Closer." },
                                    { title: "Playbooks de Vendas", desc: "Scripts, cadências e templates de email mapeados na automação." },
                                    { title: "Treinamento & Adoção", desc: "Sessões hands-on com o time para garantir que o CRM seja a única fonte da verdade." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="text-zinc-300 shrink-0 text-xs mt-0.5">/</span>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-black mb-0.5">{item.title}</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                )) : [
                                    { title: "Engenharia de Demanda", desc: "Criação, gestão e otimização diária de campanhas (Meta/Google)." },
                                    { title: "Geração de MQLs", desc: "Atração e qualificação de leads dentro do Perfil Ideal de Cliente (ICP)." },
                                    { title: "Arquitetura de Dados", desc: "Integração do ecossistema tecnológico (Tracking, Automações e CRM)." },
                                    { title: "Defesa do Custo de Aquisição", desc: "Monitoramento e otimização contínua para redução de CAC/CPL." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="text-zinc-300 shrink-0 text-xs mt-0.5">/</span>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-black mb-0.5">{item.title}</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                )))}
                            </ul>
                        </div>
                    </div>

                    {/* Client Column - Right */}
                    <div className="relative border border-zinc-200 bg-white p-6 rounded-xl">
                        <div>
                            <div className="mb-5">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Time B2B</p>
                                <h3 className="text-xl font-bold text-black tracking-tight">{plan?.cover_data?.company_override || client?.company || 'Líderes de Operação'}</h3>
                            </div>

                            <ul className="space-y-4">
                                {isConsultative ? [
                                    { title: "Execução Prática", desc: "Disposição para configurar ferramentas e integrações através da equipe interna." },
                                    { title: "Engajamento da Liderança", desc: "Cobrar velocidade, adoção da cultura e higiene de dados do time comercial." },
                                    { title: "Transparência de Cenário", desc: "Abertura total para expor débitos técnicos e gaps processuais para análise correta." },
                                    { title: "Aprovação Ágil", desc: "Validação rápida e sem bloqueios das propostas de arquiteturas e playbooks desenhados." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="text-zinc-300 shrink-0 text-xs mt-0.5">/</span>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-black mb-0.5">{item.title}</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                )) : (isCrmOps ? [
                                    { title: "Definição de Workflow", desc: "Aprovação rápida de processos e SLA de playbook desenhado." },
                                    { title: "Engajamento da Liderança", desc: "Cobrar higiene e uso diário por parte de SDRs e Closers." },
                                    { title: "Disponibilizar Acessos", desc: "Acesso total as ferramentas atuais para mapeamento de débito técnico." },
                                    { title: "Higiene do CRM (Live)", desc: "Não aceitar fechamentos ou contatos por fora da ferramenta centralizada." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="text-zinc-300 shrink-0 text-xs mt-0.5">/</span>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-black mb-0.5">{item.title}</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                )) : [
                                    { title: "Velocidade de Resposta ao Lead", desc: "Garantir o primeiro contato com o lead em tempo hábil para alta conversão." },
                                    { title: "Execução Comercial", desc: "Pitching, quebra de objeções e condução das negociações de fechamento." },
                                    { title: "Higiene do CRM", desc: "Manter status, anotações e etapas do funil de vendas atualizadas diariamente." },
                                    { title: "Sinalização de MQLs Ruins", desc: "Dar feedback imediato com motivos claros de perda (Lost) para otimizarmos a origem." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="text-zinc-300 shrink-0 text-xs mt-0.5">/</span>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-black mb-0.5">{item.title}</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </li>
                                )))}
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Critical SLA Banner */}
                <div className="relative rounded-xl bg-zinc-950 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between shrink-0">
                    <div>
                        <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-3 mb-1">
                            {isConsultative ? 'SLA Inegociável de Execução Interna' : (isCrmOps ? 'SLA Inegociável de Higiene' : 'SLA Inegociável de Atendimento')}
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-2.5 py-1 rounded-md">
                                CRITICO
                            </span>
                        </h4>
                        <EditableField
                            path="sla_data.warning_text"
                            className="text-xs text-zinc-400 leading-relaxed max-w-2xl"
                            placeholder={isConsultative
                                ? "O sucesso deste projeto 100% consultivo depende inteiramente da capacidade e agilidade do seu time interno em colocar nossas recomendações em prática de forma consistente no dia a dia da operação."
                                : (isCrmOps
                                  ? "Sistemas só refletem a realidade se as pessoas atualizarem os dados. O sucesso da arquitetura RevOps exige liderança ativa na cobrança de log diário. Pipeline estático gera reports inválidos."
                                  : "Tempo de resposta é o maior fator de sucesso. Se os leads não forem contatados no prazo e as perdas não forem justificadas no CRM, não poderemos garantir o ROAS.")}
                        />
                    </div>

                    <div className="shrink-0 flex items-center justify-center bg-zinc-800 border border-zinc-700 rounded-xl px-5 py-3">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-[#00CC6A] font-bold mb-0.5">Target</p>
                            <EditableField
                                path="sla_data.target_time"
                                className="text-2xl font-bold text-white tracking-tighter"
                                placeholder={isConsultative ? "100% Hands-On" : (isCrmOps ? "100% Daily log" : "< 15 min")}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
