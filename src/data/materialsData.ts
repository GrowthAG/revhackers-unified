export interface Material {
    id: string;
    title: string;
    slug: string;
    type: string; // Display type (e.g. 'Playbook')
    material_type: string; // DB/Internal type
    category: string;
    description: string;
    cover_image: string;
    material_url: string; // URL logic
    link_material: string; // Download link
    published: boolean;
    is_active: boolean;
    icon?: string; // Optional icon override
}

export const materialsData: Material[] = [
    {
        id: 'playbook-b2b',
        title: 'Playbook de Vendas B2B',
        slug: 'playbook-b2b',
        type: 'Playbook',
        material_type: 'Material',
        category: 'Vendas',
        description: '<p>Guia completo para estruturar seu processo comercial, desde a prospecção até o fechamento. Inclui scripts, templates de email e cadências de follow-up.</p>',
        cover_image: '/images/blog-v2/blog_sales_commission.png',
        material_url: '/materiais/playbook-b2b',
        link_material: 'https://docs.google.com/document/d/12345/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'calculadora-ltv',
        title: 'Calculadora de LTV e CAC',
        slug: 'calculadora-ltv',
        type: 'Planilha',
        material_type: 'Material',
        category: 'Financeiro',
        description: '<p>Planilha interativa para calcular suas principais métricas de growth: LTV, CAC, ROI e Payback period. Essencial para planejamento financeiro SaaS.</p>',
        cover_image: '/images/blog-v2/blog_ltv_cac_balance.png',
        material_url: '/materiais/calculadora-ltv',
        link_material: 'https://docs.google.com/spreadsheets/d/12345/copy',
        published: true,
        is_active: true
    },
    {
        id: 'timing-sales-playbook',
        title: 'Timing Sales Playbook',
        slug: 'timing-sales-playbook',
        type: 'Playbook',
        material_type: 'Material',
        category: 'Vendas',
        description: '<p>Material oficial: Timing Sales Playbook. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_strategy_playbooks.png',
        material_url: '/materiais/timing-sales-playbook',
        link_material: 'https://docs.google.com/document/d/timing-sales/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'linkedin-outreach-revolution',
        title: 'LinkedIn Outreach Revolution',
        slug: 'linkedin-outreach-revolution',
        type: 'Geral',
        material_type: 'Material',
        category: 'Vendas',
        description: '<p>Material oficial: LinkedIn Outreach Revolution. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_sales_nav.png',
        material_url: '/materiais/linkedin-outreach-revolution',
        link_material: 'https://docs.google.com/document/d/linkedin-outreach/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'guia-gtm-estrategico',
        title: 'Guia Prático de Estratégia Go-To-Market (GTM)',
        slug: 'guia-gtm-estrategico',
        type: 'Geral',
        material_type: 'Material',
        category: 'Geral',
        description: '<p>Material oficial: O Framework que nos Levou ao TOP 1% Mundial do ClickUp. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_gtm_strategy.png',
        material_url: '/materiais/guia-gtm-estrategico',
        link_material: 'https://docs.google.com/document/d/gtm-guide/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'transforme-linkedin-negocios',
        title: 'Transforme Seu LinkedIn em uma Máquina de Negócios',
        slug: 'transforme-linkedin-negocios',
        type: 'Geral',
        material_type: 'Material',
        category: 'PLG',
        description: '<p>Material oficial: Guia Completo: CRM Estratégico que Realmente Converte. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_polemic_growth.png',
        material_url: '/materiais/transforme-linkedin-negocios',
        link_material: 'https://docs.google.com/document/d/linkedin-machine/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'como-conseguir-terceiro-timing',
        title: 'Como Conseguir Terceiro e Mais Timing',
        slug: 'como-conseguir-terceiro-timing',
        type: 'Geral',
        material_type: 'Material',
        category: 'Geral',
        description: '<p>Material oficial: Como Conseguir Terceiro e Mais Timing. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_efficient_funnel.png',
        material_url: '/materiais/como-conseguir-terceiro-timing',
        link_material: 'https://docs.google.com/document/d/timing-guide/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'automacoes-marketing',
        title: '7 automações de marketing que escalam sua operação',
        slug: 'automacoes-marketing',
        type: 'Geral',
        material_type: 'Material',
        category: 'Automação',
        description: '<p>Ferramentas e processos para aumentar a produtividade do seu time de marketing sem novas contratações.</p>',
        cover_image: '/images/blog-v2/blog_marketing_automation.png',
        material_url: '/materiais/automacoes-marketing',
        link_material: 'https://docs.google.com/document/d/automation/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'template-cold-email',
        title: 'Templates de Cold Email 2025',
        slug: 'template-cold-email',
        type: 'Template',
        material_type: 'Material',
        category: 'Vendas',
        description: '<p>As táticas de cold email que sobreviveram às mudanças de algoritmo, com templates testados em +10k envios.</p>',
        cover_image: '/images/blog-v2/blog_cold_email_2025.png',
        material_url: '/materiais/template-cold-email',
        link_material: 'https://docs.google.com/document/d/cold-email/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'guia-pmf',
        title: 'Product-Market Fit: Guia de Validação',
        slug: 'guia-pmf',
        type: 'Guia',
        material_type: 'Material',
        category: 'PLG',
        description: '<p>Como identificar se seu produto realmente resolve um problema real do mercado, com frameworks práticos de validação.</p>',
        cover_image: '/images/blog-v2/blog_pmf_fit.png',
        material_url: '/materiais/guia-pmf',
        link_material: 'https://docs.google.com/document/d/pmf-guide/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'chatgpt-prompts-growth',
        title: 'ChatGPT para Growth: 15 prompts essenciais',
        slug: 'chatgpt-prompts-growth',
        type: 'Template',
        material_type: 'Material',
        category: 'Automação',
        description: '<p>Descubra os prompts específicos que transformam o ChatGPT em seu assistente de marketing mais poderoso.</p>',
        cover_image: '/images/blog-v2/blog_growth_chatgpt.png',
        material_url: '/materiais/chatgpt-prompts-growth',
        link_material: 'https://docs.google.com/document/d/chatgpt-prompts/export?format=pdf',
        published: true,
        is_active: true
    },
    {
        id: 'framework-demo-perfeita',
        title: 'Framework da Demo Perfeita',
        slug: 'framework-demo-perfeita',
        type: 'Framework',
        material_type: 'Material',
        category: 'Vendas',
        description: '<p>Roteiro de 4 atos para converter features em contratos. Pare de fazer tour de produto e comece a vender soluções.</p>',
        cover_image: '/images/blog-v2/blog_demo_anatomy.png',
        material_url: '/materiais/framework-demo-perfeita',
        link_material: 'https://docs.google.com/document/d/demo-framework/export?format=pdf',
        published: true,
        is_active: true
    }
];
