-- Atualizar a organizacao RevHackers para usar o novo pipeline Customer Success
UPDATE organizations
SET settings = jsonb_set(
  jsonb_set(
    settings,
    '{ghl_pipelines, cs_journey_pipeline}',
    '"5jHtzd1PqYuPVLjYLCxn"'
  ),
  '{ghl_pipelines, cs_journey_stages}',
  '{
    "kickoff": "4035a46b-7ebf-4ff1-9530-79ad650b080a",
    "onboarding": "b0b566c9-7f1d-4e6e-a879-c0174ae6bdfc",
    "adocao": "54a240ea-496c-46e7-8b2a-ff6517aa04f0",
    "engajamento": "bcf02ccc-0a14-407a-8ea1-e66557b90b93",
    "risco": "00c4e5ef-a8bf-43db-a292-abaddd003848",
    "renovacao": "6c65322a-f834-4b6e-85ba-19e159fa6374",
    "expansao": "3b40e9f4-4d5f-4d07-a103-3bcbdff0669c",
    "churn": "ad24ebfb-de64-4ebe-8cdf-4e7b604595b7"
  }'::jsonb
)
WHERE slug = 'revhackers';
