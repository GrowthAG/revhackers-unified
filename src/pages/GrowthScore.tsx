
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, RefreshCcw, Share2, BarChart2, Briefcase, Zap, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';

// --- TYPES ---
type Dimension = 'revenue' | 'process' | 'data' | 'tech';

interface Option {
    text: string;
    points: number;
    dimensions: Record<Dimension, number>; // How this answer affects each dimension (0-10)
}

interface Question {
    id: number;
    question: string;
    subtext?: string;
    options: Option[];
}

// --- QUESTIONS (The "Killer" Logic) ---
const QUESTIONS: Question[] = [
    {
        id: 1,
        question: "Se você precisasse demitir seu melhor vendedor hoje, o que aconteceria com sua receita no próximo mês?",
        subtext: "Teste de Dependência vs. Processo",
        options: [
            { text: "Cairia drasticamente (>30%). Dependemos do talento individual.", points: 0, dimensions: { revenue: 2, process: 0, data: 2, tech: 0 } },
            { text: "Cairia um pouco, mas temos outros performando bem.", points: 5, dimensions: { revenue: 5, process: 4, data: 4, tech: 2 } },
            { text: "Quase nada. O processo traz os leads e o playbook converte.", points: 10, dimensions: { revenue: 9, process: 10, data: 8, tech: 6 } }
        ]
    },
    {
        id: 2,
        question: "Como sua equipe define quem deve ser abordado (prospectado) hoje?",
        subtext: "Teste de Inteligência de Dados",
        options: [
            { text: "Feeling / Intuição. Cada um faz sua lista.", points: 0, dimensions: { revenue: 2, process: 1, data: 0, tech: 0 } },
            { text: "Listas frias compradas ou geradas sem filtro profundo.", points: 3, dimensions: { revenue: 4, process: 3, data: 3, tech: 2 } },
            { text: "Scoring comportamental (quem acessou o site/abriu e-mail).", points: 7, dimensions: { revenue: 7, process: 7, data: 8, tech: 7 } },
            { text: "Inteligência preditiva e sinais de intenção claros.", points: 10, dimensions: { revenue: 10, process: 9, data: 10, tech: 9 } }
        ]
    },
    {
        id: 3,
        question: "Seu crescimento de receita atual é Linear ou Exponencial?",
        subtext: "Teste de Alavancagem Tecnológica",
        options: [
            { text: "Linear. Para vender mais, preciso de mais vendedores.", points: 2, dimensions: { revenue: 4, process: 4, data: 2, tech: 1 } },
            { text: "Alavancado. Consigo vender mais mantendo a mesma equipe.", points: 8, dimensions: { revenue: 8, process: 7, data: 6, tech: 9 } },
            { text: "Exponencial. A tecnologia vende enquanto dormimos.", points: 10, dimensions: { revenue: 10, process: 8, data: 8, tech: 10 } }
        ]
    },
    {
        id: 4,
        question: "Você sabe exatamente quanto custa para adquirir um cliente (CAC) e quanto ele deixa (LTV) por canal?",
        subtext: "Teste de Domínio Financeiro",
        options: [
            { text: "Não tenho esses números claros.", points: 0, dimensions: { revenue: 0, process: 0, data: 0, tech: 0 } },
            { text: "Sei o geral da empresa, mas não por canal.", points: 5, dimensions: { revenue: 6, process: 4, data: 5, tech: 3 } },
            { text: "Tenho dashboards em tempo real com esses dados.", points: 10, dimensions: { revenue: 10, process: 8, data: 10, tech: 8 } }
        ]
    },
    {
        id: 5,
        question: "Suas ferramentas de Marketing e Vendas conversam entre si?",
        subtext: "Teste de Stack & Integração",
        options: [
            { text: "Não. São silos separados.", points: 0, dimensions: { revenue: 2, process: 0, data: 0, tech: 0 } },
            { text: "Exportamos planilhas de um para o outro manualmente.", points: 3, dimensions: { revenue: 5, process: 3, data: 3, tech: 2 } },
            { text: "Integração nativa/automática. O dado flui sozinho.", points: 10, dimensions: { revenue: 9, process: 8, data: 9, tech: 10 } }
        ]
    },
    {
        id: 6,
        question: "Você possui um Playbook de Vendas documentado e atualizado?",
        subtext: "Teste de Gestão de Conhecimento",
        options: [
            { text: "Não. O conhecimento está na cabeça das pessoas.", points: 0, dimensions: { revenue: 3, process: 0, data: 1, tech: 0 } },
            { text: "Temos algo antigo que ninguém lê.", points: 2, dimensions: { revenue: 4, process: 2, data: 2, tech: 1 } },
            { text: "Sim, é a bíblia da operação e usamos nos treinamentos.", points: 10, dimensions: { revenue: 9, process: 10, data: 7, tech: 5 } }
        ]
    },
    {
        id: 7,
        question: "Como você lida com Leads que não compram agora?",
        subtext: "Teste de Revenue Reclaim",
        options: [
            { text: "São descartados/esquecidos ('Lixo').", points: 0, dimensions: { revenue: 1, process: 1, data: 0, tech: 0 } },
            { text: "Recebem e-mails marketing genéricos.", points: 4, dimensions: { revenue: 5, process: 4, data: 3, tech: 4 } },
            { text: "Entram em fluxos de nutrição segmentados e automáticos.", points: 10, dimensions: { revenue: 9, process: 8, data: 8, tech: 10 } }
        ]
    },
    {
        id: 8,
        question: "Seu site/landing page é um cartão de visitas ou uma máquina de vendas?",
        subtext: "Teste de Presença Digital",
        options: [
            { text: "Institucional. Só diz quem somos.", points: 2, dimensions: { revenue: 3, process: 2, data: 0, tech: 4 } },
            { text: "Bonito, mas converte pouco.", points: 5, dimensions: { revenue: 5, process: 4, data: 3, tech: 6 } },
            { text: "Otimizado para conversão, com tracking e copy persuasiva.", points: 10, dimensions: { revenue: 10, process: 7, data: 9, tech: 9 } }
        ]
    }
];

