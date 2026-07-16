# RevHackers - Monorepo Unificado

Repositório unificado contendo todos os componentes da plataforma RevHackers.

## 📦 Estrutura

```
revhackers-unified/
├── packages/
│   ├── growth-hub/        # Dashboard REI (React + TypeScript)
│   ├── site-landing/      # Website Institucional (React + TypeScript)
│   └── shared/            # Código Compartilhado
├── docs/                  # Documentação Técnica, Contratos, Vídeos
├── scripts/               # Scripts de Setup e Deploy
└── .github/workflows/     # CI/CD
```

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# Growth Hub
cd packages/growth-hub
npm install
npm run dev

# Site Landing
cd packages/site-landing
npm install
npm run dev
```

### Build

```bash
cd packages/growth-hub && npm run build
cd packages/site-landing && npm run build
```

## 📚 Documentação

- [Documentação Técnica](docs/tecnica/CLAUDE.md)
- [Design System](docs/tecnica/DESIGN_SYSTEM_COMPLIANCE.md)
- [Deploy Checklist](docs/tecnica/CHECKLIST_DEPLOY_HANDOFF.md)

## 🔧 Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Shadcn/UI
- **Database:** PostgreSQL (Supabase/GCP Cloud SQL)
- **Auth:** Firebase Authentication
- **Deployment:** Google Cloud Run

## 📝 License

Proprietary - RevHackers
