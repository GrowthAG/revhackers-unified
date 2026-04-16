-- Atualizar a organizacao Funnels para usar o pipeline certo ("Customer Success")
UPDATE organizations
SET settings = jsonb_set(
  jsonb_set(
    settings,
    '{ghl_pipelines, cs_journey_pipeline}',
    '"fEtcM4nJdHieyXCzi33P"'
  ),
  '{ghl_pipelines, cs_journey_stages}',
  '{
    "kickoff": "a87f342b-0f22-4a12-aff7-af505cc0d5dd",
    "onboarding": "0e358955-b156-44c1-9dba-d0244c7e7a5e",
    "adocao": "72324fc7-a2cc-4740-91f5-4435f62ea845",
    "engajamento": "d81d22ff-59ed-44a5-98b8-562e2545211a",
    "risco": "3a51c2cf-d993-43fd-9f62-b849b35e0b74",
    "renovacao": "ae4943a1-b3ab-4a7c-96b4-f9033adb371d",
    "expansao": "32a85305-d396-4d03-a229-beab17919306",
    "churn": "05ee1153-d2b9-4c36-91cd-d411e42128bd"
  }'::jsonb
)
WHERE slug = 'growth-funnels';
