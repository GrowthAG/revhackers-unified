
import { useState } from 'react';
import { Target, MousePointer2, Smartphone, Eye, CheckCircle2, TrendingUp, AlertTriangle, Copy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';
import { Link } from 'react-router-dom';

const CROPraticaArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const heuristics = [
        {
            title: "Clareza (O quê?)",
            description: "O usuário entende o que você vende em 3 segundos? Se não, ele sai. 'Soluções integradas de performance' não diz nada.",
            icon: <Eye className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Fricção (O esforço)",
            description: "Cada campo extra no formulário custa 10-15% de conversão. Peça apenas o email primeiro.",
            icon: <MousePointer2 className="w-6 h-6 text-revgreen" />
        },
        {
            title: "Urgência (O porquê agora?)",
            description: "Se a oferta é boa para sempre, eu compro depois (nunca). Crie motivos reais para agir hoje.",
            icon: <Smartphone className="w-6 h-6 text-revgreen" />
        }
    ];

    const templates = [
        {
            name: "Poll de Exit Intent (Hotjar)",
            subject: "Entender objeção de saída",
            body: `Pergunta: O que te impediu de iniciar seu trial hoje?

[ ] Preço está alto
[ ] Não entendi como funciona
[ ] Preciso falar com meu chefe
[ ] Só estou pesquisando
[ ] Outro: ________`
        },
        {
            name: "Copy de Landing Page (Framework AIDA)",
            subject: "Estrutura para High Conversion",
            body: `Headline (Atenção): [Resultado Final Desejado] em [Tempo] sem [Dor Principal].
Subheadline (Interesse): Como [Nossa Tech] ajuda [ICP] a atingir [Meta] automaticamente.
Bullets (Desejo):
- Benefício 1 (Ganho de Tempo)
- Benefício 2 (Ganho de Dinheiro)
- Benefício 3 (Redução de Risco)
CTA (Ação): Começar Grátis Agora (Sem cartão)`
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

                <StrategicContext label="Tráfego é Vaidade">
                    Você pode dobrar seu faturamento de duas formas: dobrando o tráfego (caro e difícil) ou dobrando a conversão (barato e técnico). CRO (Conversion Rate Optimization) é a arte de fazer mais com o mesmo tráfego. É a alavanca mais subestimada do Growth.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (CRO 80/20)"
                    items={[
                        { title: "Above the Fold", description: "100% dos usuários veem o topo do site. Só 20% chegam no rodapé. Coloque sua proposta de valor e CTA antes da dobra." },
                        { title: "Mobile First é passado", description: "Hoje é 'Mobile Only' para B2C e 'Mobile Filter' para B2B (pesquiso no celular, compro no desktop). Se seu site é lento no 4G, você está perdendo dinheiro." },
                        { title: "Copy > Design", description: "Um site feio com copy boa converte mais que um site lindo com copy confusa. O usuário compra palavras, não pixels." },
                        { title: "Prova Social", description: "Logos de clientes e depoimentos não são enfeite. São redutores de ansiedade. Coloque perto do botão de CTA." }
                    ]}
                />

                <ConceptDefinition
                    concept="Taxa de Conversão"
                    definition="A porcentagem de visitantes que realizam a ação desejada (Lead, Venda, Demo)."
                    amateurView="Achar que mudar a cor do botão resolve."
                    proView="Entender a psicologia do usuário, remover fricção e aumentar a motivação suficiente para o 'pulo de fé'."
                />

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">A Tríade da Conversão (Heurísticas)</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-12 not-prose">
                    {heuristics.map((item, i) => (
                        <Card key={i} className="p-6 bg-white border border-gray-200 hover:border-revgreen/50 transition-colors shadow-sm">
                            <div className="bg-zinc-900 p-3 rounded-full w-fit mb-4 border border-zinc-800">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-600 mb-0 leading-relaxed">{item.description}</p>
                        </Card>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Ferramentas de Diagnóstico (Templates)</h2>
                <div className="space-y-8 mb-16">
                    {templates.map((template, index) => (
                        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="text-xs font-bold text-gray-900 uppercase tracking-wider truncate pr-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-revgreen"></div>
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
                            <div className="p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-600 bg-white">
                                {template.body}
                            </div>
                        </Card>
                    ))}
                </div>

                <RedFlags
                    title="Assassinos de Conversão"
                    flags={[
                        "Carrossel (Slider) Automático: Ninguém lê, irrita o usuário e esconde conteúdo importante.",
                        "Video Background Pesado: Deixa o site lento. Velocidade é feature de conversão.",
                        "'Clique Aqui': Use CTAs orientados a benefício (Ex: 'Baixar Ebook', 'Gerar Relatório').",
                        "Links de Social Media no Topo: Você paga para trazer o usuário pro site e coloca um link pra ele sair pro Instagram?"
                    ]}
                />

                <StrategicConclusion
                    title="Teste, não Adivinhe"
                    description="O que funciona para a Amazon pode não funcionar para você. A única verdade está no Teste A/B. Aprofunde-se nos dados qualitativos (Hotjar, Microsoft Clarity) antes de mexer no código."
                    ctaText="Auditoria de UX/CRO"
                    onCTAClick={onCTAClick}
                />

                <div className="mt-12 not-prose">
                    <Button
                        size="lg"
                        className="w-full md:w-auto bg-revgreen text-black hover:bg-revgreen/90 font-bold text-lg px-8 h-14 rounded-full shadow-lg"
                        onClick={onCTAClick}
                    >
                        <span className="flex items-center justify-center gap-2">
                            Quero uma Análise do Meu Site <ArrowRight className="w-5 h-5" />
                        </span>
                    </Button>
                </div>
            </div>
        </article>
    );
};

export default CROPraticaArticle;
