import React from 'react';
import { User, Zap, Settings, Repeat, Target, ChevronRight } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';
import BowtieFunnel from '@/components/plan/BowtieFunnel';

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
        <div className="flex flex-col h-full bg-white overflow-hidden w-full">
            <div className="flex-none p-5 md:p-8 lg:px-12 lg:pt-8 pb-0">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <SectionHeader
                        eyebrow="Metodologia de Entrega"
                        titleLine1="Onboarding"
                        titleLine2="Orquestrado"
                        description="Baseado na metodologia de Donna Weber: mais de 50% do churn acontece por onboarding deficiente. Cada touchpoint tem dono, prazo e resultado. Sem improvisos."
                    />
                    <div className="shrink-0 bg-zinc-950 px-5 py-3 text-right rounded-2xl border border-zinc-800">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Ciclo de Entrega</p>
                        <p className="text-3xl font-black text-[#00CC6A] leading-none mb-0.5">90</p>
                        <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Dias</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-5 md:p-8 lg:px-12 lg:pb-8 pt-0 max-w-[1600px] mx-auto w-full flex flex-col justify-center space-y-6">

                {/* Gráfico do Funil Gravatinha Customizado para Onboarding */}
                <BowtieFunnel
                    eyebrow="Estrutura do Onboarding"
                    title="Jornada de 90 Dias"
                    leftLabel="Análise"
                    leftTitle="Organização & Setup"
                    centerTitle="Ativação"
                    rightLabel="Retenção"
                    rightTitle="Adoção & Sucesso"
                    bottomLeftTitle="Foco em Arrumar a Casa"
                    bottomLeftDesc="Diagnosticamos vazamentos de pipeline, arrumamos a casa e montamos a fundação técnica baseada em dados reais."
                    bottomRightTitle="Foco em Retenção e Tração"
                    bottomRightDesc="Treinamento, milestones fixos e reviews estruturados para garantir resultados nos primeiros 15 dias e zero dependência no dia 90."
                />

                {/* Timeline strip */}
                <div className="border border-zinc-100 overflow-hidden shrink-0 mt-6">
                    <div className="bg-zinc-950 px-4 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00CC6A] animate-pulse" />
                        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Sua Jornada — Do Kickoff à Expansão</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 divide-x divide-zinc-100">
                        {milestones.map((m, i) => (
                            <div key={i} className={`p-4 flex flex-col items-center justify-center text-center transition-colors group ${m.green ? 'bg-[#00CC6A]/5' : m.tipo === 'review' ? 'bg-zinc-950' : 'bg-white'}`}>
                                <div className={`text-xs font-black px-3 py-1 mb-2 w-full text-center ${m.green ? 'bg-[#00CC6A] text-black' : m.tipo === 'review' ? 'bg-zinc-800 text-white/60' : 'bg-zinc-100 text-zinc-500'}`}>{m.dia}</div>
                                <p className={`text-[13px] sm:text-sm font-bold leading-tight ${m.tipo === 'review' ? 'text-white/70' : 'text-zinc-700'}`}>{m.nome}</p>
                                {m.green && <div className="w-2 h-2 rounded-full bg-[#00CC6A] mt-2" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail cards */}
                <div className="space-y-2 mt-4 flex-1">
                    {filteredMilestones.map((m, i) => (
                        <div key={i} className={`flex gap-0 overflow-hidden border ${m.green ? 'border-[#00CC6A]/30' : m.tipo === 'review' ? 'border-zinc-900' : 'border-zinc-100'}`}>
                            <div className={`shrink-0 w-24 flex flex-col items-center justify-center py-4 px-3 text-center ${m.green ? 'bg-[#00CC6A]' : m.tipo === 'review' ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
                                <span className={`text-[11px] font-mono uppercase tracking-widest ${m.green ? 'text-black/60' : m.tipo === 'review' ? 'text-zinc-500' : 'text-zinc-400'}`}>{m.dia}</span>
                                <span className={`text-[13px] mt-0.5 font-black leading-tight ${m.green ? 'text-black' : m.tipo === 'review' ? 'text-white' : 'text-black'}`}>{m.nome}</span>
                            </div>
                            <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100">
                                <div className="flex-1 px-4 py-3 flex items-center">
                                    <p className="text-[13px] text-zinc-500 leading-snug font-medium">{m.descricao}</p>
                                </div>
                                <div className="w-full md:w-72 px-4 py-3 bg-zinc-50/50 flex flex-col justify-center">
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Você recebe</p>
                                    <p className="text-[13px] font-bold text-black leading-snug mb-2">{m.entrega}</p>
                                    <div className="flex items-start gap-1.5">
                                        <Target className="w-3.5 h-3.5 text-[#00CC6A] shrink-0 mt-0.5" />
                                        <p className="text-[12px] text-zinc-600 leading-tight italic">{m.valor}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
