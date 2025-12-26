-- 1. Fix Schema: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add 'challenge'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'challenge') THEN
        ALTER TABLE cases ADD COLUMN challenge TEXT;
    END IF;

    -- Add 'solution'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'solution') THEN
        ALTER TABLE cases ADD COLUMN solution TEXT;
    END IF;

    -- Add 'results'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'results') THEN
        ALTER TABLE cases ADD COLUMN results TEXT;
    END IF;

    -- Add 'metrics' (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'metrics') THEN
        ALTER TABLE cases ADD COLUMN metrics JSONB;
    END IF;

    -- Add 'image_url'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'image_url') THEN
        ALTER TABLE cases ADD COLUMN image_url TEXT;
    END IF;

    -- Add 'testimonial_avatar'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'testimonial_avatar') THEN
        ALTER TABLE cases ADD COLUMN testimonial_avatar TEXT;
    END IF;
END $$;

-- 2. Add/Update 'BLDN' Case
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cases WHERE client_name = 'Bolt') THEN
        UPDATE cases
        SET 
            client_name = 'BLDN',
            slug = 'bldn',
            client_logo = 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg',
            case_category = 'Mídia Paga & CRM',
            description = 'Gerenciamento de Mídia Paga e Implementação de CRM e Automações.', -- Note: mapped to preview_description if description col doesn't exist, but types says description MIGHT be preview_description? types has preview_description. Let's assume description exists or update preview_description too.
            -- Actually types.ts has 'preview_description'. I should update that too.
            preview_description = 'Gerenciamento de Mídia Paga e Implementação de CRM e Automações.',
            challenge = 'Necessidade de estruturar o comercial e escalar aquisição via canais pagos.',
            solution = 'Implementação completa de CRM com automações de vendas e gestão de campanhas de alta performance.',
            results = 'Estrutura comercial automatizada e previsível.',
            primary_metric = '+ROI',
            metrics = '[{"value": "100%", "label": "Processos Automatizados"}, {"value": "+Eficiência", "label": "Vendas"}]',
            updated_at = NOW()
        WHERE client_name = 'Bolt';
    ELSIF EXISTS (SELECT 1 FROM cases WHERE client_name = 'BLDN') THEN
         UPDATE cases
        SET 
            client_logo = 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg',
            case_category = 'Mídia Paga & CRM',
             preview_description = 'Gerenciamento de Mídia Paga e Implementação de CRM e Automações.',
            challenge = 'Necessidade de estruturar o comercial e escalar aquisição via canais pagos.',
            solution = 'Implementação completa de CRM com automações de vendas e gestão de campanhas de alta performance.',
            results = 'Estrutura comercial automatizada e previsível.',
            primary_metric = '+ROI',
            metrics = '[{"value": "100%", "label": "Processos Automatizados"}, {"value": "+Eficiência", "label": "Vendas"}]',
            updated_at = NOW()
        WHERE client_name = 'BLDN';
    ELSE
        INSERT INTO cases (
            client_name, slug, case_category, primary_metric, metrics, client_logo, image_url, preview_description, challenge, solution, results, published
        ) VALUES (
            'BLDN', 'bldn', 'Mídia Paga & CRM', '+ROI', 
            '[{"value": "100%", "label": "Processos Automatizados"}, {"value": "+Eficiência", "label": "Vendas"}]',
            'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg',
            'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop',
            'Gerenciamento de Mídia Paga e Implementação de CRM e Automações.',
            'Necessidade de estruturar o comercial e escalar aquisição via canais pagos.',
            'Implementação completa de CRM com automações de vendas e gestão de campanhas de alta performance.',
            'Estrutura comercial automatizada e previsível.',
            true
        );
    END IF;
END $$;

-- 3. Add/Update 'Placlux' Case
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cases WHERE client_name = 'Placlux') THEN
        UPDATE cases
        SET 
            client_name = 'Placlux',
            slug = 'placlux',
            client_logo = 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png',
            case_category = 'Mídia Paga & CRM',
            preview_description = 'Estratégia de mídia paga com automações e funil de vendas, gerando aumento de 25% nos leads.',
            challenge = 'Necessidade de otimizar o funil de vendas e aumentar a captação de leads qualificados.',
            solution = 'Implementação de CRM, automações de vendas e gestão de tráfego pago (Google/Meta Ads) focada em conversão.',
            results = 'Aumento de 25% no volume de leads em apenas 3 meses.',
            primary_metric = '+25%',
            metrics = '[{"value": "3 Meses", "label": "Prazo"}, {"value": "+25%", "label": "Leads"}]',
            updated_at = NOW()
        WHERE client_name = 'Placlux';
    ELSE
        INSERT INTO cases (
            client_name, slug, case_category, primary_metric, metrics, client_logo, image_url, preview_description, challenge, solution, results, published
        ) VALUES (
            'Placlux', 'placlux', 'Mídia Paga & CRM', '+25%', 
            '[{"value": "3 Meses", "label": "Prazo"}, {"value": "+25%", "label": "Leads"}]',
            'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png', 
            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop',
            'Estratégia de mídia paga com automações e funil de vendas, gerando aumento de 25% nos leads.', 
            'Necessidade de otimizar o funil de vendas e aumentar a captação de leads qualificados.',
            'Implementação de CRM, automações de vendas e gestão de tráfego pago (Google/Meta Ads) focada em conversão.',
            'Aumento de 25% no volume de leads em apenas 3 meses.',
            true
        );
    END IF;
END $$;
