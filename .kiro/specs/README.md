# RevHackers Growth Hub — Kiro Specs Index

> Spec-driven development para garantir qualidade e rastreabilidade do código.

## Estrutura

```
.kiro/specs/
├── diagnostic-service/        # P0 — DiagnosticService (68KB, 1293 linhas)
│   ├── requirements.md        # 37 acceptance criteria
│   ├── design.md              # Architecture + test strategy
│   └── tasks.md               # 40+ granular test tasks
│
├── rei-scoring-service/       # P0 — ReiScoringService (4 score types)
│   ├── requirements.md        # 40 acceptance criteria
│   ├── design.md              # Scoring formulas + fixtures
│   └── tasks.md               # 35+ test tasks
│
├── pipeline-state-machine/    # P0 — Pipeline Types (state machine)
│   ├── requirements.md        # 32 acceptance criteria
│   ├── design.md              # State diagram + transition matrix
│   └── tasks.md               # 30+ test tasks
│
├── rei-scoring-lib/           # P0 — REI Form Scoring (lib)
│   ├── requirements.md        # 21 acceptance criteria
│   ├── design.md              # Weight map + algorithm
│   └── tasks.md               # 20+ test tasks
│
├── diagnostic-mapping/        # P0 — Score-to-Insight Resolver
│   ├── requirements.md        # 23 acceptance criteria
│   ├── design.md              # 4 types × 3 levels matrix
│   └── tasks.md               # 18+ test tasks
│
├── form-storage/              # P0 — LocalStorage Persistence
│   ├── requirements.md        # 9 acceptance criteria
│   ├── design.md              # API surface + mock strategy
│   └── tasks.md               # 10 test tasks
│
├── string-utils/              # P0 — Text Sanitization
│   ├── requirements.md        # 8 acceptance criteria
│   ├── design.md              # Regex pattern docs
│   └── tasks.md               # 8 test tasks
│
├── opportunities-api/         # P2 — Sales Pipeline CRUD
│   ├── requirements.md        # 30 acceptance criteria
│   ├── design.md              # Supabase mock patterns
│   └── tasks.md               # 30+ test tasks
│
├── pipeline-service/          # P2 — Project Pipeline Operations
│   ├── requirements.md        # 27 acceptance criteria
│   ├── design.md              # Dependency graph
│   └── tasks.md               # 27 test tasks
│
├── orqflow-store/             # P2 — Kanban Zustand Store
│   ├── requirements.md        # 39 acceptance criteria
│   ├── design.md              # Optimistic update patterns
│   └── tasks.md               # 40+ test tasks
│
├── e2e-public-pages/          # P1 — E2E Public Page Smoke Tests
│   ├── requirements.md        # 22 acceptance criteria
│   ├── design.md              # Playwright strategy
│   └── tasks.md               # 22+ test tasks
│
└── e2e-auth-flows/            # P1 — E2E Auth Flow Tests
    ├── requirements.md        # 15 acceptance criteria
    ├── design.md              # Auth flow diagram
    └── tasks.md               # 16 test tasks
```

## Prioridades

| Prioridade | Spec | Framework | Tipo |
|------------|------|-----------|------|
| **P0** | diagnostic-service | Vitest | Unit (lógica pura) |
| **P0** | rei-scoring-service | Vitest | Unit (lógica pura) |
| **P0** | pipeline-state-machine | Vitest | Unit (types) |
| **P0** | rei-scoring-lib | Vitest | Unit (lógica pura) |
| **P0** | diagnostic-mapping | Vitest | Unit (utils) |
| **P0** | form-storage | Vitest | Unit (utils) |
| **P0** | string-utils | Vitest | Unit (utils) |
| **P1** | e2e-public-pages | Playwright | E2E (smoke) |
| **P1** | e2e-auth-flows | Playwright | E2E (auth) |
| **P2** | opportunities-api | Vitest + Mock | Integration |
| **P2** | pipeline-service | Vitest + Mock | Integration |
| **P2** | orqflow-store | Vitest + Mock | Integration |

## Totais

- **12 specs** com trilogia completa (requirements + design + tasks)
- **~300 acceptance criteria** (EARS notation)
- **~300+ test tasks** mapeados 1:1 com ACs
- **0 dependências externas** para P0 (lógica pura)

## Como usar com Kiro

1. Abra o projeto no Kiro IDE
2. Navegue para `.kiro/specs/<feature>/`
3. Kiro lê automaticamente `requirements.md` → `design.md` → `tasks.md`
4. Execute os tasks para gerar os test files

## Test Infrastructure (já configurado)

```json
// package.json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "npx playwright test"
}
```

- `vitest.config.ts` — Configurado com jsdom + path aliases
- `playwright.config.ts` — Chromium + Firefox + WebKit
