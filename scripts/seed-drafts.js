import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Tenta usar a SERVICE_ROLE (com prioridade) para ter poder de admin, senao vai de ANON
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Credenciais do Supabase ausentes no arquivo .env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const revOpsArticle = `
O mercado de tecnologia não tolera mais ineficiência comercial. Se o seu Marketing gera leads, Vendas fecha uma pequena parte e Customer Success apaga incêndio do churn, sua empresa está sangrando dinheiro na transição entre setores. É aí que o Revenue Operations entra como a espinha dorsal de crescimento SaaS e Enterprise B2B em 2025.

## O Que é Revenue Operations (Geração de Receita)?

Revenue Operations não é a "nova TI das vendas" nem apenas um departamento para limpar dados no CRM. **RevOps é o alinhamento centralizado de Venda, Marketing e CS operando sobre um único conjunto de métricas e tecnologias**. Ele unifica a responsabilidade sobre o crescimento e tira das costas do Head de Vendas a cobrança solitária por pipeline seco. Nós chamamos isso de a união da "Trinity do Growth".

[BLUEPRINT: O Framework RevOps Funcional]
1. **Dados Centralizados (Source of Truth):** Todas as áreas olham para o mesmo Dashboard, sem planilhas paralelas maquiando perda de conversão.
2. **Processos Não-Friccionais:** O SLA entre Marketing e Vendas define EXATAMENTE o que é um MQL. Vendas não descarta lead sem motivo qualificado.
3. **Tecnologia Integrada:** O CRM conversa com o Automation do Marketing e com o ERP, eliminando Data Entry manual para os Closers.
4. **Alocação de Receita Ativa:** O Churn entra no peso do cálculo de comissão de Vendas para evitar contratos "empurrados goela abaixo".
[/BLUEPRINT]

## Por que os Modelos Antigos Falham no B2B Complexo

Vender software de alto ticket com funis do início dos anos 2010 é ineficiente. O modelo *Predictable Revenue* já virou commodity:

- **Mão de obra cara:** Os salários de bons BDRs/SDRs triplicaram. Gastar esse talento humano prospectando listas frias manualmente sem automação é loucura financeira.
- **Ciclo de venda inflado:** As tomadas de decisão empresariais (C-Level) agora envolvem em média de 6 a 10 aprovadores. Sem Inbound focado em Nutrição (HubSpot), seus leads ficam eternamente travados no pipeline de negociação.
- **Blind Spots do Churn:** Enquanto Vendas bate o bumbo com a entrada de R$50k de MRR, Sucesso do Cliente relata a perda de R$60k em três clientes Enterprise insatisfeitos porque venderam funcionalidade fantasma. 

[REDFLAGS: Sinais de que você precisa urgente de RevOps]
- Os relatórios gerados por Marketing nunca batem com o número que o CRM de Vendas mostra.
- Seus SDRs perdem de 1 a 2 horas por dia limpando listas e digitando no CRM ao invés de ligar.
- Não existem gatilhos de automação na transição Sales -> Onboarding (o cliente novo fica "perdido" sem email ou acesso).
[/REDFLAGS]

## A Trilha de Implantação

Se a sua empresa não processa previsibilidade de caixa, ela não suporta pressão de escala. Implemente RevOps seguindo a rota da dor, não a da complexidade técnica. O objetivo supremo da área é retirar os blocos operacionais para que Marketing e Vendas foquem EXCLUSIVAMENTE em criar tração de receita em Mídia Paga ou Outbound. Seu Go-To-Market agradecerá brutalmente.
`;

