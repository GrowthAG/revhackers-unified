import React from 'react';
import { User, Zap, Settings, Repeat, Target, ChevronRight } from 'lucide-react';

// ── Onboarding milestones ─────────────────────────────────────────────────
const milestones = [
    { dia: 'Dia 01', nome: 'Kickoff Oficial', tipo: 'marco', descricao: 'Reunião de início: plano de sucesso apresentado, milestones acordados, acessos configurados e canal de comunicação ativado.', entrega: 'Plano de sucesso documentado e assinado', valor: 'Você sai sabendo exatamente o que acontece, quando e quem é responsável.', dark: true, green: false },
    { dia: 'Dia 07', nome: 'Fundação no Ar', tipo: 'entrega', descricao: 'Configuração base da plataforma: conta estruturada, pipeline criado, usuários adicionados e primeiros fluxos mapeados.', entrega: 'Conta configurada + pipeline funcional', valor: 'A casa está arrumada. Nada vai ser construído em cima de fundação frágil.', dark: false, green: false },
    { dia: 'Dia 15', nome: '1º Resultado Entregue', tipo: 'verdade', descricao: 'Momento de Verdade 1: primeiro processo automatizado ao vivo, primeiro lead gerenciado pela plataforma ou primeira automação respondendo por você.', entrega: '1ª automação ativa + primeiro resultado mensurável', valor: 'Você vê o sistema funcionando de verdade antes de completar 15 dias.', dark: false, green: true },
    { dia: 'Dia 21', nome: 'Time Treinado', tipo: 'entrega', descricao: 'Treinamento completo do time com acesso ativo. Cada pessoa sabe o que é sua responsabilidade dentro da plataforma.', entrega: 'Treinamento concluído + checklist de adoção por usuário', valor: 'Dependência zero da RevHackers para operação do dia a dia.', dark: false, green: false },
    { dia: 'Dia 30', nome: 'Review de Rota', tipo: 'review', descricao: 'Review estruturado: o que está funcionando, o que precisa de ajuste e quais são as prioridades do mês 2. NPS interno coletado.', entrega: 'Relatório de adoção + plano de otimização mês 2', valor: 'Tudo que não está funcionando é corrigido antes de virar problema.', dark: true, green: false },
    { dia: 'Dia 45', nome: 'Automações Avançadas', tipo: 'entrega', descricao: 'Segundo ciclo de automações: fluxos de nurturing, sequências de acompanhamento e integrações avançadas ativadas.', entrega: 'Stack de automação completo + integrações testadas', valor: 'O sistema começa a trabalhar por você enquanto você faz outras coisas.', dark: false, green: false },
    { dia: 'Dia 60', nome: 'Review de Performance', tipo: 'review', descricao: 'Análise de dados reais: leads no pipeline, taxa de conversion, tempo economizado e indicadores vs. OKRs do projeto.', entrega: 'Dashboard de resultados + mapa de expansão', valor: 'Você tem números reais para mostrar o retorno do investimento.', dark: true, green: false },
    { dia: 'Dia 75', nome: 'Otimização & Escala', tipo: 'entrega', descricao: 'Ajustes baseados em dados: fluxos que não convertem são corrigidos, fluxos que funcionam são escalados. Sem achismo.', entrega: 'Relatório de otimizações + prioridades para expansão', valor: 'Cada automação é um ativo que melhora com o tempo.', dark: false, green: false },
    { dia: 'Dia 90', nome: 'Entrega Final + Expansão', tipo: 'verdade', descricao: 'Momento de Verdade 2: review final com OKRs vs. resultados reais, entrega do playbook documentado e apresentação da proposta de expansão do próximo ciclo.', entrega: 'Playbook documentado + relatório 90 dias + proposta de expansão', valor: 'O que foi construído é seu. A proposta de expansão é o próximo nível.', dark: false, green: true },
];

const phases = [
    { numero: '01–07', label: 'Fundação', cor: 'border-l-zinc-900', itens: ['Plano de sucesso documentado', 'Conta configurada e acessos ativos', 'Pipeline de vendas estruturado', 'Canal de comunicação direto com a equipe'] },
    { numero: '08–30', label: 'Ativação', cor: 'border-l-amber-400', itens: ['Primeiro resultado real em 15 dias', 'Time treinado e usando a plataforma', 'Automações prioritárias ativas', 'Leads sendo trabalhados automaticamente'] },
    { numero: '31–60', label: 'Crescimento', cor: 'border-l-blue-500', itens: ['Stack completo de automações rodando', 'Integrações com anúncios testadas', 'Dashboard com dados reais e KPIs', 'Otimizações baseadas em performance'] },
    { numero: '61–90', label: 'Consolidação', cor: 'border-l-[#00CC6A]', itens: ['Sistema independente da equipe RevHackers', 'Playbook documentado para o time', 'Proposta de expansão do próximo ciclo', 'ROI mensurável e demonstrável'] },
];

