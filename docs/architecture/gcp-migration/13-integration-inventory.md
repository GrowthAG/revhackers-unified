# Inventário de integrações — RevHackers e benchmark GrowthHub

Atualizado em 2026-07-20. Este documento separa integrações de negócio de
recursos auxiliares. “Fica” significa que existe requisito atual; não significa
que a implementação atual esteja pronta para o Google Cloud.

## Decisão inicial

| Integração | Evidência no código | Decisão | Próxima ação |
|---|---|---|---|
| Supabase Database/Auth/Storage/Edge Functions | Cliente frontend, 39 functions, migrations e buckets | **Fica temporariamente; sai no cutover** | Migrar por domínio e só desligar após paridade/rollback |
| Google Workspace: Meet, Calendar, Drive | `google-meetings`, `client_meetings`, `meeting_recordings`, APIs Calendar/Drive/Meet | **Fica e vira fonte oficial** | Remover dependência de Fathom; proteger Drive e modelar ingestão |
| Gemini no Meet/Workspace | Objetivo de produto; não há conector Gemini nativo confirmado no código | **Fica como capacidade desejada** | Confirmar licença/artefatos disponíveis e integrar apenas APIs oficiais |
| Anthropic Claude | `generate-strategic-plan` e fallback de IA | **Fica** | Roteador por custo, orçamento, logs e secrets no GCP |
| OpenAI | Chat, embeddings, imagens, Whisper, análise de reuniões | **Fica** | Separar usos, quota, custo, PII e decidir o fallback de transcrição |
| GoHighLevel/Funnels | `ghl-*`, webhooks, OAuth, pipelines, oportunidades e write-back | **Fica** | Sandbox, OAuth seguro, idempotência e multi-tenant |
| ClickUp | `clickup-*`, NoteTaker, Docs, tarefas, listas, webhooks | **Saiu** | Callers, functions e configuração removidos; tabelas e históricos permanecem até o gestor próprio substituir os dados |
| InfinitePay | Checkout e webhook de pagamento | **Saiu** | Funções, configuração e chamadas do frontend removidas; dados históricos de propostas permanecem até limpeza aprovada |
| Google CNPJ/BrasilAPI | `fetch-cnpj`, `auto-enrich-project` | **Fica como enriquecimento auxiliar** | Cache, rate limit e fallback; não bloquear fluxo principal |
| Google PageSpeed/Chrome UX Report | `analyze-site`, `crux-benchmark`, enriquecimento | **Fica como enriquecimento auxiliar** | Quota, validação de URL e execução assíncrona quando necessário |
| Google Maps/Places | Script/API de endereço/localização | **Fica somente se telas atuais usarem** | Confirmar caller e chave restrita; retirar se órfã |
| WordPress REST / materiais | Busca de posts em `materiais.revhackers.com.br` | **Fica enquanto o blog usar WordPress** | Definir CMS canônico no GCP; cache e timeout |
| Cal.com / widgets LeadConnector | Links e embeds de agenda/formulários | **Fica como aquisição** | Catalogar calendários reais; decidir se booking migra para Google Calendar/GHL |
| YouTube | Busca de vídeos/conteúdo | **Revisar** | Confirmar caller; retirar se não houver tela/fluxo ativo |
| Miro / Whimsical / embeds externos | URLs/embeds em conteúdo | **Revisar por caller** | Não criar integração backend; manter apenas links autorizados |
| QR Server, ipify, CDNs, Unsplash, avatars | Recursos auxiliares de frontend | **Não são integrações de negócio** | Manter apenas onde necessário; remover chamadas desnecessárias em CSP hardening |
| Fathom | `fathom-webhook` legado e `fathom_meeting_id` histórico | **Sai** | Não implantar; reconciliar/desativar endpoint remoto e manter coluna até limpeza aprovada |

## Fluxo de reuniões aprovado

1. Google Meet produz a gravação/transcrição/notas conforme a licença do
   Workspace.
2. Google Drive/Meet API fornece o artefato autorizado ao backend.
3. O sistema RevHackers associa a reunião ao tenant/projeto e grava apenas os metadados
   necessários em `meeting_recordings`/`client_meetings`.
4. Gemini pode fornecer resumo/notas nativas; análise operacional adicional
   continua sendo uma etapa do produto, com provider e custo registrados.
5. Fallback por áudio/Whisper só será mantido para casos aprovados, não como
   caminho padrão.

## Critério para retirar qualquer integração

Antes de apagar uma integração, precisamos confirmar: callers no frontend,
functions, cron, webhooks e scripts; dados históricos; credenciais ativas;
impacto comercial; alternativa; e rollback. A ausência de busca textual isolada
não prova que uma integração está sem uso.

## Separação de produtos e gestor operacional

O GrowthHub é um benchmark/plataforma de pesquisa que ainda será implementado.
Ele não deve ser tratado como gestor de tarefas nem como substituto automático
do ClickUp. O gestor operacional próprio, caso seja aprovado, pertence ao
ecossistema RevHackers e deve consolidar projetos, sprints, tarefas,
responsáveis, dependências, comentários, logs e automações.

A migração desse gestor deve começar pelo contrato interno de tarefas e pelo
tenant, não pela cópia das tabelas ClickUp.

Até esse gestor existir:

- não apagar tabelas ou colunas ClickUp do Supabase;
- não remover históricos ou links de materiais;
- não disparar novos provisionamentos automáticos;
- mapear os fluxos atuais para o modelo interno antes de desligar os callers.
