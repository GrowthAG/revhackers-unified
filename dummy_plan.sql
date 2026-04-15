UPDATE public.strategic_plans
SET roadmap_data = '{
    "roadmap_phases": [
      {
        "name": "Sprint 1: Setup da Operação e Diagnóstico Base",
        "duration_weeks": 2,
        "items": [
          "Implementar Tracking Principal (GTM, Meta Pixel e Google Analytics 4 instalados)",
          "Configuração Inicial do CRM (Campos customizados de MRR, TCV e Tipo de Projeto no Funnels)",
          "Reunião de Kick-Off Executivo (Apresentação do Roadmap e Setup da Squad)"
        ]
      },
      {
        "name": "Sprint 2: Integração Growth Hub e Automações",
        "duration_weeks": 2,
        "items": [
          "Deploy do Webhook Funnels (Handoff perfeito e roteamento de lead inteligente para a base de dados central)",
          "Setup do ClickUp Orchestrator (Automação final via API - Subir infraestrutura SaaS no painel)",
          "Testes E2E (End-to-End) (Arraste de lead teste para Validar funil de vendas vs pipelines)"
        ]
      },
      {
        "name": "Sprint 3: Otimização Financeira C-Level",
        "duration_weeks": 2,
        "items": [
          "Dashboards Executivos GHL (Gráficos de Caixa Mensal MRR vs Receita Contratada TCV)",
          "Métricas de Concentração (Fechamento de pipeline em Gráfico de Pizza por serviço vendido)",
          "R.A.P.T - Relato 30 dias (Reunião de acompanhamento mensal baseada nos resultados)"
        ]
      }
    ]
  }'::jsonb
WHERE id = '7e9476ee-e37d-432c-9a5e-f48e1145f992';