const coldEmailArticle = `
A taxa média de abertura de um Cold Email em prospecção Outbound B2B despencou de 24% em 2020 para meros 9% no final do ano passado. Por quê? A maioria das Startups e equipes de Vendas corporárias está rodando Playbooks de 10 anos atrás. Se você ainda dispara sequências maciças de "Oi [Primeiro Nome], vi que você é [Cargo]...", seu domínio está na corda bamba do Spam, ou pior: na categoria de "Marcas Irrelevantes" para grandes CEOs e Diretores.

A prospecção Enterprise corporativa virou um jogo de Inteligência Competitiva, Arquitetura de Dados e Copywriting Assassino.

[TAKEAWAYS: Mudança de Mentalidade]
- **Qualidade >> Volume bruto:** Não adianta raspar 5.000 emails do Apollo e disparar em massa. Crie caixas menores e engaje com Inteligência.
- **Personalização de Fato:** Trocar o nome no começo do e-mail não é personalização. Falar que você ouviu o último podcast em que o prospect participou, é.
- **Account-Based:** A mira não está numa liderança isolada. A prospecção é na *Conta* da Empresa Inteira, atacando deficiências específicas pelo setor daquele prospect e como afeta a receita deles.
[/TAKEAWAYS]

## Como Salvar sua Prospecção Outbound usando IA Responsável

A Inteligência Artificial parou de ser truque prático para escrever redação para os Heads de Vendas para ser uma engrenagem crítica em Enriquecimento de Dados. Usar a IA puramente para gerar os emails gera robôs prolixos. A mina de ouro não é usar IA para *Escrever*, mas para *Pesquisar* muito melhor do que nós humanos fazemos em curtos intervalos de tempo.

[STEPS: A Mecânica Outbound Inteligente (Destacada)]
1. **Inteligência de Sinais (Signal-Based Selling):** Monitore contratações estratégicas. Se uma grande empresa de logística contratou um Head de Suprimentos hoje, significa que ele tem "Budget Fresco" e precisa mostrar serviço em seus primeiros 90 dias. É nele que seu BDR vai atirar o primeiro e-mail de contexto.
2. **Setup de Infraestrutura Fria:** Os servidores do Google Workspace e Outlook caçam spam. Compre domínios auxiliares e faça um Warm-up progressivo ao longo de 4 semanas *antes* de tentar rodar a máquina pesada. Use SPF, DKIM e DMARC com zelo absurdo.
3. **Copy Curta com Tensão Operacional:** Retire toda e qualquer introdução boba como "Espero que este e-mail o encontre bem". Vá direto ao sintoma de dor que assombra aquela persona. Seja um médico diagnosticando: e-mails abaixo de 50 palavras geram até 67% mais engajamento entre diretores.
4. **Matriz de Cadência Multicanal:** Se não abriram o email em 3 dias, a cadência deve tentar um Invite de LinkedIn ou uma Cold Call usando dados colhidos do prospect durante a pesquisa inicial como "gatilho" para fisgar a atenção vital do Head.
[/STEPS]

## A Venda B2B só Acontece se Houver Tensão

Uma Engenharia de Vendas forte sabe diagnosticar de fato e colocar o dedo na "dor primária". Não oferte uma "Plataforma SaaS". Oferte a cura da hemorragia e eliminação severa da perda de capital dentro da operação deles no Go-To-Market. Quando o Outbound funciona focado numa Tese de Valor, a conversão é esmagadora.
`;

const tráfegoArticle = `
As agências tradicionais estão matando o CAC das Startups baseando Inbound Marketing B2B na produção exaustiva de "ebooks bobos" e investindo dezenas de milhares de reais disparrando alcance para leads lixo. No mundo real B2B, um MQL (Marketing Qualified Lead) gerado por Inbound e Mídia que chove reclamação dos vendedores é o primeiro passo para destruir o caixa de uma empresa. O fundo do poço da Geração de Demanda.

## Inbound não pode Terminar num Download

Se a sua equipe só tem visibilidade do lead até o preenchimento de formulário "SeuMaterialFoiBaixado.pdf", você está mensurando métricas de vaidade absolutas. Em 2025, os algoritmos das grandes redes querem Tráfego Qualificado Atado à Receita, o que significa cruzar as conversões de Mídia direto no coração do ecossistema de CRM. Vender em alto ticket exige maturidade, rastreio minucioso e distribuição com arquitetura afiada. Não confie só em cliques de anúncios como prova do sucesso, mas prove o sucesso pelas Reuniões Agendadas.

[STACK: Infraestrutura Média Enterprise B2B]
- **Ads Layer:** LinkedIn Ads (para Account-Based Marketing estrito com a C-Level), e Google Search (capturar "intenção na boca do funil" em palavras fundo-de-funil cruéis de CPC alto).
- **Automation:** HubSpot Marketing Hub ou ActiveCampaign para score e nutrição sem "gargalo humano".
- **CRM System:** Um pipe cristalino como HubSpot Sales ou Salesforce que retorna e retroalimenta as campanhas ADS dos clientes fechados confirmando para os Deuses de Mídia que valeu a pena atirar lá.
[/STACK]

## LinkedIn Ads: Onde 99% Falham Brutalmente no B2B

Quando a maioria aciona a primeira campanha de InMail no LinkedIn Manager se depara com o temido Custo-por-Mil avassalador ou CPL altíssimo (e isso choca o time acostumado com FaceAds para delivery de B2C de atacado). O segredo de fazer o ROI acontecer numa plataforma de alto custo:

> O Custo por Lead no LinkedIn não importa se a Qualidade da Reunião (SQL) gerada trouxer um ticket médio recorrente B2B gigantesco que justifica um CPL aparente caro de cem dólares na tela frontal.
- O segredo do Tráfego Pago em B2B Corporativo

Você não deve usar o LinkedIn para pedir "Solicite um Orçamento". Diretores não clicam no meio do feed em "Fale com um Especialista" (quando eles precisam ativamente caçar fornecedores, usam a Busca do Google). Sua estratégia de Feed deve envolver Geração de Conteúdo Altamente Posicionado onde o seu Lead Magnets é "Diagnóstico do Setor" ou ferramentas nativas do fluxo diário dele que você ensinou gratuitamente, posicionando VOCÊ como Autoridade incontestável no seu segmento antes da Cold Call do Time de Vendas (Que vem no dia seguinte da captura).
`;

