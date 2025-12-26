import { useState } from 'react';
import { BadgeDollarSign, Target, TrendingUp, Wallet, Award, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const SalesCommissionArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const models = [
        {
            title: "O Acelerador de Cash (Múltiplos)",
            description: "Atinja 100% da meta = ganha comissão X. Atinja 120% = ganha 1.5X. Atinja 150% = ganha 2X. Isso motiva os Top Performers a não parar no dia 25.",
            icon: <TrendingUp className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Comissão no Cash-in (Efeito Caixa)",
            description: "Pagar comissão na venda é perigoso. Pague 50% na assinatura e 50% após o cliente pagar a primeira fatura. Isso alinha Vendas com a saúde financeira.",
            icon: <Wallet className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Clawback Clause (Proteção Anti-Churn)",
            description: "Se o cliente cancelar antes de 3 meses, o vendedor devolve a comissão. Isso elimina a venda empurrada ('marretada').",
            icon: <BadgeDollarSign className="w-6 h-6 text-revgreen" />
        }
    ];

    const templates = [
        {
            name: "Calculadora de Comissão SDR",
            subject: "Modelo Simples para SDRs PaaS/SaaS",
            body: `Salário Base: R$ 2.500
Variável Alvo (OTE): R$ 1.500 (Total R$ 4.000)

KPIs:
1. Reuniões Agendadas (SALs): R$ 50,00 por agendamento
2. Reuniões Realizadas (Show rate): + R$ 50,00 por show (Total R$ 100)
3. Bônus de Qualidade: + R$ 200,00 por venda fechada originada (opcional)

Meta: 15 Shows/mês = R$ 1.500 variável.
Regra de Ouro: Sem teto (Uncapped). Se fizer 30 shows, ganha R$ 3.000.`
        },
        {
            name: "Plano de Closer (Account Executive)",
            subject: "Modelo de Aceleração Progressiva",
            body: `Salário Base: R$ 5.000
Variável Alvo (OTE): R$ 5.000 (Total R$ 10.000)

 Comissão Base: 10% do Valor do Contrato (MRR x 12 ou Setup + Mensalidades).
 
 Aceleradores:
 - 0% a 79% da meta: Paga 8% (Punição)
 - 80% a 100% da meta: Paga 10% (Base)
 - 101% a 150% da meta: Paga 15% (Aceleração 1.5x) no valor excedente.
 
 Exemplo: Meta 50k. Vendeu 70k.
 50k comissiona 10% = 5k.
 20k excedente comissiona 15% = 3k.
 Total: 8k de comissão (vs 7k no modelo linear).`
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

                <StrategicContext label="Incentivos Movem o Mundo">
                    "Show me the incentive and I will show you the outcome." (Charlie Munger). Se você está recebendo leads ruins, provavelmente está pagando seu Marketing por volume, não por qualidade.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Comissão não é Custo", description: "Comissão é investimento. O pior cenário é economizar na comissão e não bater a meta." },
                        { title: "Simplicidade é Chave", description: "O vendedor deve conseguir calcular a comissão dele de cabeça no banho. Se precisar de excel, é complexo demais." },
                        { title: "Nunca coloque Teto", description: "Capping (teto) de comissão diz ao seu melhor vendedor: 'Pare de trabalhar, você já ganhou demais'." },
                        { title: "Alinhe com a Empresa", description: "Não pague por contrato assinado se a empresa precisa de cash. Pague pelo dinheiro na conta." }
                    ]}
                />

                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0 text-3xl md:text-4xl">Comissionamento de Vendas: A Engenharia do Comportamento</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Seu plano de compensação é a ferramenta de gestão mais poderosa que você tem. Ele dita quem fica, quem sai e como sua equipe trata seus clientes.
                    </p>
                </div>

                <ConceptDefinition
                    concept="OTE (On-Target Earnings)"
                    definition="O valor total que um vendedor ganha se bater 100% da meta (Salário Fixo + Variável). É o número que você 'vende' na contratação."
                    amateurView="Vou pagar um fixo baixo e comissão alta para ele 'correr atrás'."
                    proView="Defino um OTE competitivo de mercado e estruturo a meta para que seja atingível e escalável."
                />

                <h2 className="font-bold text-gray-900 mb-8 mt-16 flex items-center gap-3">
                    <Target className="w-6 h-6 text-revgreen" />
                    Modelos de Incentivo Estratégico
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-16 not-prose">
                    {models.map((model, index) => (
                        <Card key={index} className="p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                {model.icon}
                            </div>
                            <div className="mb-4">
                                {model.icon}
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{model.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{model.description}</p>
                        </Card>
                    ))}
                </div>

                <RedFlags
                    title="Seu Plano de Comissão é Tóxico?"
                    flags={[
                        "Vendedores seguram vendas no final do mês para fechar no mês seguinte (Sandbagging).",
                        "O time foca apenas em vender produtos fáceis, ignorando os estratégicos.",
                        "Há alta rotatividade (Turnover) nos primeiros 3 meses.",
                        "Você muda as regras do jogo no meio do trimestre (Erro fatal de confiança)."
                    ]}
                />

                <h2 className="font-bold text-gray-900 mb-8 mt-16 flex items-center gap-3">
                    <Award className="w-6 h-6 text-revgreen" />
                    Templates de Planos
                </h2>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {templates.map((template, index) => (
                        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-revgreen" />
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
                    title="Pague Bem, Exija Muito"
                    description="O segredo das máquinas de vendas de alta performance não é motivação, é alinhamento. Quando o vendedor ganha, a empresa ganha."
                    ctaText="Revisar Modelo de Incentivos"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default SalesCommissionArticle;
