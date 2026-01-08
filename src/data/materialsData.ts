export interface Material {
    id: string;
    title: string;
    slug: string;
    type: string; // Display type (e.g. 'Playbook')
    material_type: string; // DB/Internal type
    category: string;
    description: string;
    cover_image: string;
    material_url: string; // URL logic (internal slug ref or direct link)
    link_material: string; // Download link (ClickUp/PDF)
    published: boolean;
    is_active: boolean;
    icon?: string; // Optional icon override
}

export const materialsData: Material[] = [
    {
        id: 'framework-ia-meta-ads',
        title: 'Framework Completo: Agente de IA para Meta Ads',
        slug: 'framework-ia-meta-ads',
        type: 'Framework',
        material_type: 'framework',
        category: 'Automação',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_marketing_automation.png',
        material_url: '/materiais/framework-ia-meta-ads',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-77477/31372c5d222fba9',
        published: true,
        is_active: true
    },
    {
        id: 'plano-acao-90-dias',
        title: 'Plano de Ação 90 Dias',
        slug: 'plano-acao-90-dias',
        type: 'Template',
        material_type: 'template',
        category: 'Gestão',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_strategy_playbooks.png',
        material_url: '/materiais/plano-acao-90-dias',
        link_material: 'https://lp.revhackers.com.br/post/plano-acao-90-dias',
        published: true,
        is_active: true
    },
    {
        id: 'guia-agent-builder',
        title: 'Guia Definitivo Agent Builder da OpenAI',
        slug: 'guia-agent-builder',
        type: 'Guia',
        material_type: 'guide',
        category: 'Automação',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_growth_chatgpt.png',
        material_url: '/materiais/guia-agent-builder',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-77057/23e08419c8226b5',
        published: true,
        is_active: true
    },
    {
        id: 'crm-estrategico',
        title: 'Guia Completo: CRM Estratégico que Realmente Converte',
        slug: 'crm-estrategico',
        type: 'Guia',
        material_type: 'guide',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_sales_commission.png',
        material_url: '/materiais/crm-estrategico',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-75537/dcc3fba9d7b5449',
        published: true,
        is_active: true
    },
    {
        id: 'transforme-linkedin',
        title: 'Transforme Seu LinkedIn em uma Máquina de Reuniões',
        slug: 'transforme-linkedin',
        type: 'Guia',
        material_type: 'guide',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_sales_nav.png',
        material_url: '/materiais/transforme-linkedin',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-75797/4481633190ac7d5',
        published: true,
        is_active: true
    },
    {
        id: 'guia-gtm',
        title: 'Guia Prático de Estratégia Go-To-Market (GTM)',
        slug: 'guia-gtm',
        type: 'Guia',
        material_type: 'guide',
        category: 'Estratégia',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_gtm_strategy.png',
        material_url: '/materiais/guia-gtm',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-75377/8058bda68fdda75',
        published: true,
        is_active: true
    },
    {
        id: 'linkedin-outreach',
        title: 'LinkedIn Outreach Revolution',
        slug: 'linkedin-outreach',
        type: 'Guia',
        material_type: 'guide',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_polemic_growth.png',
        material_url: '/materiais/linkedin-outreach',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-74457/864a540dc185f92',
        published: true,
        is_active: true
    },
    {
        id: 'timing-sales-playbook',
        title: 'Timing Sales Playbook',
        slug: 'timing-sales-playbook',
        type: 'Playbook',
        material_type: 'playbook',
        category: 'Vendas',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_demo_anatomy.png',
        material_url: '/materiais/timing-sales-playbook',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-74377/ac670d7da5d9815',
        published: true,
        is_active: true
    },
    {
        id: 'contato-decisores',
        title: 'Como Conseguir Telefone e E-mail de Qualquer Decisor',
        slug: 'contato-decisores',
        type: 'Guia',
        material_type: 'guide',
        category: 'Prospecção',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_cold_email_2025.png',
        material_url: '/materiais/contato-decisores',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-74037/4f52e2490ba6ea1',
        published: true,
        is_active: true
    },
    {
        id: 'framework-clickup',
        title: 'O Framework que nos Levou ao TOP 10 Mundial do ClickUp',
        slug: 'framework-clickup',
        type: 'Framework',
        material_type: 'framework',
        category: 'Operação',
        description: '<p>Material oficial. Conteúdo prático e validado para sua operação.</p>',
        cover_image: '/images/blog-v2/blog_pmf_fit.png',
        material_url: '/materiais/framework-clickup',
        link_material: 'https://doc.clickup.com/9017035197/p/h/8cqa2dx-73777/1cd15c7fdc86518',
        published: true,
        is_active: true
    }
];
