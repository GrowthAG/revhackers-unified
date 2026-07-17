---
description: RETIRADO — deploy Hostinger/FTP bloqueado durante a migração para GCP
---

# Workflow retirado

O deploy Hostinger/FTP foi desativado. Este arquivo permanece apenas como um
bloqueio explícito para agentes e referências históricas.

Regras:

- não carregar `.env`;
- não usar FTP, FTPS, `curl`, ZIP/PHP ou scripts legados;
- não publicar a partir deste repositório;
- não reativar este fluxo sem uma decisão arquitetural registrada;
- usar somente o futuro pipeline GCP, com identidade federada, artifact
  validado e rollback documentado.

Enquanto o pipeline GCP não existir, uma solicitação de deploy deve falhar de
forma segura e ser registrada como bloqueada.
