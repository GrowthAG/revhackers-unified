-- Add or Update Placlux Case Study
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cases WHERE client_name = 'Placlux') THEN
        UPDATE cases
        SET 
            client_name = 'Placlux',
            slug = 'placlux',
            logo_url = 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png',
            case_category = 'Mídia Paga & CRM',
            description = 'Estratégia de mídia paga com automações e funil de vendas, gerando aumento de 25% nos leads.',
            challenge = 'Necessidade de otimizar o funil de vendas e aumentar a captação de leads qualificados.',
            solution = 'Implementação de CRM, automações de vendas e gestão de tráfego pago (Google/Meta Ads) focada em conversão.',
            results = 'Aumento de 25% no volume de leads em apenas 3 meses.',
            primary_metric = '+25%',
            secondary_metrics = '{"Prazo": "3 Meses", "Label": "Aumento de Leads"}',
            updated_at = NOW()
        WHERE client_name = 'Placlux';
    ELSE
        INSERT INTO cases (
            client_name,
            slug,
            case_category,
            primary_metric,
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
            'Placlux',
            'placlux',
            'Mídia Paga & CRM',
            '+25%',
            '{"Prazo": "3 Meses", "Label": "Aumento de Leads"}',
            'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png',
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop', -- Construction/Business generic
            'Estratégia de mídia paga com automações e funil de vendas, gerando aumento de 25% nos leads.',
            'Necessidade de otimizar o funil de vendas e aumentar a captação de leads qualificados.',
            'Implementação de CRM, automações de vendas e gestão de tráfego pago (Google/Meta Ads) focada em conversão.',
            'Aumento de 25% no volume de leads em apenas 3 meses.',
            true,
            NOW()
        );
    END IF;
END $$;
