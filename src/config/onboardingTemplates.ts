export interface OnboardingMilestone {
    dia: string;
    nome: string;
    tipo: 'marco' | 'entrega' | 'verdade' | 'review';
    descricao: string;
    entrega: string;
    valor: string;
    dark: boolean;
    green: boolean;
}

export interface OnboardingTemplate {
    bowtie: {
        eyebrow: string;
        title: string;
        leftLabel: string;
        leftTitle: string;
        centerTitle: string;
        rightLabel: string;
        rightTitle: string;
        bottomLeftTitle: string;
        bottomLeftDesc: string;
        bottomRightTitle: string;
        bottomRightDesc: string;
    };
    milestones: OnboardingMilestone[];
}

// O Template Padrão (Full/Consulting)
export const fullConsultingTemplate: OnboardingTemplate = {
    bowtie: {
        eyebrow: "Estrutura do Onboarding",
        title: "Jornada de 90 Dias",
        leftLabel: "Análise",
        leftTitle: "Organização & Setup",
        centerTitle: "Ativação",
        rightLabel: "Retenção",
        rightTitle: "Adoção & Sucesso",
        bottomLeftTitle: "Foco em Arrumar a Casa",
        bottomLeftDesc: "Diagnosticamos vazamentos de funil, arrumamos a casa e montamos a fundação técnica baseada em dados reais.",
        bottomRightTitle: "Foco em Retenção e Tração",
        bottomRightDesc: "Treinamento, milestones fixos e reviews estruturados para garantir resultados nos primeiros 15 dias e zero dependência no dia 90."
    },
    milestones: [
        { dia: 'Dia 01', nome: 'Kickoff Oficial', tipo: 'marco', descricao: 'Reunião de início: plano de sucesso apresentado, milestones acordados, acessos configurados e canal de comunicação ativado.', entrega: 'Plano alcançável documentado', valor: 'Você sai sabendo exatamente o que acontece, quando e quem é responsável.', dark: true, green: false },
        { dia: 'Dia 07', nome: 'Fundação no Ar', tipo: 'entrega', descricao: 'Configuração base do modelo: ICP definido, canal de tração mapeado e estrutura de dados conectada.', entrega: 'Plano de ICP + Canais ativos', valor: 'A casa está arrumada. Nada vai ser construído em cima de fundação frágil.', dark: false, green: false },
        { dia: 'Dia 15', nome: 'Primeira Ativação', tipo: 'verdade', descricao: 'Momento de Verdade 1: O canal de tração foi ativado, os primeiros dados começam a ser gerados em tempo real.', entrega: 'Primeira campanha/ação no ar', valor: 'Você vê o sistema funcionando de verdade antes de completar 15 dias.', dark: false, green: true },
        { dia: 'Dia 21', nome: 'Time Alinhado', tipo: 'entrega', descricao: 'Processo de passagem de bastão operacional. O time sabe onde coletar os leads/dados.', entrega: 'Checklist de alinhamento com equipe', valor: 'Dependência zero da RevHackers para entender a operação.', dark: false, green: false },
        { dia: 'Dia 30', nome: 'Review de Rota', tipo: 'review', descricao: 'Review estruturado: o que está funcionando, o que precisa de ajuste e quais são as prioridades do mês 2.', entrega: 'Relatório de validação inicial + plano mês 2', valor: 'Tudo que não está convertendo é corrigido antes de virar gasto excessivo.', dark: true, green: false },
        { dia: 'Dia 45', nome: 'Ajuste Fino Analítico', tipo: 'entrega', descricao: 'Aprimoramento de canais: Otimização baseada nas métricas reais extraídas do primeiro ciclo de tração.', entrega: 'Otimização nas frentes e mensagens', valor: 'O sistema começa a escalar organicamente pela leitura de dados reais.', dark: false, green: false },
        { dia: 'Dia 60', nome: 'Review de Performance', tipo: 'review', descricao: 'Análise de dados: Receita, Custo por Lead, CAC e engajamento vs. OKRs.', entrega: 'Dashboard de resultados + mapa de retenção', valor: 'Você tem números reais para mostrar o retorno do investimento.', dark: true, green: false },
        { dia: 'Dia 75', nome: 'Otimização & Escala', tipo: 'entrega', descricao: 'Cortar canais ineficientes e redobrar o budget/esforço no que está provando trazer ROI. Sem achismo.', entrega: 'Foco exclusivo na conversão mais barata', valor: 'Cada centavo alocado agora vai para as apostas mais certeiras do seu ICP.', dark: false, green: false },
        { dia: 'Dia 90', nome: 'Resultados + Expansão', tipo: 'verdade', descricao: 'Momento de Verdade 2: review final com OKRs vs. resultados reais, entrega do playbook e proposta de expansão.', entrega: 'Playbook + relatório 90 dias + expansão', valor: 'O que foi construído é seu. A proposta de expansão é o próximo nível.', dark: false, green: true },
    ]
};

