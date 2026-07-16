import React from 'react';
import {
  Container, ReadingContainer, Section, SectionTitle, H3, Paragraph, Reveal, TechCard, CornerBrackets
} from './PLG';

export const IntroSection: React.FC = () => (
  <Section id="intro" className="min-h-screen text-center flex items-center justify-center relative">
    <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>
    <Container className="flex flex-col items-center">
      <div className="mb-12">
          <img
              src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/68ea81e096a2285e10022c50.png"
              alt="RevHackers Logo Preto"
              className="h-10 md:h-12 w-auto"
          />
      </div>

      <Reveal>
        <h1 className="text-[clamp(40px,7vw,90px)] font-bold tracking-[-0.03em] mb-8 leading-[0.9] font-space text-deep-black">
            POLEMIC<br />
            <span className="text-neon-green">LED GROWTH</span>
        </h1>
        <p className="font-mono text-[10px] md:text-xs tracking-[0.4em] text-gray-400 mb-12 uppercase">
            Protocolo de Posicionamento B2B
        </p>
        <div className="max-w-[700px] mx-auto">
            <p className="text-[16px] md:text-[20px] leading-[1.6] font-light text-gray-800">
                O mercado ignora quem grita. Ele respeita quem tem substância.<br/>
                Construa um perfil magnético que converte visualizações em contratos.
            </p>
        </div>
      </Reveal>
    </Container>
  </Section>
);

export const WhatIsSection: React.FC = () => (
  <Section id="what">
    <Container>
      <Reveal>
        <ReadingContainer>
            <SectionTitle subtitle="Definição">O Que é <span className="border-b-2 border-neon-green">PLG</span>?</SectionTitle>
        </ReadingContainer>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-16">
            <div className="flex flex-col justify-center">
                <Paragraph>Não é sobre polêmica vazia. É sobre <strong>Polarização Estratégica</strong>.</Paragraph>
                <Paragraph>Usamos posicionamento afiado para atrair clientes ideais e, mais importante, <strong>repelir curiosos</strong>.</Paragraph>
                <div className="mt-8 p-6 bg-gray-50 border-l-2 border-black">
                    <p className="font-mono text-[10px] text-gray-500 mb-3 uppercase">// ETIMOLOGIA</p>
                    <p className="text-xs"><strong>Polemic</strong> (do grego <em>polemikos</em>): Relativo à guerra. Aqui, guerra contra a irrelevância.</p>
                </div>
            </div>
            <div className="grid gap-6 h-full">
                <TechCard label="O Problema" title="LinkedIn Invisível">
                    A maioria dos perfis é um currículo morto. Headline genérica ("Ajudo empresas..."), bio institucional e conteúdo motivacional raso.
                </TechCard>
                <TechCard label="A Solução" title="Ativo de Conversão" highlight>
                    Um perfil PLG é uma landing page viva. Ele vende sua competência antes de você entrar na sala de reunião.
                </TechCard>
            </div>
        </div>
        <div className="border-t border-black/10 pt-12">
            <H3>Impacto Mensurado (90 Dias)</H3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200 mt-6">
                <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors">
                    <div className="text-2xl md:text-4xl font-bold font-mono text-neon-green mb-2">+187%</div>
                    <div className="text-[9px] tracking-widest uppercase text-gray-500">Visibilidade</div>
                </div>
                <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors">
                    <div className="text-2xl md:text-4xl font-bold font-mono text-neon-green mb-2">+326%</div>
                    <div className="text-[9px] tracking-widest uppercase text-gray-500">Inbound</div>
                </div>
                <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors">
                    <div className="text-2xl md:text-4xl font-bold font-mono text-neon-green mb-2">+43%</div>
                    <div className="text-[9px] tracking-widest uppercase text-gray-500">LTV / Ticket</div>
                </div>
                <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors">
                    <div className="text-2xl md:text-4xl font-bold font-mono text-neon-green mb-2">+92%</div>
                    <div className="text-[9px] tracking-widest uppercase text-gray-500">Autoridade</div>
                </div>
            </div>
        </div>
      </Reveal>
    </Container>
  </Section>
);

