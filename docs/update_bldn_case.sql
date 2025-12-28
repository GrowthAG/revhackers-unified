-- Add or Update BLDN Case Study
-- First, try to update if 'Bolt' exists, otherwise insert new.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cases WHERE client_name = 'Bolt') THEN
        UPDATE cases
        SET 
            client_name = 'BLDN',
            slug = 'bldn',
            logo_url = 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg',
            case_category = 'Mídia Paga & CRM',
            description = 'Gerenciamento de Mídia Paga e Implementação de CRM e Automações.',
            challenge = 'Necessidade de estruturar o comercial e escalar aquisição via canais pagos.',
            solution = 'Implementação completa de CRM com automações de vendas e gestão de campanhas de alta performance.',
            results = 'Estrutura comercial automatizada e previsível.',
            updated_at = NOW()
        WHERE client_name = 'Bolt';
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
            'BLDN',
            'bldn',
            'Mídia Paga & CRM',
            '+ROI',
            '{"Processos": "100% Automatizados", "Label": "Eficiência em Vendas"}',
            'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg',
            'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop',
            'Gerenciamento de Mídia Paga e Implementação de CRM e Automações.',
            'Necessidade de estruturar o comercial e escalar aquisição via canais pagos.',
            'Implementação completa de CRM com automações de vendas e gestão de campanhas de alta performance.',
            'Estrutura comercial automatizada e previsível.',
            true,
            NOW()
        );
    END IF;
END $$;