// CRM Ops Template
export const crmOpsTemplate: OnboardingTemplate = {
    bowtie: {
        eyebrow: "SLA Operacional",
        title: "Jornada CRM de 90 Dias",
        leftLabel: "Estruturação",
        leftTitle: "Processos & Pipelines",
        centerTitle: "Automação",
        rightLabel: "Ativação Comercial",
        rightTitle: "Adoção do Time",
        bottomLeftTitle: "Foco em Workflow e Controle",
        bottomLeftDesc: "Mapeamento das etapas de vendas, funis claros, automações internas para o time perder menos tempo operando sistema.",
        bottomRightTitle: "Foco em Qualidade da Conversão",
        bottomRightDesc: "SLA Vendas/Marketing, acompanhamento diário com o time para garantir que o software seja o motor e não âncora."
    },
    milestones: [
        { dia: 'Dia 01', nome: 'Kickoff CRM', tipo: 'marco', descricao: 'Reunião de início do projeto. Alinhamento de visão, rotinas comerciais e mapeamento profundo do cenário atual (As-Is).', entrega: 'Mapeamento As-Is assinado', valor: 'Entendemos como você vende antes de empurrar software.', dark: true, green: false },
        { dia: 'Dia 07', nome: 'Planejamento Estratégico', tipo: 'entrega', descricao: 'Apresentação formal e aprovação do Planejamento Estratégico. Definição do escopo, etapas técnicas e ferramentas que serão integradas para a máquina rodar.', entrega: 'Plano Estratégico Validado', valor: 'Claridade total sobre a rota comercial antes da implementação técnica.', dark: false, green: false },
        { dia: 'Dia 15', nome: 'Setup Base & Arquitetura', tipo: 'verdade', descricao: 'Criação antecipada da conta no sistema. Configuração bruta dos pipelines estabelecidos no Kickoff, cadastro de motivos de perda e criação de campos personalizados.', entrega: 'Estrutura Central do Funnel Criada', valor: 'O esqueleto do seu processo comercial passa a existir no software.', dark: false, green: true },
        { dia: 'Dia 21', nome: 'Implementação e Treinamento', tipo: 'entrega', descricao: 'Treinamento do time com base nos processos montados e materiais entregues por vocês. Simulação de passagem de lead e uso de carteira.', entrega: 'Equipe de Vendas Operando', valor: 'Fim das planilhas. Adoção total do CRM pela linha de frente.', dark: false, green: false },
        { dia: 'Dia 30', nome: 'SLA e Review Técnico', tipo: 'review', descricao: 'Revisão: A automação está ágil? Como está o "Speed to Lead"? Vamos polir a usabilidade (regras de negócio e alertas) após a primeira semana de uso intenso.', entrega: 'Documento Técnico de SLA + Ajustes', valor: 'Simplificamos ao máximo para o time AMAR usar e não ter atrito entre Marketing e Vendas.', dark: true, green: false },
        { dia: 'Dia 45', nome: 'Automações Avançadas', tipo: 'entrega', descricao: 'Comunicação Automática: Régua de resgate, Follow-up e mensagens transacionais configuradas via cadência no CRM.', entrega: 'Automações Inbound/Outbound ativas', valor: 'O sistema cobra os clientes e avisa os vendedores de forma humanizada.', dark: false, green: false },
        { dia: 'Dia 60', nome: 'Adoção Completa', tipo: 'review', descricao: 'Analisar uso: O time de vendas está de fato operando no sistema de ponta a ponta? As tarefas estão sendo realizadas no prazo?', entrega: 'Dashboard de Adoção e Produtividade', valor: 'A adoção do sistema dita o ROI. Se eles não usarem, não funciona.', dark: true, green: false },
        { dia: 'Dia 75', nome: 'Otimização de Conversão', tipo: 'entrega', descricao: 'Auditoria térmica dos funis: Quais etapas mais matam leads? Onde travam? Modificamos as taxas de aprovação (Win/Loss) baseados nos micro-gargalos.', entrega: 'Funil otimizado para quebra de objeção', valor: 'A taxa de conversão geral do seu funil aumenta em cascata.', dark: false, green: false },
        { dia: 'Dia 90', nome: 'Handover & Escala', tipo: 'verdade', descricao: 'Momento de Verdade 2: Time 100% familiarizado. Velocidade e taxa de acerto controlados. Entrega das chaves e autorização de escala.', entrega: 'Playbook do Vendedor + Relatório 90 Dias', valor: 'Damos as chaves de uma máquina comercial previsível e treinável.', dark: false, green: true },
    ]
};

