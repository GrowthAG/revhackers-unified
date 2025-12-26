import { useState } from 'react';
import { Users, AlertTriangle, Briefcase, Zap, ArrowRight, BrainCircuit, PenTool, Database, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const GrowthTeamLeanArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const roles = [
        {
            title: "Growth Lead (PM)",
            desc: "O dono do ritmo. Prioriza o backlog, remove barreiras e garante que os testes estão rodando. Não precisa codar, mas precisa entender de dados.",
            icon: <Briefcase className="w-5 h-5 text-revgreen" />
        },
        {
            title: "Full-Stack Dev",
            desc: "O executor. Growth exige mexer no produto, instalar pixels complexos e criar landing pages em horas, não semanas. O dev de growth aceita 'codar feio' para validar rápido.",
            icon: <Zap className="w-5 h-5 text-revgreen" />
        },
        {
            title: "Product Designer",
            desc: "UX/UI focado em conversão. Não é sobre deixar bonito, é sobre reduzir fricção e clareza de comunicação.",
            icon: <PenTool className="w-5 h-5 text-revgreen" />
        },
        {
            title: "Data Analyst",
            desc: "O juiz. Garante que os dados do teste são confiáveis e calcula a significância estatística. Impede o time de mentir para si mesmo.",
            icon: <Database className="w-5 h-5 text-revgreen" />
        }
    ];

    const stages = [
        {
            title: "Fase 1: O 'One-Man Army' (Seed)",
            desc: "Geralmente um Founder ou um T-Shaped Marketer. Faz tudo (Copy, Ads, Dados). O objetivo aqui é apenas validar 1 canal de aquisição."
        },
        {
            title: "Fase 2: A Força-Tarefa (Series A)",
            desc: "Não contrata ninguém novo. Pega emprestado 20% do tempo de um Dev e um Designer 'emprestados' dos times de Core para rodar experimentos focados."
        },
        {
            title: "Fase 3: O Growth Pod (Scale-Up)",
            desc: "Time dedicado e autônomo. Tem meta própria (ex: Aumentar ativação em 20%) e não responde ao Roadmap de Produto tradicional."
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

                <StrategicContext label="O Mito do Growth Hacker">
                    Muitos founders acham que vão contratar "um menino de Growth" que vai resolver todos os problemas de aquisição com "hacks" mágicos. Isso não existe. Growth é um esporte de time, que exige Engenharia, Design e Dados trabalhando juntos.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (Estrutura de Time)"
                    items={[
                        { title: "Growth é Processo, não Pessoa", description: "Se você contratar um 'Head de Growth' mas não der a ele recursos de engenharia, ele vira apenas um analista de marketing glorificado." },
                        { title: "Autonomia Radical", description: "O time de Growth não pode depender da aprovação do VP de Produto para mudar a cor de um botão. Eles precisam de autonomia para quebrar coisas (com segurança)." },
                        { title: "T-Shaped Professionals", description: "Busque generalistas. O Designer que escreve copy. O Dev que entende de SEO. Especialistas sofrem em Growth early-stage." },
                        { title: "Cultura de Erro", description: "Se o time tem medo de falhar, eles vão testar apenas coisas óbvias. Para ter ganhos de 10x, você precisa tolerar 9 testes falhos." }
                    ]}
                />

                <ConceptDefinition
                    concept="Growth Pod (Squad)"
                    definition="Uma unidade multidisciplinar (Dev + Design + Dados + Mkt) focada em mover UMA métrica específica (ex: Onboarding) através de experimentação rápida."
                    amateurView="Departamento de Marketing isolado."
                    proView="Engenheiros e Marketers sentados na mesma mesa, com o mesmo KPI."
                />

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Os 4 Pilares de um Time de Elite</h2>
                <div className="grid md:grid-cols-2 gap-6 mb-12 not-prose">
                    {roles.map((role, i) => (
                        <Card key={i} className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                {role.icon}
                            </div>
                            <div className="flex bg-zinc-900 w-10 h-10 rounded-lg items-center justify-center mb-4 text-white shadow-lg">
                                {role.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 text-lg">{role.title}</h3>
                            <p className="text-sm text-gray-600 mb-0 leading-relaxed">{role.desc}</p>
                        </Card>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Evolução da Estrutura</h2>
                <div className="space-y-6 mb-16 not-prose">
                    {stages.map((stage, index) => (
                        <div key={index} className="flex gap-5 p-6 border-l-4 border-black bg-white shadow-sm rounded-r-lg items-start">
                            <div className="bg-black text-white w-8 h-8 rounded flex items-center justify-center shrink-0 font-bold text-sm shadow-md mt-1">
                                {index + 1}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{stage.title}</h3>
                                <p className="text-gray-700 leading-relaxed text-base">{stage.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <RedFlags
                    title="Sinais de Disfunção"
                    flags={[
                        "Marketing e Produto não se falam (Silos).",
                        "O time gasta 4 semanas para colocar um teste simples no ar.",
                        "Não há documentação de aprendizados (Os mesmos erros são cometidos duas vezes).",
                        "Contratar especialistas seniores antes de ter Product-Market Fit."
                    ]}
                />

                <StrategicConclusion
                    title="Comece com o que tem"
                    description="Não espere ter budget para contratar o time dos sonhos. Comece criando uma 'Reunião de Growth' semanal com quem já está na empresa. O processo cria a cultura, a cultura atrai os talentos."
                    ctaText="Consultoria de Cultura de Growth"
                    onCTAClick={onCTAClick}
                />
            </div>
        </article>
    );
};

export default GrowthTeamLeanArticle;