export const DiagnosisSection: React.FC = () => (
  <Section id="diagnostico">
    <Container>
      <ReadingContainer>
        <SectionTitle subtitle="Auditoria">Diagnóstico <span className="text-gray-400">Técnico</span></SectionTitle>
        <Paragraph>Seu perfil está sangrando dinheiro? Faça a checagem binária (Sim/Não).</Paragraph>
        <div className="grid gap-6 mt-12">
            {[
                { id: "01", title: "Headline Funcional", desc: "Sua headline diz PARA QUEM, QUAL PROBLEMA e QUAL RESULTADO? Ou apenas seu cargo?" },
                { id: "02", title: "Bio Orientada a Vendas", desc: "Sua bio começa com um gancho, apresenta um método e termina com CTA? Ou conta sua história de vida?" },
                { id: "03", title: "Prova de Competência", desc: "Existem números, logos de clientes e resultados tangíveis visíveis em 5 segundos?" },
                { id: "04", title: "Conteúdo Técnico", desc: "Seus posts mostram 'como fazer' e bastidores? Ou são apenas opiniões genéricas?" },
                { id: "05", title: "Mecanismo de Conversão", desc: "Existe um link claro para agendamento ou download de material na área de destaque?" }
            ].map((item) => (
                <div key={item.id} className="group flex items-start gap-6 p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="font-mono text-neon-green font-bold text-base">[{item.id}]</div>
                    <div>
                        <h4 className="text-base font-bold mb-1 font-space uppercase">{item.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-12 p-6 bg-deep-black text-white font-mono text-[11px]">
            <p className="mb-2 text-neon-green uppercase tracking-widest">// RESULTADO</p>
            <p>Se você marcou "NÃO" em 2 ou mais itens, seu perfil é invisível para tomadores de decisão sérios.</p>
        </div>
      </ReadingContainer>
    </Container>
  </Section>
);

export const ErrorsSection: React.FC = () => (
  <Section id="erros" className="bg-off-black text-white">
    <div className="absolute inset-0 bg-grid-pattern-dark opacity-10 pointer-events-none"></div>
    <Container>
      <SectionTitle subtitle="Falhas Críticas" inverse>3 Erros <span className="text-neon-green">Fatais</span></SectionTitle>
      <div className="grid lg:grid-cols-3 gap-px bg-white/10 border border-white/10 mt-12">
        {[
            {
                error: "Headline = Cargo",
                bad: "Dev Full Stack | React | Node",
                good: "Engenheiro de Performance: Recupero apps lentos em 3 semanas.",
                why: "Cargo não vende. Solução de problema vende."
            },
            {
                error: "Bio Cronológica",
                bad: "Formado em 2010, trabalhei na empresa X...",
                good: "Ajudo CTOs a reduzir custos de cloud em 40% com meu método proprietário.",
                why: "Ninguém compra seu passado. Compram o futuro que você entrega."
            },
            {
                error: "Conteúdo Raso",
                bad: "5 dicas para produtividade...",
                good: "Como reestruturei um banco de dados legado e economizei R$50k/mês.",
                why: "Dicas genéricas atraem juniores. Conteúdo técnico atrai contratantes."
            }
        ].map((item, idx) => (
            <div key={idx} className="bg-off-black p-8 group relative overflow-hidden flex flex-col h-full hover:bg-white/5 transition-colors">
                <div className="font-mono text-[9px] text-neon-green mb-6 border border-neon-green/30 inline-block px-2 py-1 w-max">
                    [ERRO_0{idx + 1}] {item.error.toUpperCase()}
                </div>
                <div className="space-y-6 flex-grow">
                    <div className="opacity-50 border-l border-white/20 pl-4">
                        <p className="font-mono text-[9px] mb-1 uppercase">Input Incorreto</p>
                        <p className="text-xs italic">"{item.bad}"</p>
                    </div>
                    <div className="border-l border-neon-green pl-4">
                        <p className="font-mono text-[9px] text-neon-green mb-1 uppercase">Input Otimizado</p>
                        <p className="text-sm font-bold">"{item.good}"</p>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 text-[10px] font-mono text-gray-400">
                    &gt; DIAGNÓSTICO: {item.why}
                </div>
            </div>
        ))}
      </div>
    </Container>
  </Section>
);

export const AnatomySection: React.FC = () => (
    <Section id="anatomy">
        <Container>
            <ReadingContainer>
                <SectionTitle subtitle="Blueprint">Anatomia do <span className="text-neon-green">Perfil</span></SectionTitle>
            </ReadingContainer>
            <H3>1. Arquitetura de Headline</H3>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
                <TechCard label="Camada 1" title="Gancho">
                    Dor urgente + Resultado claro.
                </TechCard>
                <TechCard label="Camada 2" title="Autoridade">
                    Números, tempo ou clientes.
                </TechCard>
                <TechCard label="Camada 3" title="Diferencial">
                    Método proprietário ou tecnologia.
                </TechCard>
            </div>
            <H3>2. Estrutura de Bio (AIDA-PLG)</H3>
            <div className="relative border border-deep-black bg-grid-pattern p-8 lg:p-12 mt-6">
                <CornerBrackets />
                <div className="space-y-4 font-mono text-xs max-w-5xl mx-auto">
                    <div className="flex gap-4 items-start">
                        <span className="w-12 text-neon-green font-bold shrink-0">[ATN]</span>
                        <p>Gancho: Quebre o padrão. "Você está pagando caro por X."</p>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="w-12 text-neon-green font-bold shrink-0">[INT]</span>
                        <p>Contexto: "O problema não é sua equipe, é seu processo."</p>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="w-12 text-neon-green font-bold shrink-0">[DES]</span>
                        <p>Solução: "Desenvolvi o Protocolo Y. Resultados: +200% ROI."</p>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="w-12 text-neon-green font-bold shrink-0">[ACT]</span>
                        <p>Conversão: "Link para auditoria abaixo."</p>
                    </div>
                </div>
            </div>
        </Container>
    </Section>
);

export const MandamentosSection: React.FC = () => (
  <Section id="mandamentos">
    <Container>
      <ReadingContainer>
        <SectionTitle subtitle="Diretrizes">9 Protocolos <span className="text-neon-green">PLG</span></SectionTitle>
      </ReadingContainer>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
        {[
            { t: "Clareza > Criatividade", d: "Não seja inteligente. Seja claro. Confusão mata conversão." },
            { t: "Prove, não fale", d: "Adjetivos são fracos. Números e prints são absolutos." },
            { t: "Polarize", d: "Se ninguém discorda de você, você não disse nada relevante." },
            { t: "Consistência Técnica", d: "90 dias de posts técnicos batem qualquer viral de gato." },
            { t: "Zero Motivacional", d: "Linkedin não é terapia. Resolva problemas de negócio." },
            { t: "Venda Invisível", d: "O melhor pitch é aquele que parece uma aula." },
            { t: "Processo > Inspiração", d: "Amadores esperam vontade. Profissionais seguem checklist." },
            { t: "Preço é Posicionamento", d: "Se ninguém reclama do preço, você está barato demais. Cobre pela transformação." },
            { t: "Demita Clientes", d: "Um cliente errado drena a energia de três certos. Limpe a base sem piedade." }
        ].map((item, i) => (
            <div key={i} className="border border-gray-200 p-6 hover:border-black transition-all duration-300 group flex flex-col justify-between transform hover:-translate-y-1 hover:shadow-lg bg-white h-full">
                <div>
                    <div className="text-[9px] font-mono text-gray-400 mb-3 group-hover:text-neon-green transition-colors">PROTOCOLO_0{i+1}</div>
                    <h4 className="font-bold mb-2 uppercase text-sm">{item.t}</h4>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed">{item.d}</p>
            </div>
        ))}
      </div>
    </Container>
  </Section>
);

export const MethodSection: React.FC = () => (
  <Section id="metodo" className="bg-off-black text-white">
    <div className="absolute inset-0 bg-grid-pattern-dark opacity-10 pointer-events-none"></div>
    <Container>
      <SectionTitle subtitle="Sistema" inverse>O Método <span className="text-neon-green">Linear</span></SectionTitle>
      <div className="flex flex-col lg:flex-row justify-between items-center text-[10px] font-mono tracking-widest my-12 text-gray-500 border-t border-b border-white/10 py-6">
        <span className="text-neon-green font-bold text-sm">START</span>
        <span className="hidden lg:inline text-white/20">--------------------------------------------------&gt;</span>
        <span className="text-white text-sm">EXECUÇÃO</span>
        <span className="hidden lg:inline text-white/20">--------------------------------------------------&gt;</span>
        <span className="text-neon-green font-bold text-sm">SCALE</span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
            { title: "Posicionamento", desc: "Definição cirúrgica de ICP e Oferta." },
            { title: "Provocação", desc: "Quebra de crenças do mercado." },
            { title: "Prova Social", desc: "Validação externa de competência." },
            { title: "Conteúdo", desc: "Demonstração de domínio técnico." },
            { title: "Atração", desc: "Mecanismos de captura de lead." },
            { title: "Conversão", desc: "Agendamento sem fricção." }
        ].map((item, i) => (
            <div key={i} className="flex items-start gap-5 p-6 border border-white/5 hover:bg-white/5 transition-colors h-full">
                <div className="font-mono text-neon-green text-lg font-bold">0{i+1}</div>
                <div>
                    <h4 className="font-bold uppercase tracking-wider text-xs mb-2">{item.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
            </div>
        ))}
      </div>
    </Container>
  </Section>
);

export const ContentMatrixSection: React.FC = () => (
    <Section id="content-matrix">
        <Container>
            <ReadingContainer>
                <SectionTitle subtitle="Operação">Matriz <span className="text-neon-green">4D</span></SectionTitle>
                <Paragraph>Sistema de produção para consistência sem burnout.</Paragraph>
            </ReadingContainer>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-black border border-black mt-12">
                <div className="bg-white p-8 h-full">
                    <h4 className="font-mono text-[10px] mb-4 text-gray-500">[DIMENSÃO 1: FREQUÊNCIA]</h4>
                    <ul className="text-xs space-y-3 font-medium">
                        <li className="pb-2 border-b border-gray-100">SEG: Opinião Técnica</li>
                        <li className="pb-2 border-b border-gray-100">QUA: Bastidores/Case</li>
                        <li className="pb-2 border-b border-gray-100">SEX: Framework</li>
                    </ul>
                </div>
                <div className="bg-white p-8 h-full">
                    <h4 className="font-mono text-[10px] mb-4 text-gray-500">[DIMENSÃO 2: FORMATO]</h4>
                    <ul className="text-xs space-y-3 font-medium">
                        <li className="pb-2 border-b border-gray-100">40% Texto (Deep dive)</li>
                        <li className="pb-2 border-b border-gray-100">30% Carrossel (Visual)</li>
                        <li className="pb-2 border-b border-gray-100">20% Vídeo (Conexão)</li>
                    </ul>
                </div>
                <div className="bg-white p-8 h-full">
                    <h4 className="font-mono text-[10px] mb-4 text-gray-500">[DIMENSÃO 3: TOM]</h4>
                    <ul className="text-xs space-y-3 font-medium">
                        <li className="pb-2 border-b border-gray-100">20% Polêmico</li>
                        <li className="pb-2 border-b border-gray-100">60% Educativo</li>
                        <li className="pb-2 border-b border-gray-100">20% Analítico</li>
                    </ul>
                </div>
                <div className="bg-white p-8 h-full">
                    <h4 className="font-mono text-[10px] mb-4 text-gray-500">[DIMENSÃO 4: FUNIL]</h4>
                    <ul className="text-xs space-y-3 font-medium">
                        <li className="pb-2 border-b border-gray-100">Topo: Problema</li>
                        <li className="pb-2 border-b border-gray-100">Meio: Método</li>
                        <li className="pb-2 border-b border-gray-100">Fundo: Resultado</li>
                    </ul>
                </div>
            </div>
        </Container>
    </Section>
);

export const HooksSection: React.FC = () => (
    <Section id="hooks" className="bg-off-black text-white">
        <Container>
            <SectionTitle subtitle="Copywriting" inverse>Banco de <span className="text-neon-green">Hooks</span></SectionTitle>
            <Paragraph className="text-white/70">Padrões de início de texto que forçam a leitura.</Paragraph>
            <div className="grid md:grid-cols-2 gap-8 mt-12 font-mono text-xs">
                {[
                    { cat: "CONTRADIÇÃO", ex: "Todo mundo diz [X]. A verdade é [Y].", desc: "Quebra o padrão de pensamento." },
                    { cat: "FINANCEIRO", ex: "Gastei R$50k em [X] e foi inútil.", desc: "Chama atenção pelo valor perdido." },
                    { cat: "BASTIDORES", ex: "Como fechei um contrato de R$100k sem proposal.", desc: "Promessa de segredo revelado." },
                    { cat: "DADOS", ex: "80% dos [cargo] cometem este erro de arquitetura.", desc: "Medo de estar errado." }
                ].map((item, i) => (
                    <div key={i} className="border-l-2 border-neon-green bg-white/5 p-6 hover:bg-white/10 transition-colors">
                        <div className="text-neon-green mb-3 tracking-widest uppercase">[{item.cat}]</div>
                        <div className="text-white mb-4 text-sm leading-relaxed">"{item.ex}"</div>
                        <div className="text-gray-500 text-[10px]">// {item.desc}</div>
                    </div>
                ))}
            </div>
        </Container>
    </Section>
);

export const StackSection: React.FC = () => (
    <Section id="stack">
        <Container>
            <SectionTitle subtitle="Ferramentas">Tech <span className="text-neon-green">Stack</span></SectionTitle>
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
                <div>
                    <H3 className="!mt-0">Arsenal</H3>
                    <ul className="border-l border-black pl-8 space-y-6 mt-6">
                        <li>
                            <strong className="block text-xs uppercase tracking-widest mb-1">Conteúdo</strong>
                            <span className="text-gray-600 text-sm">Taplio (Agendamento), Canva (Visual).</span>
                        </li>
                        <li>
                            <strong className="block text-xs uppercase tracking-widest mb-1">Growth</strong>
                            <span className="text-gray-600 text-sm">LinkedHelper (Automação), Phantombuster (Dados).</span>
                        </li>
                        <li>
                            <strong className="block text-xs uppercase tracking-widest mb-1">Analytics</strong>
                            <span className="text-gray-600 text-sm">Shield (Métricas), Google Analytics (Conversão).</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <H3 className="!mt-0">Fluxo Automático</H3>
                    <div className="font-mono text-xs bg-gray-50 p-6 border border-gray-200 space-y-4 mt-6">
                        <div>
                            <p className="mb-1"><span className="text-neon-green font-bold bg-black px-1">D+00</span> Conexão Aceita</p>
                            <p className="pl-6 text-gray-500 border-l border-gray-300 ml-2 pt-1">-&gt; Pergunta de qualificação.</p>
                        </div>
                        <div>
                            <p className="mb-1"><span className="text-neon-green font-bold bg-black px-1">D+03</span> Follow-up de Valor</p>
                            <p className="pl-6 text-gray-500 border-l border-gray-300 ml-2 pt-1">-&gt; Envio de case similar.</p>
                        </div>
                        <div>
                            <p className="mb-1"><span className="text-neon-green font-bold bg-black px-1">D+07</span> Call to Action</p>
                            <p className="pl-6 text-gray-500 border-l border-gray-300 ml-2 pt-1">-&gt; Convite para diagnóstico.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    </Section>
);

export const MetricsSection: React.FC = () => (
    <Section id="metrics">
        <Container>
            <SectionTitle subtitle="KPIs">Métricas de <span className="text-neon-green">Receita</span></SectionTitle>
            <div className="flex flex-col lg:flex-row gap-12 mt-12">
                <div className="flex-1 opacity-40 grayscale border-2 border-dashed border-gray-300 p-6">
                    <H3 className="!mt-0 line-through text-gray-400">Métricas de Ego</H3>
                    <p className="text-sm text-gray-500">Seguidores, Likes, Impressões vazias.</p>
                    <p className="text-xs mt-4 italic text-gray-400">Isso não paga boleto.</p>
                </div>
                <div className="flex-1 border-2 border-black p-6 relative shadow-2xl">
                    <div className="absolute -top-3 right-6 bg-black text-white px-3 py-1 text-[9px] uppercase font-bold tracking-widest">Foco Total</div>
                    <H3 className="!mt-0">Métricas Reais</H3>
                    <ul className="space-y-4 font-mono text-sm mt-6">
                        <li className="flex justify-between border-b border-gray-100 pb-2">
                            <span>Taxa de Resposta</span>
                            <span className="font-bold text-neon-green bg-black px-2">&gt; 25%</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-100 pb-2">
                            <span>Perfil p/ DM</span>
                            <span className="font-bold text-neon-green bg-black px-2">&gt; 5%</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-100 pb-2">
                            <span>DM p/ Call</span>
                            <span className="font-bold text-neon-green bg-black px-2">&gt; 30%</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-100 pb-2">
                            <span>Fechamento</span>
                            <span className="font-bold text-neon-green bg-black px-2">&gt; 20%</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Container>
    </Section>
);

export const CasesSection: React.FC = () => (
    <Section id="cases" className="bg-off-black text-white">
        <Container>
            <SectionTitle subtitle="Evidência" inverse>Estudos de <span className="text-neon-green">Caso</span></SectionTitle>
            <div className="grid md:grid-cols-2 gap-12 mt-12">
                <div className="border border-white/10 p-8 hover:border-white/30 transition-colors">
                    <div className="font-mono text-neon-green text-[9px] mb-6 border border-neon-green px-2 py-1 inline-block tracking-widest">[CONSULTORIA ESTRATÉGICA]</div>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1">Antes</p>
                            <p className="text-xl text-gray-400">R$ 8k/mês</p>
                        </div>
                        <div className="mb-2 text-neon-green font-mono">---&gt;</div>
                        <div className="text-right">
                            <p className="text-[10px] text-neon-green uppercase mb-1">Depois (90d)</p>
                            <p className="text-3xl font-bold">R$ 67k/mês</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 border-t border-white/10 pt-4">Inbound ativo de 15 leads qualificados/mês.</p>
                </div>
                <div className="border border-white/10 p-8 hover:border-white/30 transition-colors">
                    <div className="font-mono text-neon-green text-[9px] mb-6 border border-neon-green px-2 py-1 inline-block tracking-widest">[SAAS B2B]</div>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase mb-1">CAC Inicial</p>
                            <p className="text-xl text-gray-400">R$ 3.200</p>
                        </div>
                        <div className="mb-2 text-neon-green font-mono">---&gt;</div>
                        <div className="text-right">
                            <p className="text-[10px] text-neon-green uppercase mb-1">CAC Final</p>
                            <p className="text-3xl font-bold">R$ 1.100</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 border-t border-white/10 pt-4">Ciclo de vendas reduzido de 180 para 45 dias.</p>
                </div>
            </div>
        </Container>
    </Section>
);

export const FinalCTASection: React.FC = () => (
    <section id="final-cta" className="bg-deep-black text-white py-[120px] relative overflow-hidden border-t border-neon-green">
        <div className="absolute inset-0 bg-grid-pattern-dark opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <img
                src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/68ea81e059ec0a12e82c943c.png"
                alt="Background Logo"
                className="w-[80%] max-w-[1000px] h-auto"
            />
        </div>
        <Container>
            <div className="grid lg:grid-cols-2 lg:gap-24 gap-16 items-center">
                <div className="relative z-10">
                    <div className="font-mono text-neon-green text-[10px] mb-6 tracking-widest uppercase border border-neon-green px-3 py-1 inline-block">
                        [SESSÃO ESTRATÉGICA]
                    </div>
                    <h2 className="text-[28px] md:text-[40px] font-bold leading-[1.2] font-space mb-6 tracking-tight">
                        PARE DE <span className="text-neon-green">ADIVINHAR</span>.<br/>
                        COMECE A ESCALAR.
                    </h2>
                    <p className="text-gray-400 text-sm md:text-[15px] font-light mb-12 leading-relaxed max-w-md">
                        Não é um "cafezinho". É uma auditoria técnica do seu posicionamento atual e um roadmap para dobrar seu LTV.
                    </p>
                    <div className="space-y-8 mb-12">
                        {[
                            "Análise de Cegueira de Perfil (Onde você perde dinheiro)",
                            "Roadmap de Conteúdo 4D Personalizado",
                            "Script de Conversão Inbound",
                            "Acesso ao Framework de Precificação"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-5 h-5 border border-neon-green flex items-center justify-center text-neon-green text-[9px] font-mono group-hover:bg-neon-green group-hover:text-black transition-colors shrink-0">
                                    0{i + 1}
                                </div>
                                <p className="text-xs md:text-sm text-gray-300 font-mono">{item}</p>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-white/5 border-l-2 border-neon-green text-[10px] text-gray-500 font-mono">
                        // AVISO: Apenas 4 slots disponíveis por semana para manter a qualidade da entrega.
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="absolute -inset-1 bg-gradient-to-r from-neon-green to-transparent opacity-20 blur-lg"></div>
                    <div className="border border-white/20 bg-off-black relative shadow-2xl">
                        <div className="bg-black text-white py-3 px-4 text-[10px] font-mono font-bold tracking-widest uppercase border-b border-white/10 flex justify-between items-center">
                            <span>Agendamento Seguro</span>
                            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span> Online</span>
                        </div>
                        <iframe
                            src="https://pages.revhackers.com.br/widget/booking/2lhKFml52GYo4yFMSh3y"
                            style={{ width: '100%', height: '650px', border: 'none', overflow: 'hidden' }}
                            scrolling="no"
                            id="2lhKFml52GYo4yFMSh3y_1764039477374"
                        ></iframe>
                    </div>
                </div>
            </div>
        </Container>
    </section>
);