// --- RADAR CHART COMPONENT ---
const RadarChart = ({ scores }: { scores: Record<Dimension, number> }) => {
    // Normalize scores to 0-100 for display
    const maxScore = QUESTIONS.length * 2.5; // Approx normalization factor

    // Calculate vertices for the polygon (Diamond shape for 4 axes)
    // Top: Revenue, Right: Tech, Bottom: Process, Left: Data
    const center = 150;
    const scale = 1.2;

    const getPoint = (value: number, angle: number) => {
        const rad = (angle - 90) * (Math.PI / 180);
        const dist = (value / 100) * 100 * scale;
        return `${center + dist * Math.cos(rad)},${center + dist * Math.sin(rad)}`;
    };

    // Placeholder normalization logic (simplified)
    const n = (val: number) => Math.min(100, Math.max(10, (val / 80) * 100)); // Rough normalization based on max points

    const pRev = getPoint(n(scores.revenue), 0);   // Top
    const pTech = getPoint(n(scores.tech), 90);    // Right
    const pProc = getPoint(n(scores.process), 180); // Bottom
    const pData = getPoint(n(scores.data), 270);    // Left

    const polyPoints = `${pRev} ${pTech} ${pProc} ${pData}`;

    return (
        <div className="relative w-full h-[350px] flex items-center justify-center">
            <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
                {/* Background Grid (Web) */}
                <circle cx="150" cy="150" r="30" fill="none" stroke="#333" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="60" fill="none" stroke="#333" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="90" fill="none" stroke="#333" strokeDasharray="4 4" />
                <circle cx="150" cy="150" r="120" fill="none" stroke="#fff" strokeOpacity="0.1" />

                {/* Axes */}
                <line x1="150" y1="150" x2="150" y2="30" stroke="#333" />
                <line x1="150" y1="150" x2="270" y2="150" stroke="#333" />
                <line x1="150" y1="150" x2="150" y2="270" stroke="#333" />
                <line x1="150" y1="150" x2="30" y2="150" stroke="#333" />

                {/* Labels */}
                <text x="150" y="20" textAnchor="middle" fill="#00ff99" fontSize="12" fontWeight="bold">RECEITA</text>
                <text x="280" y="155" textAnchor="start" fill="#00ff99" fontSize="12" fontWeight="bold">TECH</text>
                <text x="150" y="290" textAnchor="middle" fill="#00ff99" fontSize="12" fontWeight="bold">PROCESSOS</text>
                <text x="20" y="155" textAnchor="end" fill="#00ff99" fontSize="12" fontWeight="bold">DADOS</text>

                {/* The Data Polygon */}
                <motion.polygon
                    points={polyPoints}
                    fill="rgba(0, 255, 153, 0.2)"
                    stroke="#00ff99"
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0, transformOrigin: "center" }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />

                {/* Dots */}
                {[0, 90, 180, 270].map((angle, i) => {
                    const val = [scores.revenue, scores.tech, scores.process, scores.data][i];
                    const coords = getPoint(n(val), angle).split(',');
                    return (
                        <motion.circle
                            key={i}
                            cx={coords[0]}
                            cy={coords[1]}
                            r="4"
                            fill="#00ff99"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + (i * 0.1) }}
                        />
                    )
                })}

            </svg>
        </div>
    );
};


