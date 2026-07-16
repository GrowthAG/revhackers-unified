import { useState } from 'react';
import { ShieldAlert, Activity, HeartHandshake, UserX, UserCheck, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const AntiChurnPlaybookArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const tactics = [
        {
            title: "QBR (Quarterly Business Review)",
            description: "Não faça reuniões de 'status' ou 'check-in'. Faça reuniões de ESTRATÉGIA. Mostre o ROI gerado no trimestre e planeje o próximo. Venda o futuro a cada 3 meses.",
            icon: <Activity className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Executive Alignment (O padrinho)",
            description: "Garanta que seu VP fale com o VP do cliente. Se seu único contato é um analista júnior, você está em risco de churn silencioso.",
            icon: <HeartHandshake className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Pre-Emptive Downgrade (Salvar a conta)",
            description: "Melhor um cliente pagando menos do que um ex-cliente. Se perceber risco financeiro, ofereça um plano menor PROATIVAMENTE. Isso gera confiança eterna.",
            icon: <ShieldAlert className="w-6 h-6 text-revgreen" />
        }
    ];

    const templates = [
        {
            name: "Email de Saves (Recuperação de Churn)",
            subject: "Antes de você ir... uma dúvida rápida",
            body: `Oi [Nome],

Vi que você solicitou o cancelamento. Sem problemas, já processei no sistema.

Só para eu aprender e melhorar nosso produto: teve algo específico que falhamos em entregar? Ou foi uma questão de momento/budget?

Se estiver aberto, adoraria te mostrar uma nova funcionalidade que lançamos ontem que resolve exatamente [Problema Comum].

Abs,
[Seu Nome]`
        },
        {
            name: "Roteiro de QBR (Slide Mestre)",
            subject: "Estrutura de Reunião Trimestral",
            body: `SLIDE 1: O que combinamos no início do trimestre (Metas).
SLIDE 2: O que entregamos (Resultados com números reais).
SLIDE 3: Onde falhamos e o que aprendemos (Transparência gera confiança).
SLIDE 4: O Plano para o próximo trimestre (Re-venda).
SLIDE 5: O que precisamos de vocês para conseguir isso.`
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

                <StrategicContext label="O Cliente Silencioso">
                    O cliente que reclama ainda quer comprar. O cliente perigoso é aquele que para de abrir tickets, para de logar e te ignora. O silêncio precede o churn.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Churn é Sintoma", description: "O churn não acontece no cancelamento. Ele acontece na venda errada ou no onboarding mal feito 6 meses antes." },
                        { title: "Success > Support", description: "Suporte reage a problemas (Ticket). CS proativamente previne problemas e garante sucesso (Consultoria)." },
                        { title: "Net Revenue Retention", description: "A métrica de ouro. Seus clientes atuais devem gastar mais com você ano a ano para compensar os que saem." },
                        { title: "Onboarding é Tudo", description: "A primeira impressão dita o LTV. Se o cliente não ver valor (First Value) em 30 dias, ele já deu churn mentalmente." }
                    ]}
                />

                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0 text-3xl md:text-4xl">O Manual Anti-Churn: Retenção como Estratégia</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Manter um cliente é 5x a 25x mais barato que adquirir um novo. Mesmo assim, 80% do budget vai para aquisição. Vamos inverter essa lógica com playbooks de defesa.
                    </p>
                </div>

                <ConceptDefinition
                    concept="Health Score"
                    definition="Uma pontuação composta que indica a 'saúde' da conta baseada em Login, Uso de Features Chave, Pagamento em dia e Abertura de Tickets."
                    amateurView="Acho que o cliente está feliz porque não reclama."
                    proView="O Health Score caiu de 80 para 60 essa semana. Vou ligar agora."
                />

                <h2 className="font-bold text-gray-900 mb-8 mt-16 flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-revgreen" />
                    Táticas de Defesa (The Moat)
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-16 not-prose">
                    {tactics.map((tactic, index) => (
                        <Card key={index} className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                {tactic.icon}
                            </div>
                            <div className="mb-4">
                                {tactic.icon}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{tactic.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{tactic.description}</p>
                        </Card>
                    ))}
                </div>

                <RedFlags
                    title="Sinais de Risco (Red Accounts)"
                    flags={[
                        "Mudança de Padrinho (Seu campeão saiu da empresa). Isso é alerta vermelho imediato.",
                        "Queda drástica no uso (Logins caíram 30%).",
                        "Faturas atrasadas recorrentemente.",
                        "Fusão ou Aquisição (M&A) do cliente."
                    ]}
                />

                <h2 className="font-bold text-gray-900 mb-8 mt-16 flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-revgreen" />
                    Templates de Resgate
                </h2>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {templates.map((template, index) => (
                        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <UserX className="w-4 h-4 text-revgreen" />
                                    {template.name}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(template.body, index)}
                                    className="h-7 text-[10px] uppercase font-bold text-gray-500 hover:text-revgreen hover:bg-revgreen/10 transition-colors"
                                >
                                    {copiedIndex === index ? (
                                        <span className="flex items-center gap-1 text-revgreen"><CheckCircle2 className="w-3 h-3" /> Copiado</span>
                                    ) : (
                                        <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar</span>
                                    )}
                                </Button>
                            </div>
                            <div className="p-6">
                                <div className="text-xs text-gray-500 font-mono mb-4 border-b border-gray-100 pb-2 flex gap-2">
                                    <span className="font-bold text-gray-700">Assunto:</span> {template.subject}
                                </div>
                                <pre className="font-mono text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                    {template.body}
                                </pre>
                            </div>
                        </Card>
                    ))}
                </div>

                <StrategicConclusion
                    title="Retenção é o Novo Growth"
                    description="Em tempos de crise, quem retém a base sobrevive. Quem expande a base, vence. Transforme seu CS em um time de receita."
                    ctaText="Diagnóstico de Saúde da Base"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default AntiChurnPlaybookArticle;
