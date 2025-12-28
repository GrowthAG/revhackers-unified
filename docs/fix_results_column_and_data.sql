-- 1. CORREÇÃO DE TIPOS E COLUNAS
DO $$
BEGIN
    -- Se 'results' for JSON, converte para TEXTO
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'results' AND data_type IN ('json', 'jsonb')) THEN
         ALTER TABLE cases ALTER COLUMN results TYPE TEXT USING results::text;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'results') THEN
         ALTER TABLE cases ADD COLUMN results TEXT;
    END IF;

    -- Garante outras colunas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'metrics') THEN ALTER TABLE cases ADD COLUMN metrics JSONB; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'challenge') THEN ALTER TABLE cases ADD COLUMN challenge TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'solution') THEN ALTER TABLE cases ADD COLUMN solution TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'image_url') THEN ALTER TABLE cases ADD COLUMN image_url TEXT; END IF;
END $$;

-- 2. INSERIR DADOS (BLDN & PLACLUX)
DO $$
BEGIN
    -- Atualiza BLDN se existir (via Bolt ou BLDN)
    UPDATE cases SET 
        title = 'BLDN: Escala com Automação e Mídia Paga',
        client_name = 'BLDN', slug = 'bldn', client_logo = 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg',
        results = 'Estrutura comercial automatizada e previsível.', 
        primary_metric = '+ROI', 
        case_category = 'Mídia Paga & CRM',
        preview_description = 'Gerenciamento de Mídia Paga e Implementação de CRM e Automações.',
        challenge = 'Necessidade de estruturar o comercial e escalar aquisição via canais pagos.',
        solution = 'Implementação completa de CRM com automações de vendas e gestão de campanhas de alta performance.',
        metrics = '[{"value": "100%", "label": "Processos"}, {"value": "+Eficiência", "label": "Vendas"}]',
        updated_at = NOW()
    WHERE client_name = 'Bolt' OR client_name = 'BLDN';

    -- Se não atualizou nada (não existia), INSERE
    IF NOT FOUND THEN
        INSERT INTO cases (title, client_name, slug, case_category, primary_metric, metrics, client_logo, image_url, preview_description, challenge, solution, results, published)
        VALUES ('BLDN: Escala com Automação', 'BLDN', 'bldn', 'Mídia Paga & CRM', '+ROI', 
        '[{"value": "100%", "label": "Processos"}, {"value": "+Eficiência", "label": "Vendas"}]', 
        'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c77062fe4f1854fadf797.svg', 
        'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop', 
        'Gerenciamento de Mídia Paga e CRM.', 'Estruturar comercial.', 'CRM e Ads.', 'Previsibilidade.', true)
        ON CONFLICT (slug) DO NOTHING;
    END IF;

    -- PLACLUX
    INSERT INTO cases (title, client_name, slug, case_category, primary_metric, metrics, client_logo, image_url, preview_description, challenge, solution, results, published)
    VALUES ('Placlux: +25% Leads em 3 Meses', 'Placlux', 'placlux', 'Mídia Paga & CRM', '+25%', 
    '[{"value": "3 Meses", "label": "Prazo"}, {"value": "+25%", "label": "Leads"}]', 
    'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/694c76cfe889d38ced51667d.png', 
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop', 
    'Aumento de 25% nos leads em 3 meses.', 'Otimizar funil.', 'CRM e Ads convertendo.', '25% mais leads.', true)
    ON CONFLICT (slug) DO UPDATE SET 
        title = EXCLUDED.title,
        results = EXCLUDED.results, 
        metrics = EXCLUDED.metrics,
        client_logo = EXCLUDED.client_logo;
END $$;
