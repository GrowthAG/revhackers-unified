-- Update Funnels settings
UPDATE organizations
SET settings = jsonb_set(
  jsonb_set(
    settings,
    '{ghl_opp_custom_fields}',
    (settings->'ghl_opp_custom_fields') || jsonb_build_object(
      'clickup_workspace', '0gJ96bwN7eZcrvJwcZv5',
      'clickup_docs', 'Z9FhcD0jUOIu45yn6ceP'
    )
  ),
  '{ghl_pipelines}',
  jsonb_build_object(
    'sales_led', 'NbgGot6qGPdQIxmvDEgo',
    'plg', 'b6L19WdZw6kDkathDU2j',
    'cs_journey', 'CHb1xb6yXG3NXjwyOjnv',
    'cs_journey_stages', jsonb_build_object(
      'onboarding', 'c274cfc9-cd9b-4eb7-9d87-ee3e36972c88',
      'active',     '92aa9fae-602f-4065-a8f6-bf442f15efef',
      'risk',       '302ae5b0-3f26-4f19-9009-3574b5d92cb1',
      'expansion',  'b3085774-ce7e-42e4-9aa6-440e12e53f00'
    )
  )
)
WHERE slug = 'growth-funnels';


-- Update RevHackers settings
UPDATE organizations
SET settings = jsonb_set(
  settings,
  '{ghl_opp_custom_fields}',
  (settings->'ghl_opp_custom_fields') || jsonb_build_object(
    'hub_project_id',    'oZv5ftBubon8Nmn6fWQr',
    'clickup_workspace', 'bbPwQqCUNwUhoWnHSZ7D',
    'clickup_docs',      'Ypygilknnq5PGuZeuKul'
  )
)
WHERE slug = 'revhackers';