const guarantees = [
    { icon: <Zap className="w-4 h-4" />, titulo: 'Resultado em 15 Dias', desc: 'Você vê a plataforma funcionando de verdade antes do dia 15. Não entregamos "em progresso" como resultado.' },
    { icon: <Settings className="w-4 h-4" />, titulo: 'Zero Dependência', desc: 'No dia 21 o seu time opera sem precisar de nós para o dia a dia. Treinamos para a autonomia.' },
    { icon: <Repeat className="w-4 h-4" />, titulo: 'Reviews Estruturados', desc: 'Não fazemos reunião de status. Cada review tem pauta, entregável e decisão documentada.' },
    { icon: <Target className="w-4 h-4" />, titulo: 'Expansão no Dia 90', desc: 'O fim do contrato não é o fim. No dia 90 você recebe uma proposta para o próximo nível — sem pressão, com dados.' },
];

export default function OnboardingSection({ plan }: { plan: any }) {
    const filteredMilestones = milestones.filter(m => m.tipo === 'verdade' || m.tipo === 'review' || m.dia === 'Dia 01' || m.dia === 'Dia 07' || m.dia === 'Dia 21');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-px bg-zinc-900" />
                        <span className="text-xs text-zinc-400 uppercase tracking-[0.2em]">Metodologia de Entrega</span>
                    </div>
                    <h2 className="text-2xl font-bold text-black tracking-tight">
                        Onboarding <span className="text-zinc-400">Orquestrado</span>
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1 max-w-lg leading-relaxed">
                        Baseado na metodologia de Donna Weber: mais de 50% do churn acontece por onboarding deficiente. Cada touchpoint tem dono, prazo e resultado. Sem improvisos.
                    </p>
                </div>
                <div className="shrink-0 bg-zinc-950 px-4 py-3 text-right">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-0.5">Ciclo de Entrega</p>
                    <p className="text-2xl font-black text-[#00CC6A]">90</p>
                    <p className="text-xs text-white/40 uppercase tracking-widest">Dias</p>
                </div>
            </div>

            {/* Timeline strip */}
            <div className="border border-zinc-100 overflow-hidden">
                <div className="bg-zinc-950 px-4 py-2.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
                    <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Sua Jornada — Do Kickoff à Expansão</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 divide-x divide-zinc-100">
                    {milestones.map((m, i) => (
                        <div key={i} className={`p-3 flex flex-col items-center text-center transition-colors group ${m.green ? 'bg-[#00CC6A]/5' : m.tipo === 'review' ? 'bg-zinc-950' : 'bg-white'}`}>
                            <div className={`text-xs font-black px-2 py-0.5 mb-1.5 w-full text-center ${m.green ? 'bg-[#00CC6A] text-black' : m.tipo === 'review' ? 'bg-zinc-800 text-white/60' : 'bg-zinc-100 text-zinc-500'}`}>{m.dia}</div>
                            <p className={`text-xs font-bold leading-tight ${m.tipo === 'review' ? 'text-white/70' : 'text-zinc-700'}`}>{m.nome}</p>
                            {m.green && <div className="w-1.5 h-1.5 rounded-full bg-[#00CC6A] mt-1" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail cards */}
            <div className="space-y-2">
                {filteredMilestones.map((m, i) => (
                    <div key={i} className={`flex gap-0 overflow-hidden border ${m.green ? 'border-[#00CC6A]/30' : m.tipo === 'review' ? 'border-zinc-900' : 'border-zinc-100'}`}>
                        <div className={`shrink-0 w-20 flex flex-col items-center justify-center py-4 px-2 text-center ${m.green ? 'bg-[#00CC6A]' : m.tipo === 'review' ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
                            <span className={`text-xs font-mono uppercase tracking-widest ${m.green ? 'text-black/60' : m.tipo === 'review' ? 'text-zinc-500' : 'text-zinc-400'}`}>{m.dia}</span>
                            <span className={`text-xs font-black leading-tight mt-0.5 ${m.green ? 'text-black' : m.tipo === 'review' ? 'text-white' : 'text-black'}`}>{m.nome}</span>
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                            <div className="flex-1 p-3">
                                <p className="text-xs text-zinc-500 leading-relaxed">{m.descricao}</p>
                            </div>
                            <div className="w-full md:w-64 p-3 bg-zinc-50">
                                <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Você recebe</p>
                                <p className="text-xs font-semibold text-black leading-snug mb-2">{m.entrega}</p>
                                <div className="flex items-start gap-1.5">
                                    <Target className="w-3 h-3 text-[#00CC6A] shrink-0 mt-0.5" />
                                    <p className="text-xs text-zinc-600 leading-relaxed italic">{m.valor}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Phase accumulator */}
            <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-3">O que você acumula a cada fase</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {phases.map((p, i) => (
                        <div key={i} className={`border-l-4 ${p.cor} border border-zinc-100 p-3`}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-xs text-zinc-300 font-mono">{p.numero}</span>
                                <span className="text-xs font-black uppercase tracking-widest text-black">{p.label}</span>
                            </div>
                            <ul className="space-y-1">
                                {p.itens.map((item, j) => (
                                    <li key={j} className="flex items-start gap-1.5 text-xs text-zinc-600">
                                        <div className="w-1 h-1 rounded-full bg-zinc-300 shrink-0 mt-1" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {guarantees.map((g, i) => (
                    <div key={i} className="bg-zinc-950 p-4">
                        <div className="w-7 h-7 bg-[#00CC6A]/10 border border-[#00CC6A]/20 flex items-center justify-center mb-3 text-[#00CC6A]">{g.icon}</div>
                        <h4 className="text-xs font-bold text-white mb-1.5">{g.titulo}</h4>
                        <p className="text-xs text-white/40 leading-relaxed">{g.desc}</p>
                    </div>
                ))}
            </div>

            {/* Day 90 Expansion */}
            <div className="border border-[#00CC6A]/30 overflow-hidden">
                <div className="bg-[#00CC6A] px-5 py-3 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-black/60 uppercase tracking-widest font-bold">Dia 90 — A Regra de Expansão RevHackers</p>
                        <h3 className="text-sm font-black text-black">Cada fim de ciclo é o começo do próximo nível</h3>
                    </div>
                    <Target className="w-5 h-5 text-black/60 shrink-0" />
                </div>
                <div className="bg-zinc-950 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-[#00CC6A] uppercase tracking-widest font-bold mb-2">O que entregamos no Dia 90</p>
                            <ul className="space-y-1.5">
                                {['Playbook completo documentado', 'Relatório de resultado vs. OKRs', 'Mapa de oportunidades de expansão', 'Proposta de próximo ciclo'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-white/70"><div className="w-1 h-1 rounded-full bg-[#00CC6A] shrink-0" />{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs text-[#00CC6A] uppercase tracking-widest font-bold mb-2">Por que expandir faz sentido</p>
                            <ul className="space-y-1.5">
                                {['O sistema está funcionando — escalar é mais barato', 'Você já sabe o que funciona — sem curva de aprendizado', 'Cada novo caso de uso multiplica o ROI existente', 'Clientes que renowam crescem 3x mais rápido'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-white/70"><div className="w-1 h-1 rounded-full bg-[#00CC6A]/40 shrink-0" />{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="border border-[#00CC6A]/20 p-4 flex flex-col justify-between">
                            <div>
                                <p className="text-xs text-[#00CC6A] uppercase tracking-widest font-bold mb-1.5">O que pode vir no Ciclo 2</p>
                                <ul className="space-y-1">
                                    {['Novas automações avançadas', 'Novos usuários e sub-times', 'Canais adicionais (WhatsApp, SMS, e-mail)', 'Relatórios personalizados e BI'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-white/50"><ChevronRight className="w-2.5 h-2.5 text-[#00CC6A] shrink-0" />{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-xs text-white/30 mt-3 italic">A proposta de expansão é apresentada no Dia 90 — sem pressão, com dados reais do que funcionou.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commitments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                    { lado: 'RevHackers', subtitulo: 'O que nos comprometemos', dark: true, itens: ['Primeiro resultado visível até o Dia 15 — sempre', 'Comunicação ativa: sem silêncio por mais de 48h', 'Cada review tem pauta, ata e próximos passos', 'Proposta de expansão apresentada no Dia 90 com dados', 'Entregáveis com qualidade antes do prazo combinado'] },
                    { lado: 'Sua Equipe', subtitulo: 'O que precisamos de você', dark: false, itens: ['Ponto de contato disponível para aprovações em até 48h', 'Participação nos reviews mensais (mínimo 45 min)', 'Acesso às ferramentas e dados necessários para implementar', 'Feedback honesto sobre o que está e o que não está funcionando', 'Time disponível para treinamento na Semana 3'] },
                ].map((side, i) => (
                    <div key={i} className={`border p-4 ${side.dark ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-50 border-zinc-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <User className={`w-3.5 h-3.5 ${side.dark ? 'text-[#00CC6A]' : 'text-zinc-600'}`} />
                            <div>
                                <p className={`text-xs uppercase tracking-widest font-black ${side.dark ? 'text-[#00CC6A]' : 'text-zinc-700'}`}>{side.lado}</p>
                                <p className={`text-xs ${side.dark ? 'text-white/30' : 'text-zinc-400'}`}>{side.subtitulo}</p>
                            </div>
                        </div>
                        <ul className="space-y-1.5">
                            {side.itens.map((item, j) => (
                                <li key={j} className={`flex items-start gap-2 text-xs ${side.dark ? 'text-white/60' : 'text-zinc-600'}`}>
                                    <Target className={`w-3 h-3 shrink-0 mt-0.5 ${side.dark ? 'text-[#00CC6A]' : 'text-zinc-400'}`} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
