import React from 'react';
import { Brain, Cpu, Database, Layers, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StrategicConclusion from '../components/StrategicConclusion';

const IAGenerativaMarketingArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    return (
        <article className="max-w-4xl mx-auto px-6 py-12 font-sans text-gray-900 leading-relaxed">
            {/* Hero Banner */}


            {/* Strategic Context */}
            <div className="mb-12 p-8 border-l-2 border-black">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Contexto Estratégico
                </h3>
                <p className="text-xl font-medium text-gray-900">
                    A maioria dos times de marketing ainda usa IA como um "Google melhorado" ou um "redator júnior".
                    O verdadeiro salto de produtividade (10x-100x) não vem de prompts melhores, mas da construção de
                    <span className="font-bold border-b border-revgreen mx-1">Agentes Autônomos</span>
                    que não apenas "falam", mas "fazem".
                </p>
            </div>

            {/* Anatomy of an Agent */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">A Anatomia de um Agente de Growth</h2>
                <p className="text-lg text-gray-600 mb-8 font-light">
                    Esqueça a interface de chat. Um agente de IA é uma arquitetura de software composta por três pilares fundamentais que permitem execução autônoma.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="bg-white p-8">
                        <div className="w-10 h-10 flex items-center justify-center mb-6 text-black">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">1. O Cérebro (LLM)</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            O modelo de linguagem (GPT-4, Claude 3) que planeja tarefas, raciocina sobre problemas e toma decisões baseado em inputs.
                        </p>
                    </div>

                    <div className="bg-white p-8">
                        <div className="w-10 h-10 flex items-center justify-center mb-6 text-black">
                            <Database className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">2. A Memória (RAG)</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Bancos de dados vetoriais (Vector DBs) onde o agente armazena e recupera contexto específico da sua empresa (docs, personas, histórico).
                        </p>
                    </div>

                    <div className="bg-white p-8">
                        <div className="w-10 h-10 flex items-center justify-center mb-6 text-black">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">3. As Ferramentas (Tools)</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            APIs e integrações que dão ao agente "mãos" para agir: enviar emails, postar no LinkedIn, ler CRMs, raspar dados da web.
                        </p>
                    </div>
                </div>
            </section>

            {/* Deep Dive Case 1: Content Machine - Minimalist */}
            <section className="mb-16 border border-gray-200 p-8 md:p-12 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Blueprint #01</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">A Máquina de Conteúdo Infinito</h2>
                    </div>
                </div>

                <p className="text-gray-600 mb-10 text-lg font-light leading-relaxed">
                    Como transformamos 1 hora de vídeo bruto em 2 semanas de conteúdo distribuído em 4 canais, sem intervenção humana na criação.
                </p>

                <div className="space-y-0 text-sm border border-gray-200 bg-white">
                    <div className="flex items-start p-4 border-b border-gray-100">
                        <span className="font-mono font-bold text-black w-24 shrink-0">Trigger]</span>
                        <span className="text-gray-600">Novo arquivo de vídeo upado no Google Drive</span>
                    </div>
                    <div className="flex items-start p-4 border-b border-gray-100 bg-gray-50/50">
                        <span className="font-mono font-bold text-black w-24 shrink-0">Agent 1]</span>
                        <span className="text-gray-600"><strong>Transcritor:</strong> Usa Whisper AI para converter áudio em texto com &gt;98% de precisão.</span>
                    </div>
                    <div className="flex items-start p-4 border-b border-gray-100">
                        <span className="font-mono font-bold text-black w-24 shrink-0">Agent 2]</span>
                        <span className="text-gray-600"><strong>Analista:</strong> Identifica 3 temas virais, extrai key takeaways e citações memoráveis.</span>
                    </div>
                    <div className="flex items-start p-4 border-b border-gray-100 bg-gray-50/50">
                        <span className="font-mono font-bold text-black w-24 shrink-0">Agent 3]</span>
                        <span className="text-gray-600"><strong>Editor:</strong> Escreve 1 Artigo de Blog (SEO), 5 Posts LinkedIn (Carrossel/Texto), 1 Newsletter.</span>
                    </div>
                    <div className="flex items-start p-4">
                        <span className="font-mono font-bold text-revgreen w-24 shrink-0">Action]</span>
                        <span className="text-gray-600">Salva rascunhos no Notion/CMS prontos para revisão humana.</span>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        <strong className="text-black">Resultado:</strong> Redução de custo de produção de conteúdo em 90%. Aumento de frequência em 400%.
                    </p>
                </div>
            </section>

            {/* Deep Dive Case 2: SDR Researcher */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">Blueprint #02: O Pesquisador SDR Autônomo</h2>
                <p className="text-lg text-gray-600 mb-8 font-light">
                    SDRs humanos perdem 40% do tempo pesquisando sobre o lead antes de ligar. Agentes fazem isso em segundos.
                </p>

                <div className="border-l border-gray-200 pl-8 space-y-8">
                    <div className="relative">
                        <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-black rounded-full border-2 border-white"></div>
                        <h4 className="font-bold text-lg text-gray-900">Passo 1: Enriquecimento Contextual</h4>
                        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                            O agente recebe um domínio (ex: "g4educacao.com"). Ele navega no site (Browsing Tool), extrai a proposta de valor, público-alvo e tecnologias usadas (BuiltWith API).
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-gray-200 rounded-full border-2 border-white"></div>
                        <h4 className="font-bold text-lg text-gray-900">Passo 2: Mapeamento de Decisores</h4>
                        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                            Cruza dados no LinkedIn Sales Navigator para encontrar o "Head de Growth" ou "CMO". Analisa os últimos 3 posts dessa pessoa para identificar interesses atuais.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-[37px] top-1.5 w-4 h-4 bg-gray-200 rounded-full border-2 border-white"></div>
                        <h4 className="font-bold text-lg text-gray-900">Passo 3: Hiper-Personalização</h4>
                        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                            Escreve um "Icebreaker" único conectando a dor da empresa (Passo 1), o interesse pessoal do lead (Passo 2) e a nossa solução. O SDR humano só precisa validar e enviar.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Tech Stack */}
            <section className="mb-16 border border-gray-200 p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center tracking-tight">
                    <Code className="w-5 h-5 mr-3 text-black" />
                    A Stack Técnica Mínima Viável
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100 border border-gray-100">
                    <div className="p-4 text-center">
                        <span className="block font-bold text-gray-900 mb-1 text-sm">Orquestrador</span>
                        <span className="text-xs text-gray-500 font-mono">LangChain / n8n</span>
                    </div>
                    <div className="p-4 text-center">
                        <span className="block font-bold text-gray-900 mb-1 text-sm">Cérebro (LLM)</span>
                        <span className="text-xs text-gray-500 font-mono">OpenAI GPT-4o</span>
                    </div>
                    <div className="p-4 text-center">
                        <span className="block font-bold text-gray-900 mb-1 text-sm">Memória</span>
                        <span className="text-xs text-gray-500 font-mono">Pinecone / Supabase</span>
                    </div>
                    <div className="p-4 text-center">
                        <span className="block font-bold text-gray-900 mb-1 text-sm">Ferramentas</span>
                        <span className="text-xs text-gray-500 font-mono">SerpApi / Zapier</span>
                    </div>
                </div>
            </section>

            {/* Framework Assist-Automate-Agent */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Como implementar sem quebrar a operação</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black rounded-sm overflow-hidden">
                    <div className="p-8 bg-white border-b md:border-b-0 md:border-r border-gray-200">
                        <span className="text-4xl font-black text-gray-200 block mb-4">01</span>
                        <h4 className="font-bold text-lg mb-2 text-black">Assistência (Agora)</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">Humanos fazendo o trabalho, com IA dando suporte (Brainstorming, Revisão). Risco zero, ganho de 20% produtividade.</p>
                    </div>
                    <div className="p-8 bg-white border-b md:border-b-0 md:border-r border-gray-200">
                        <span className="text-4xl font-black text-gray-200 block mb-4">02</span>
                        <h4 className="font-bold text-lg mb-2 text-black">Automação (Mês 1)</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">Tasks repetitivas e lineares delegadas para Scripts/Zaps. Ex: Transcrição de call, Envio de ata.</p>
                    </div>
                    <div className="p-8 bg-black text-white">
                        <span className="text-4xl font-black text-gray-700 block mb-4">03</span>
                        <h4 className="font-bold text-lg mb-2 text-white">Agentes (Mês 3)</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">Sistemas que tomam decisões. Ex: SDR Autônomo que decide quem prospectar.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
// ... (add import)
            import StrategicConclusion from '../components/StrategicConclusion';

            // ... (replace CTA)
            <StrategicConclusion
                title="Ready to run?"
                description="Não tente construir agentes sozinho se você não tem um time de engenharia de dados. Nós já construímos a arquitetura. Plugue sua operação na nossa infraestrutura de Growth AI."
                ctaText="Agendar Diagnóstico de IA"
                leadMagnetId="agent-blueprint"
                onCTAClick={onCTAClick}
            />

        </article>
    );
};

export default IAGenerativaMarketingArticle;
