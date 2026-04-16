-- Atualizar settings da organização RevHackers com dados auditados da API GHL
-- Auditado em 15/04/2026 via PIT: pit-fd85c64a-5945-4b81-ab47-5654683197d4
-- Location ID: oFTw9DcsKRUj6xCiq4mb
-- 75 custom fields de contato, 8 custom fields de opportunity
-- 1 pipeline: Pipeline de Vendas (MlfAFPgPJ2JsTImVJ33B)

UPDATE organizations
SET settings = jsonb_build_object(
  'ghl_location_id', 'oFTw9DcsKRUj6xCiq4mb',
  'ghl_webhooks', '{}'::jsonb,
  'ghl_pipelines', jsonb_build_object(
    'vendas', 'MlfAFPgPJ2JsTImVJ33B'
  ),
  'ghl_opp_custom_fields', jsonb_build_object(
    'mrr',                'SLNVPTeKbwQmTK2nLhOY',
    'durao_meses',        '2G4di6h3xv8SnYhepnIv',
    'potencial_receita',  'oaTFAIMZzgQRpI0dF4RF',
    'faturamento_atual',  'r39cVhm2gdS3r712BY7n',
    'proximo_passo',      'OOCmYeHtgx9d4vIak1Lc',
    'origem',             'RWtRx46o0D9HzYUEkYBf',
    'data_ultimo_contato','fg05xaTcVz6Y1WU23GCF',
    'como_ajudar',        'iIm0fYcptgBIQruEK674',
    'hub_project_id',     'oZv5ftBubon8Nmn6fWQr',
    'clickup_workspace',  'bbPwQqCUNwUhoWnHSZ7D',
    'clickup_docs',       'Ypygilknnq5PGuZeuKul'
  )
)
WHERE slug = 'revhackers';