const drafts = [
  {
    title: "O Guia Definitivo de Revenue Operations (RevOps) B2B no Brasil",
    slug: "guia-definitivo-revenue-operations-b2b-brasil",
    excerpt: "Como destruir os silos entre MKT, Vendas e Sucesso do Cliente e escalar sua máquina B2B usando o framework RevOps que domina o mercado SaaS corporativo em 2025.",
    content: revOpsArticle,
    category: "Vendas", // Will trigger Revenue Score CTA automatically because of Phase 2
    image: "", // Use dynamic fallback or manual later
    author_name: "Giulliano Alves",
    author_role: "CEO & Growth Engineer",
    author_avatar: "",
    read_time: "7 min",
    featured: true,
    published: false, // Critical: Draft status
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString() // scheduled + 5 days
  },
  {
    title: "Playbook de Cold Email com IA: A Engenharia de Prospecção que Realmente Funciona",
    slug: "engenharia-de-prospeccao-cold-email-b2b-ia",
    excerpt: "O Cold Email B2B clássico está morto pelas ferramentas de anti-spam. Descubra a estrutura operacional de Inteligência e Setup Multicanal Outbound focada em Account-Based.",
    content: coldEmailArticle,
    category: "Comercial", // Will trigger Revenue Score CTA automatically
    image: "",
    author_name: "Equipe RevHackers",
    author_role: "Growth Team",
    author_avatar: "",
    read_time: "5 min",
    featured: false,
    published: false,
    date: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString() // scheduled + 15 days
  },
  {
    title: "Tráfego Pago p/ Enterprise B2B: LinkedIn Ads e a Morte do Inbound Raso",
    slug: "trafego-pago-b2b-enterprise-inbound-marketing-roi",
    excerpt: "Como evitar o colapso de gerar MQLs lixos e usar Mídia estrutural (Ads + HubSpot CRM) de alto rendimento para Account-Based Marketing direcionado à cargos de C-Level Corporativos.",
    content: tráfegoArticle,
    category: "Mídia Paga", // Category has 'midia', triggering Marketing Score CTA
    image: "",
    author_name: "Equipe RevHackers",
    author_role: "Growth Team",
    author_avatar: "",
    read_time: "6 min",
    featured: false,
    published: false,
    date: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString() // scheduled + 25 days
  }
];

async function seedDrafts() {
  console.log("🌱 Iniciando o Seeder de Rascunhos B2B Pillars...");
  
  for (const post of drafts) {
    // Check if it already exists to avoid dupes
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', post.slug)
      .single();
      
    if (existing) {
      console.log("⚠️ O artigo já existe: " + post.slug + ". Ignorando...");
      continue;
    }
    
    // Insert
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post]);
      
    if (error) {
      console.error("❌ Erro ao injetar '" + post.title + "':", error.message);
    } else {
      console.log("✅ Rascunho agendado com sucesso: '" + post.title + "' - Status: NÃO PUBLICADO (Draft)");
    }
  }
  
  console.log("🏁 Operação Concluída com Sucesso.");
  process.exit(0);
}

seedDrafts();
