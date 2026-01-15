# ACTIVE TASKS

**Last Updated**: 2026-01-13 23:38
**Project**: [RevHackers Growth Hub](/Brain/PROJECT_CORE.md)

---

## Active Sprint / Current Focus

**Sprint Goal**: Implementar a metodologia "Onboarding Orquestrado" no sistema.
**Period**: 2026-01-13 to [TBD]

---

## Tasks

### Critical Priority 🔴

#### TASK-001: Setup Project Management Structure
- **Status**: DONE
- **Owner**: Antigravity
- **Estimated Effort**: Small
- **Deadline**: 2026-01-13
- **Progress**: 100%
- **Dependencies**: None
- **Description**: Configurar /Brain/ e documentos core conforme AGENT_RULES.
- **Acceptance Criteria**:
  - [x] Create /Brain/ directory
  - [x] Create PROJECT_CORE.md
  - [x] Create ACTIVE_TASKS.md
  - [x] Validate with Owner
- **Blocker**: N/A

#### TASK-002: Implement Handoff -> Kickoff Flow
- **Status**: IN PROGRESS
- **Owner**: Antigravity
- **Estimated Effort**: Medium
- **Deadline**: [TBD]
- **Progress**: 10%
- **Dependencies**: Stage 1 (Done)
- **Description**: Implementar fluxo automático: Ganho na Proposta -> Redirecionar para preenchimento do REI (Kickoff).
- **Acceptance Criteria**:
  - [ ] Add "Iniciar Onboarding" action in AdminProposals for approved deals
  - [ ] Pre-fill REI form with Deal data (Client Name, etc.)
  - [ ] Ensure correct status transitions
- **Blocker**: N/A

---

### High Priority 🟠

#### TASK-003: Review Supabase Edge Functions
- **Status**: DONE
- **Owner**: Antigravity
- **Progress**: 100%
- **Notes**: Corrigido problema de fetch CNPJ com fallback para BrasilAPI direto.

---

## Completed This Period ✅

| Task ID | Name | Completed Date | Owner | Notes |
|---------|------|----------------|-------|-------|
| TASK-000 | Stage 1 (Embark) Implementation | 2026-01-13 | Antigravity | Roadmap & First 90 Days inserted in Deal Room |
| TASK-XXX | CNPJ Fetch Fix | 2026-01-13 | Antigravity | Fallback to direct client-side fetch implemented |

---

## Next Actions
1. Validar estrutura /Brain/ com Owner
2. Preencher lacunas do PROJECT_CORE
3. Iniciar TASK-002 (Handoff Strategy)
