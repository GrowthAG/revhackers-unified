# Plano de hoje — colocar o RevHackers no ar (2026-07-22)

> Objetivo do dia: publicar o que já está construído, com segurança, no caminho
> mais rápido — sem esperar a migração GCP (que é semanas e está bloqueada em
> decisões). Estratégia: **Supabase continua sendo o backend; publicamos o
> frontend num host estático e aplicamos as migrations/functions pendentes.**

---

## 1. Mapa da realidade (verificado no código, não em memória)

### ✅ Feito e validado localmente
- **GrowthMap** completo: 15 frameworks, edge function, tabela, rota `/growthmap/:projectId`, REI ligado (dados reais alimentam a geração). tsc limpo, 41/41 testes.
- **Segurança P0-02 / P0-03** implementadas e **aplicadas em produção** (checkpoint 2026-07-18).
- **Deep-review** (2 batches): S-04..S-11, A-01/A-02, M-01/M-02, P-01/P-02 corrigidos e commitados.
- **Frente 2 IA:** R1 (log de uso) + R2 (orçamento por provider) prontos.
- **Build de produção OK:** `vite build` passa, artefato valida (456 arquivos, hash conferido), varredura de segredos limpa nos 10 commits.

### ⚠️ Feito no código, MAS não está em produção
- Migrations `20260722000000_growthmap_results` e `20260722000001_ai_budget_config` — **não aplicadas** (sem elas, GrowthMap quebra ao salvar).
- Edge function `generate-growthmap` — **não deployada**.
- **10 commits locais** não enviados (`git push` pendente).
- Migrations de segurança `20260721000000/1/2` — **confirmar** se já foram aplicadas (commit "apply migrations to production" sugere que sim, mas precisa verificação remota).

### ❌ Dito que faríamos e ainda NÃO fizemos
- **Migração GCP (Frente 1):** E0–E12 quase toda pendente. **Decisão consciente:** não é o caminho pra "no ar hoje". Fica como trilha longa.
- **Frente 2 IA:** R3 (roteador por custo), R4 (migrar callers), R6 (dashboard) pendentes. R5 (política de degradação) bloqueada em você.
- **Segurança P1/P2:** P1-01 (isolamento por tenant), P1-02..P1-06, P2-01..P2-04 — pendentes.
- **P0-01:** rotacionar credencial JWT/bearer no histórico do git — **bloqueada em você** (ação externa).
- **Deploy pipeline:** o antigo (Hostinger/FTP) foi desligado; **não há host de publicação ativo hoje** → precisa decidir.

---

## 2. Estratégia (prazo + usabilidade + UX/UI)

**Princípio:** entregar valor visível hoje, sem retrabalho. Não abrir a frente GCP.

1. **Host estático rápido para o frontend.** Recomendação: **Vercel** — `@vercel/analytics` já está instalado, deploy em minutos, preview por PR, HTTPS/CDN automáticos, rollback trivial. Alternativas: Cloudflare Pages / Netlify. (Hostinger atual é FTP manual e foi desligado — não recomendo voltar.)
2. **Backend fica no Supabase** (já em produção). Só aplicamos as migrations/functions que faltam.
3. **UX/UI:** o polish do dia foca na feature nova e client-facing — **GrowthMap** (estados de loading/erro/vazio, responsividade mobile, consistência com o design system) — mais um smoke-test das rotas críticas (home, login, hub do cliente, plano estratégico).

---

## 3. Prioridades

| Nível | Item | Por quê |
|---|---|---|
| **P0 (trava o "no ar")** | Aplicar migrations pendentes + deploy `generate-growthmap` | Sem isso a feature nova quebra em prod |
| **P0** | Escolher host + publicar frontend | Sem isso nada novo fica visível |
| **P0** | `git push` (após scan de segredos — já limpo) | Sincroniza prod com as correções de segurança |
| **P0 (risco, bloqueado em você)** | P0-01 rotacionar credencial exposta no git | Segurança real; só você executa |
| **P1 (pós-no-ar)** | Polish UX/UI do GrowthMap + smoke tests | Qualidade percebida |
| **P2 (trilha)** | R3/R4/R6 (IA), P1-01 tenant isolation, GCP | Importante, não urgente hoje |

---

## 4. Execução por etapas (hoje)

### ETAPA 0 — Fechar o código (EU, sem autorização) ✅ FEITO
- [x] Varredura de segredos nos 10 commits — limpa
- [x] `vite build` — OK
- [x] `validate-deploy-artifact` — OK (456 arquivos)
- [x] tsc + 41 testes — verdes

### ETAPA 1 — Suas decisões (VOCÊ, ~5 min)
- [ ] **Host:** Vercel? (recomendado) ou outro?
- [ ] Autoriza **`git push`** dos 10 commits?
- [ ] Como aplicamos migrations em prod: **você roda** (`supabase db push`) ou **me dá acesso** ao Supabase?
- [ ] P0-01: quando rotaciona a credencial? (pode ser depois, mas não esquecer)

### ETAPA 2 — Backend em produção (precisa acesso Supabase)
- [ ] Aplicar `20260722000000_growthmap_results.sql`
- [ ] Aplicar `20260722000001_ai_budget_config.sql`
- [ ] Confirmar `20260721000000/1/2` aplicadas
- [ ] Deploy edge function `generate-growthmap`
- [ ] Smoke test: gerar 1 framework num projeto real

### ETAPA 3 — Frontend no ar
- [ ] `git push` (dispara CI: lint/typecheck/build/validate)
- [ ] Conectar repo ao host escolhido + configurar env `VITE_*`
- [ ] Publicar + smoke test das rotas críticas

### ETAPA 4 — Polish UX/UI (o "final")
- [ ] GrowthMap: loading/skeleton, empty state, erro com retry, responsividade mobile
- [ ] Consistência visual com o design system existente
- [ ] Revisão de acessibilidade básica (contraste, foco, labels)

---

## 5. O que NÃO entra hoje (para não travar o prazo)
- Migração GCP (trilha de semanas)
- R3/R4/R5/R6 do roteador de IA
- P1-01 isolamento por tenant (grande, precisa decidir unidade de tenant)
- M&A due diligence (precisa de dados seus)