// Funnels & Automação Template
export const funnelsTemplate: OnboardingTemplate = {
    bowtie: {
        eyebrow: "Mapeamento e Execução",
        title: "Jornada de Funis em 90 Dias",
        leftLabel: "Design de Oferta",
        leftTitle: "Landing & Conversão",
        centerTitle: "Tráfego",
        rightLabel: "Nurturing",
        rightTitle: "Automações Escalonáveis",
        bottomLeftTitle: "Foco no Front-end da Recepção",
        bottomLeftDesc: "Pesquisa, Copywriting de Conversão e Desenvolvimento Píxel-Perfect de Landing Pages para máxima aquisição.",
        bottomRightTitle: "Foco no Back-end do Lead",
        bottomRightDesc: "Uma vez capturado, criamos uma rede formidável de follows-ups para não perder o contato e maximizar o LTV."
    },
    milestones: [
        { dia: 'Dia 01', nome: 'Briefing Criativo', tipo: 'marco', descricao: 'Alinhamento dos ângulos do produto principal, levantamento da oferta irresistível, tom de voz e referências visuais.', entrega: 'Briefing de Oferta Finalizado', valor: 'Conhecemos sua essência antes de vender seu produto.', dark: true, green: false },
        { dia: 'Dia 07', nome: 'Oferta Estruturada', tipo: 'entrega', descricao: 'Wireframe, Copywriting e roteiro conceitual da primeira página criados. Sem perfumaria visual ainda, só lógica.', entrega: 'Documento Matriz de Copy + Wireframe', valor: 'A promessa de venda torna-se tangível.', dark: false, green: false },
        { dia: 'Dia 15', nome: 'Funil Base Online', tipo: 'verdade', descricao: 'Momento de Verdade 1: Landing page de alta conversão programada e online. Lead Capture funcionando 100%.', entrega: 'Landing Page no Ar + Formulários Captando', valor: 'Seu vendedor 24h/dia acabou de vestir o terno e está pronto no caixa.', dark: false, green: true },
        { dia: 'Dia 21', nome: 'Setup Tráfego', tipo: 'entrega', descricao: 'Criação de Pixel, Setup de APIs do Meta/Google e configuração dos eventos de conversão no servidor.', entrega: 'Infraestrutura de Ads Tracked', valor: 'Você nunca pagará por um dado cego. Tudo será rastreado.', dark: false, green: false },
        { dia: 'Dia 30', nome: 'Campanhas em Run', tipo: 'review', descricao: 'Primeiros anúncios rodando. Análise da taxa de conversão (CTR e CPA) da página contra a média de mercado.', entrega: 'Primeiro Dashboard Pago + LP Review', valor: 'Validamos exatamente qual ângulo vende mais barato rapidamente.', dark: true, green: false },
        { dia: 'Dia 45', nome: 'Automações Conectadas', tipo: 'entrega', descricao: 'Campanhas rodando geram leads vivos: hora de construir a máquina transacional de Follow Ups automáticos perfeitamente sincronizada.', entrega: 'Flows ativos + integrações nativas prontas', valor: 'O seu dinheiro continua performando mesmo com leads que disseram não ontem.', dark: false, green: false },
        { dia: 'Dia 60', nome: 'Review Metrifícações', tipo: 'review', descricao: 'Temos volume para testar hipóteses (Testes A/B nativos da Landing Page). Alteração das dobras de objeção no site.', entrega: 'Análise de Heatmaps e CTR de Botão', valor: 'Cada visitante trará 3x mais retorno apenas com posicionamento estratégico.', dark: true, green: false },
        { dia: 'Dia 75', nome: 'Escala Certa', tipo: 'entrega', descricao: 'Limpeza de campanhas perdedoras no tráfego e aceleração brutal nos criativos vencedores. O Funil está estável.', entrega: 'Otimização pesada no CPA de qualificados', valor: 'Redução brutal de Custo por Lead e previsibilidade de escala sem aumentar % de quebra', dark: false, green: false },
        { dia: 'Dia 90', nome: 'A Máquina Própria', tipo: 'verdade', descricao: 'Momento de Verdade 2: O Funil converte, a automação sustenta, e você domina o custo marginal de aquisição. Fechamento do sprint.', entrega: 'Relatório Final da Linha do Tempo e Blueprint Completo de Tráfego', valor: 'Você vira dono da sua aquisição digital.', dark: false, green: true },
    ]
};