const GrowthScorePage = () => {
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [completed, setCompleted] = useState(false);

    // Scores State
    const [scores, setScores] = useState<Record<Dimension, number>>({
        revenue: 0,
        process: 0,
        data: 0,
        tech: 0
    });
    const [totalPoints, setTotalPoints] = useState(0);

    const handleAnswer = (option: Option) => {
        // Update accumulated scores
        setScores(prev => ({
            revenue: prev.revenue + option.dimensions.revenue,
            process: prev.process + option.dimensions.process,
            data: prev.data + option.dimensions.data,
            tech: prev.tech + option.dimensions.tech
        }));

        setTotalPoints(prev => prev + option.points);

        if (currentQ < QUESTIONS.length - 1) {
            setCurrentQ(prev => prev + 1);
        } else {
            setCompleted(true);
        }
    };

    const maxPossbilePoints = QUESTIONS.reduce((acc, q) => acc + Math.max(...q.options.map(o => o.points)), 0);
    const percentage = Math.round((totalPoints / maxPossbilePoints) * 100);

    const getDiagnosis = (pct: number) => {
        if (pct < 40) return { title: "Fase de Sobrevivência", color: "text-red-500", msg: "Sua operação é frágil e depende demais de esforço manual. O risco de quebra é alto se o mercado oscilar." };
        if (pct < 70) return { title: "Fase de Tração Manual", color: "text-yellow-500", msg: "Você cresce, mas com dores. Falta processo e tecnologia para escalar sem contratar um exército." };
        return { title: "Fase de Escala (Revenue Ops)", color: "text-revgreen", msg: "Sua base é sólida. Você está pronto para injetar capital e tecnologia pesada para dominância de mercado." };
    };

    const diag = getDiagnosis(percentage);

    return (
        <div className="bg-black min-h-screen text-white font-sans selection:bg-revgreen selection:text-black">
            <Header />

            <main className="container-custom pt-32 pb-20 min-h-screen flex flex-col justify-center">

                {/* INTRO SCREEN */}
                {!started && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-revgreen/10 border border-revgreen/20 text-revgreen text-xs font-mono-tech mb-8 tracking-widest uppercase">
                            <Zap className="w-3 h-3" />
                            <span>Growth Intelligence</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">
                            Descubra seu <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-revgreen to-emerald-600">Growth Score</span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                            A maioria das empresas não quebra por falta de vendas, mas por falta de <strong>previsibilidade</strong>.
                            Responda {QUESTIONS.length} perguntas estratégicas e receba um diagnóstico da sua maturidade de receita.
                        </p>

                        <Button onClick={() => setStarted(true)} className="btn-primary-pro text-lg px-8 py-6 h-auto">
                            Iniciar Diagnóstico <ArrowRight className="ml-2" />
                        </Button>

                        <div className="mt-16 grid grid-cols-3 gap-4 text-center opacity-50 text-sm font-mono-tech text-gray-500">
                            <div>01. INTEGRIDADE DE DADOS</div>
                            <div>02. ALAVANCAGEM TECH</div>
                            <div>03. PROCESSOS DE VENDAS</div>
                        </div>
                    </motion.div>
                )}

                {/* QUESTIONS SCREEN */}
                {started && !completed && (
                    <div className="max-w-2xl mx-auto w-full">
                        <div className="mb-8 flex justify-between items-end">
                            <span className="text-revgreen font-mono-tech text-sm">QUESTÃO {currentQ + 1} / {QUESTIONS.length}</span>
                            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-revgreen"
                                    animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentQ}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{QUESTIONS[currentQ].question}</h2>
                                <p className="text-gray-500 mb-10 font-mono-tech uppercase text-xs tracking-wider flex items-center gap-2">
                                    <RefreshCcw className="w-3 h-3" /> {QUESTIONS[currentQ].subtext}
                                </p>

                                <div className="space-y-4">
                                    {QUESTIONS[currentQ].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(opt)}
                                            className="w-full text-left p-6 rounded-sm border border-white/10 bg-white/5 hover:bg-white/10 hover:border-revgreen/50 transition-all duration-200 group flex items-start"
                                        >
                                            <div className="w-6 h-6 rounded-full border border-white/20 mr-4 mt-1 flex-shrink-0 group-hover:border-revgreen group-hover:bg-revgreen/20 transition-colors flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-revgreen opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-lg text-gray-200 group-hover:text-white">{opt.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}

                {/* RESULTS SCREEN */}
                {completed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                    >
                        {/* Left: Score & Text */}
                        <div>
                            <div className="inline-block mb-6">
                                <span className="text-xs font-mono-tech text-gray-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">
                                    Diagnóstico Finalizado
                                </span>
                            </div>

                            <h2 className="text-6xl font-bold mb-2">
                                <span className={diag.color}>{percentage}</span><span className="text-xl text-gray-600">/100</span>
                            </h2>
                            <h3 className={`text-2xl font-bold mb-6 ${diag.color}`}>{diag.title}</h3>

                            <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                {diag.msg}
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 border-l-2 border-revgreen rounded-r-sm">
                                    <h4 className="flex items-center font-bold text-white mb-1"><Briefcase className="w-4 h-4 mr-2" /> O que isso significa?</h4>
                                    <p className="text-sm text-gray-400">Seu score indica o nível de maturidade da sua operação de receita (RevOps).</p>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <Button asChild className="btn-primary-pro flex-1">
                                    <Link to="/booking">Agendar Diagnóstico Escala</Link>
                                </Button>
                                <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white flex-1">
                                    <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                                </Button>
                            </div>
                        </div>

                        {/* Right: Visualization */}
                        <div className="relative">
                            <div className="bg-black/40 border border-white/10 rounded-sm p-8 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <BarChart2 className="w-24 h-24 text-white" />
                                </div>
                                <h4 className="text-center text-sm font-mono-tech text-gray-400 mb-4">RAIO-X DE PERFORMANCE</h4>
                                <RadarChart scores={scores} />

                                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10 text-center">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-mono-tech mb-1">Processos</div>
                                        <div className="text-xl font-bold text-white">{scores.process}/80</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-mono-tech mb-1">Tecnologia</div>
                                        <div className="text-xl font-bold text-white">{scores.tech}/80</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </main>
        </div>
    );
};

export default GrowthScorePage;
