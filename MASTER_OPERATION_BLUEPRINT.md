# 🦅 RevHackers Growth Hub: Master Operation Blueprint

Este documento consolida toda a arquitetura técnica, diagnósticos de auditoria e diretrizes estratégicas resultantes do **Tech Lead Audit 2026**. Ele serve como o guia definitivo para o Go-Live e manutenção da plataforma.

---

## 🛠️ 1. Infraestrutura & Deployment

### Configuração de Ambiente
O arquivo `ENVIRONMENT_TEMPLATE.md` contém as chaves obrigatórias.

| Variável | Função |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Backend, Auth e Realtime |
| `PERPLEXITY_API_KEY` | Motor de Inteligência de Mercado |
| `VITE_PSI_API_KEY` | Auditoria Técnica de Sites (PSI) |
| `VITE_WEBHOOK_URL` | Destino único de Leads (HighLevel) |

### Camada de Dados (Supabase)
- **RPCs Seguros:** A função `create_diagnostic_entry` foi validada com `SECURITY DEFINER` para permitir submissões públicas sem comprometer as RLS de leitura.
- **Edge Functions:** O processamento de documentos (RAG) e a integração com Perplexity ocorrem em ambiente serverless seguro.

---

## 🧠 2. Inteligência Estratégica

### Market Intelligence Engine
A plataforma agora utiliza o **Perplexity API** via `MarketIntelligenceService.ts` para enriquecer planos de ação com:
1.  **TAM / SAM / SOM:** Estimativas reais de mercado.
2.  **Tendências:** Dados macro do setor do cliente.
3.  **Benchmarks:** Identificação de concorrentes e padrões táticos.

### Gerador de Planos (REI System)
O `StrategicPlanGenerator.tsx` foi corrigido para:
- Consolidar respostas do Protocolo REI.
- Injetar o contexto de mercado via AI.
- **Renderização de Inteligência:** O `DiagnosticSection.tsx` agora exibe o **Reflexo do Contexto (REI Input)**, **Sinais Estratégicos**, **Matriz de Riscos** e **Decisões Mandatórias** (Lógica de Decisão), garantindo que o cliente veja exatamente como suas respostas moldaram a estratégia.
- Gerar visualizações de cronograma (`GrowthCronograma`) e projeções financeiras.

---

## 📈 3. Arquitetura de Conversão (Rule of 4)

Para manter a integridade do tracking e evitar "vazamento" de leads, a plataforma opera estritamente com 4 fluxos:

1.  **Contact Flow:** Lead direto via `shared/ContactForm.tsx`.
2.  **Rich Material:** Download de frameworks via `MaterialModal`.
3.  **High-Intent:** Agendamento via Calendly/Booking.
4.  **Low-Intent:** Newsletter simplificada no Footer.

> [!IMPORTANT]
> O componente redundante em `shared/contact-form/` foi desativado. Use sempre o componente central em `shared/ContactForm.tsx`.

---

## 📁 4. Padronização de Conteúdo

### Cases de Sucesso (Surgical Standard)
Todos os cases em `src/data/cases/` seguem o padrão V2:
- **Métricas:** Devem ter `label` e `value` (ex: +300% de ROAS).
- **Tech Stack:** Lista explícita de tecnologias usadas no projeto.
- **Preview:** Texto otimizado para a listagem principal de cases.

### Blog & SEO
- **Aesthetic:** Apple Ultraminimalist (White on Black for Hero, Black on White for Content).
- **Title Tags:** Corrigidas em toda a aplicação via `SEOProvider` para garantir indexação correta.

---

## ✅ 5. Checklist Final Go-Live

1. [ ] Provisionar chaves de API no ambiente de produção (Vercel/Netlify/Vps).
2. [ ] Validar conexão do Webhook principal para recebimento de Leads.
3. [ ] Executar o script `/generate_all_blog_images` para uniformizar os assets visuais.
4. [ ] Verificar se o `NODE_ENV` está setado para `production` para habilitar otimizações de bundle.

---

**Documento Finalizado por Antigravity // Tech Lead Audit.**