// Founder / Autoridade LinkedIn Template
export const founderTemplate: OnboardingTemplate = {
    bowtie: {
        eyebrow: "Jornada de Autoridade",
        title: "Protocolo Founder de 90 Dias",
        leftLabel: "Posicionamento",
        leftTitle: "Identidade & Perfil",
        centerTitle: "Conteúdo",
        rightLabel: "Conversão",
        rightTitle: "Audiência & Pipeline",
        bottomLeftTitle: "Foco em Clareza e Nicho",
        bottomLeftDesc: "Definimos quem você é para o mercado, o ponto de vista único e o ICP do perfil pessoal antes de publicar qualquer conteúdo.",
        bottomRightTitle: "Foco em Consistência e Conversão",
        bottomRightDesc: "Cadência de 3x/semana consolidada, loop de DM estratégico e inbound qualificado gerado exclusivamente pelo conteúdo."
    },
    milestones: [
        { dia: 'Dia 01', nome: 'Kickoff de Posicionamento', tipo: 'marco', descricao: 'Sessão de definição: nicho de autoridade, POV único, ICP do seguidor ideal e bio + headline do LinkedIn otimizados.', entrega: 'Documento de Posicionamento', valor: 'Você sabe exatamente quem é, para quem fala e o que diz antes do primeiro post.', dark: true, green: false },
        { dia: 'Dia 07', nome: 'Perfil Otimizado', tipo: 'entrega', descricao: 'Bio, banner, headline e URL personalizados. Conteúdo fixado que posiciona antes do primeiro post orgânico.', entrega: 'Perfil LinkedIn revisado + fixado', valor: 'Qualquer visita ao perfil já entende em 5 segundos o que você faz e para quem.', dark: false, green: false },
        { dia: 'Dia 15', nome: 'Primeiros Posts no Ar', tipo: 'verdade', descricao: 'Momento de Verdade 1: 3 formatos testados (carrossel de autoridade, text post de opinião e video curto). Primeiros dados reais de alcance por formato.', entrega: '3 posts publicados + métricas iniciais', valor: 'Você descobre qual formato performa com o seu ICP antes de escalar volume.', dark: false, green: true },
        { dia: 'Dia 21', nome: 'Estratégia de Comentários', tipo: 'entrega', descricao: 'Listas de contas-âncora do nicho definidas. Rotina diária de 5–10 comentários estratégicos implementada.', entrega: 'Banco de contas-âncora + roteiro de engajamento', valor: 'Você aparece para as pessoas certas sem depender de ads.', dark: false, green: false },
        { dia: 'Dia 30', nome: 'Review de Formato', tipo: 'review', descricao: 'Análise de alcance por formato. Dobrar no que funciona, iterar no que não converte. Ajuste da pauta do mês 2.', entrega: 'Relatório de alcance + pauta do mês 2', valor: 'Nenhum post do mes 2 sera "achismo" - tudo baseado em dados do mes 1.', dark: true, green: false },
        { dia: 'Dia 45', nome: 'Cadência Consolidada', tipo: 'entrega', descricao: 'Máquina rodando: 3 publicações semanais, banco de conteúdo com 2 semanas de buffer e rotina de comentários diários.', entrega: 'Banco de conteúdo com 6 posts prontos', valor: 'Consistência supera perfeição. Quem publica sem parar vence.', dark: false, green: false },
        { dia: 'Dia 60', nome: 'Review de Engajamento', tipo: 'review', descricao: 'Análise de engajamento qualitativo: quem está comentando? São ICPs? Há inbounds orgânicos? Ajuste de tom e formato.', entrega: 'Dashboard de métricas Founder + ajustes de pauta', valor: 'Você tem dados para saber se está construindo audiência ou apenas alcance.', dark: true, green: false },
        { dia: 'Dia 75', nome: 'Ativação do Loop', tipo: 'entrega', descricao: 'DM estratégico ativado com abordagem baseada em engajamento real. Convites para podcast, evento ou parceria (inbound de autoridade).', entrega: 'Script de DM + lista de contas para abordagem', valor: 'A audiência vira oportunidade sem cold outreach.', dark: false, green: false },
        { dia: 'Dia 90', nome: 'Playbook do Criador', tipo: 'verdade', descricao: 'Momento de Verdade 2: 1 inbound qualificado = payback do protocolo. Entrega do playbook completo de conteúdo e posicionamento.', entrega: 'Playbook do Criador + relatório 90 dias', valor: 'Você sai com a máquina de autoridade operando e documentada.', dark: false, green: true },
    ]
};

// Mapeamento Dinâmico (Fallback)
export const OnboardingCatalog: Record<string, OnboardingTemplate> = {
    'consulting':  fullConsultingTemplate,
    'site':        funnelsTemplate,
    'crm_ops':     crmOpsTemplate,
    'founder':     founderTemplate,
};

export const getTemplateForProjectType = (projectType?: string): OnboardingTemplate => {
    if (!projectType) return fullConsultingTemplate;
    return OnboardingCatalog[projectType.toLowerCase()] || fullConsultingTemplate;
};
