-- Seed: Registrar subconta Funnels (Growth Funnels) como organização
-- Location ID confirmado via API GHL em 15/04/2026
-- Chave PIT: pit-98ee5816-af06-49ba-8e1f-02da102bec94
-- 62 custom fields de contato, 14 custom fields de opportunity (11 existentes + 3 novos)
-- 3 pipelines: CS (Jornada do Cliente), Sales-Led Growth, PLG

INSERT INTO organizations (
  slug,
  name,
  is_master,
  parent_id,
  status,
  plan,
  billing_status,
  settings
) VALUES (
  'growth-funnels',
  'Growth Funnels',
  false,
  '53d6a3dc-2783-4276-994a-01749f15eb43',  -- parent = RevHackers master
  'active',
  'scale',
  'paid',
  jsonb_build_object(
    'ghl_location_id', 'S7HEFAz97UKuC8NLHMmI',
    'ghl_webhooks', '{}'::jsonb,
    'ghl_pipelines', jsonb_build_object(
      'sales_led', 'NbgGot6qGPdQIxmvDEgo',
      'plg', 'b6L19WdZw6kDkathDU2j',
      'cs_journey', 'gpV3bJxWJz1dPlPBVGrD'
    ),
    'ghl_opp_custom_fields', jsonb_build_object(
      -- Campos novos (criados via API 15/04/2026)
      'mrr',                       'sfoqdLRZqLWvE8fLmVPJ',
      'contract_duration_months',  'iuuumGsW7LqLotA5rALE',
      'hub_project_id',            'CMcraKg2YezLWNJJ6M0y',
      -- Campos existentes
      'data_inicio_contrato',      'bY1bxgElioieDZlds7fu',
      'data_renovacao',            'lfr3qQ5GIyHY6OTPn0mB',
      'nps',                       'QI3h58MQ9j9fxQQ46p8L',
      'health_score',              'k8xdS2RGOz7QPsC7UB75',
      'motivo_churn',              'j45aEZEVBpXeP4TjEIrS',
      'plano_tier',                'mCyqB1kpWhOV2pRzSrn9',
      'link_proposta',             '9HD81061fWw0CSbjAaIw',
      'responsavel_cs',            'DRHynmGypWxhaB4p4JKR',
      'cnpj_opp',                  'trYuqnDVXzJ1mIKtkek2',
      'problema',                  'pzfVIYzTUUS5stcguHzx',
      'desafio_principal',         'mA924mqvSatrQJ2OR9vE'
    )
  )
)
ON CONFLICT (slug) DO UPDATE SET
  settings = EXCLUDED.settings,
  status = 'active';
