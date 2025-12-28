-- Add Idee Seguros Case Study
INSERT INTO cases (
    client_name,
    slug,
    case_category,
    primary_metric,
    primary_metric_label,
    secondary_metrics,
    logo_url,
    hero_image_url,
    description,
    challenge,
    solution,
    results,
    published,
    created_at
) VALUES (
    'Idee Seguros',
    'idee-seguros',
    'Geração de Demanda',
    '+230%',
    'Leads Qualificados',
    '{"ROI": "8.5x", "CAC": "-40%"}',
    'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c73dcdda192452a508485.png',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop', -- Generic business/insurance image filler
    'Como a Idee Seguros triplicou sua captação de leads e otimizou seu processo comercial com Mídia Paga e CRM.',
    'A Idee Seguros possuía um processo comercial muito dependente de indicações e networking, sem um canal previsível de aquisição. O time comercial perdia muito tempo com leads desqualificados e tarefas manuais no CRM.',
    'Implementamos uma estrutura robusta de tráfego pago (Google Ads focado em intenção de compra e Meta Ads para remarketing), integrada nativamente ao CRM. Criamos automações para distribuição de leads e nutrução automática, garantindo que o time comercial falasse apenas com oportunidades reais.',
    'Em 4 meses, o volume de leads qualificados aumentou 230%, o Custo por Aquisição (CAC) caiu 40% devido à melhor segmentação, e a eficiência do time comercial dobrou com o uso do CRM automatizado.',
    true,
    NOW()
);

-- Update TikPag Case Logo
UPDATE cases
SET logo_url = 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c745adda192dc1f508a8f.webp'
WHERE client_name ILIKE '%TikPag%';
