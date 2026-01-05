-- Seeding the default agent to ensure RAG and Chat works immediately
INSERT INTO public.agents (id, name, role, model, system_prompt)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'RevAssistant',
    'Assistente Geral',
    'claude-3-5-sonnet',
    'Você é um assistente útil e inteligente da RevHackers.'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    model = EXCLUDED.model,
    system_prompt = EXCLUDED.system_prompt;
