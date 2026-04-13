---
name: Notion Visual Patterns Guide
description: Padroes visuais extraidos do Notion, adaptados ao design system Nobibecode para uso como referencia de implementacao
type: reference
---

# Inspiracao Visual Notion - Mapeado para Nobibecode

Padroes visuais observados no app Notion, traduzidos para o design system RevHackers.
**Regra:** Nunca copiar HTML/CSS do Notion. Usar apenas como referencia de layout, hierarquia e espacamento.

---

## 1. SIDEBAR (Painel Lateral)

### O que o Notion faz
- Fundo claro (#FBFBFA) com borda sutil a direita
- Largura: ~240px expandida, ~48px colapsada
- Workspace switcher no topo com chevron
- Secoes agrupadas: Quick Access (Buscar, Home, Inbox) + Sections (Agentes, Espacos) + Pages
- Icones 18px monocromaticos, texto 14px regular
- Hover: bg-zinc-100 com rounded-sm (4px)
- Active: bg-zinc-200 com font-weight medium
- Section titles: 11px uppercase, letter-spacing 0.05em, cor terciaria
- Sem bordas entre items - apenas espacamento

### Traducao Nobibecode (ja implementado em Sidebar.tsx)
```
Container:      bg-zinc-950 (DARK - diferencial da marca)
Largura:        w-64 expanded / w-16 collapsed
Hover item:     bg-zinc-800/50 text-zinc-200
Active item:    bg-zinc-800 text-white
Section title:  text-[10px] font-black uppercase tracking-widest text-zinc-500
Icones:         w-5 h-5 (20px) - Lucide icons
Texto nav:      text-sm font-medium
Transicao:      duration-200 ease-out
```

### Gaps identificados vs Notion
- [ ] Notion tem "Favoritos" como secao fixa no topo - RevHackers nao tem
- [ ] Notion tem drag-and-drop para reordenar pages - RevHackers e estatico
- [ ] Notion mostra badges/contadores nos items (ex: "5" no inbox) - RevHackers nao tem
- [ ] Notion tem resize handle na borda da sidebar - RevHackers usa toggle

---

## 2. HEADER DA PAGINA (Breadcrumb + Actions)

### O que o Notion faz
- Barra superior fina (~44px) com background transparente
- Esquerda: breadcrumb path (icon + "Workspace / Page / Subpage")
- Direita: acoes (Share, Comment, Star, More)
- Breadcrumb: text-sm, cor terciaria, separado por "/"
- Icones de acao: 16px, cor terciaria, hover cor primaria
- Sem borda inferior - separacao e apenas visual pelo conteudo

### Traducao Nobibecode (ja implementado em PageHeader.tsx)
```
Container:      h-12 flex items-center justify-between px-6
Breadcrumb:     text-sm text-zinc-400 font-medium
Separador:      text-zinc-300 mx-1 "/"
Current page:   text-zinc-900 font-semibold
Actions:        flex gap-2, botoes ghost com icons
```

### Melhorias possiveis
- [ ] Adicionar breadcrumb clicavel (hoje e so visual)
- [ ] Adicionar botoes de acao no lado direito (Share, Favorite)
- [ ] Transicao suave ao trocar de pagina

---

## 3. CARDS DE CONTEUDO

### O que o Notion faz (observado na pagina de Wikis)
- Cards com fundo cinza claro (#F7F6F3)
- Border-radius: 8px (rounded-lg)
- Padding: 20px
- Sem borda visivel - diferenciacao por background
- Icone no topo-esquerda (24px, cor accent azul)
- Titulo abaixo do icone: 16px font-semibold
- Sem descricao nos cards compactos
- Grid: 4 colunas em desktop, gap 12px
- Hover: sombra sutil + scale(1.01)

### Traducao Nobibecode
```tsx
// Card compacto (estilo Notion wiki)
<div className="bg-zinc-50 rounded-xl p-5 hover:shadow-sm transition-all cursor-pointer group">
  <div className="w-10 h-10 bg-white border border-zinc-200 rounded-lg flex items-center justify-center mb-3">
    <Icon className="w-5 h-5 text-zinc-900" />
  </div>
  <h3 className="text-sm font-bold text-zinc-900 group-hover:text-black">
    Titulo do Card
  </h3>
</div>

// Grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
```

---

## 4. KANBAN BOARD

### O que o Notion faz (observado no screenshot principal)
- Colunas com header: dot colorido + titulo + count
- Background da coluna: transparente (sem bg)
- Cards: bg-white, border sutil (#E8E7E3), rounded-md (6px)
- Card padding: 12px 14px
- Card text: 14px regular
- Hover card: shadow-sm
- Header coluna: 12px uppercase, letter-spacing 0.05em
- Dot de status: 8px rounded-full, cor semantica
- Botao "+ Nova pagina" no rodape da coluna

### Traducao Nobibecode (para Pipeline/Kanban do admin)
```tsx
// Coluna
<div className="flex-1 min-w-[280px]">
  {/* Header */}
  <div className="flex items-center gap-2 mb-3 px-1">
    <div className="w-2 h-2 rounded-full bg-[#00CC6A]" />
    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
      Em andamento
    </span>
    <span className="text-xs text-zinc-400 ml-1">5</span>
  </div>

  {/* Cards */}
  <div className="space-y-2">
    <div className="bg-white border border-zinc-200 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
      <p className="text-sm font-medium text-zinc-900">Titulo da task</p>
    </div>
  </div>
</div>
```

---

## 5. TIPOGRAFIA E HIERARQUIA

### O que o Notion faz
- Page title: 40px font-bold (nao black)
- Emoji/icon ao lado do titulo: 40px
- Body text: 16px regular, line-height 1.5, cor #37352F
- Secoes dentro da pagina: sem eyebrow, titulo direto
- Muito espaco em branco entre secoes (~48px)
- Max-width do conteudo: ~720px centralizado
- Nenhum uppercase no conteudo (apenas em section labels da sidebar)

### Traducao Nobibecode
```
Page title:     text-3xl md:text-4xl font-black tracking-tight text-zinc-900
                (Nobibecode usa font-black em vez de font-bold como Notion)
Body:           text-[15px] font-medium leading-relaxed text-zinc-500
Spacing:        py-8 entre secoes (gap-8)
Max-width:      max-w-4xl mx-auto (900px - mais largo que Notion)
```

**Diferenca chave:** Notion usa tipografia mais leve (font-medium/regular).
Nobibecode usa tipografia mais pesada (font-black) como elemento visual principal.
Manter o peso Nobibecode - e o diferencial.

---

## 6. COMMAND PALETTE (Cmd+K)

### O que o Notion faz
- Overlay escuro (bg-black/50)
- Modal centralizado: max-w-xl, bg-white, rounded-xl, shadow-2xl
- Input no topo: sem borda, text-lg, placeholder "Buscar ou pular para..."
- Resultados agrupados por categoria (Recentes, Paginas, Acoes)
- Cada resultado: icone 18px + texto 14px + atalho teclado a direita
- Hover: bg-zinc-100
- Selected (keyboard): bg-blue-50 com borda azul (Notion usa azul)
- Animacao: fade-in rapido (150ms)

### Traducao Nobibecode (ja implementado em CommandPalette.tsx)
```
Overlay:        bg-black/60 (mais escuro que Notion)
Modal:          bg-white rounded-xl shadow-sm max-w-lg (shadow menor)
Input:          border-none text-base placeholder:text-zinc-400
Hover result:   bg-zinc-50 (mais sutil que Notion)
Selected:       bg-zinc-100 (sem azul - Nobibecode nao usa azul)
Atalho:         text-xs text-zinc-400 font-mono
```

---

## 7. LOADING STATES (Skeleton)

### O que o Notion faz
- Placeholder com animate-pulse
- Cor do skeleton: #E8E7E3 (cinza quente)
- Rounded igual ao componente final
- 3 tamanhos: line (h-4), block (h-20), full-page
- Transicao: fade do skeleton para conteudo real (200ms)

### Traducao Nobibecode
```tsx
// Skeleton line
<div className="h-4 bg-zinc-100 rounded animate-pulse w-3/4" />

// Skeleton card
<div className="border border-zinc-200 rounded-xl p-5 space-y-3">
  <div className="h-3 bg-zinc-100 rounded animate-pulse w-1/3" />
  <div className="h-4 bg-zinc-100 rounded animate-pulse w-full" />
  <div className="h-4 bg-zinc-100 rounded animate-pulse w-2/3" />
</div>

// Skeleton table row
<div className="flex gap-4 py-3 border-b border-zinc-100">
  <div className="h-4 bg-zinc-100 rounded animate-pulse w-1/4" />
  <div className="h-4 bg-zinc-100 rounded animate-pulse w-1/3" />
  <div className="h-4 bg-zinc-100 rounded animate-pulse w-1/6" />
</div>
```

---

## 8. TABBED VIEWS (Database Views)

### O que o Notion faz (observado no screenshot principal)
- Tabs horizontais abaixo do titulo da pagina
- Cada tab: icone 14px + texto 13px
- Tab ativa: borda inferior 2px preta, font-medium
- Tab inativa: cor terciaria, sem borda
- Separador "+" para adicionar nova view
- Actions a direita: Filter, Sort, Search, Group, Fullscreen

### Traducao Nobibecode
```tsx
// Tab bar (para views de database/tabela)
<div className="flex items-center border-b border-zinc-200 gap-1 px-1">
  {/* Tabs */}
  <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-900 border-b-2 border-zinc-900">
    <TableIcon className="w-3.5 h-3.5" />
    Tarefas da empresa
  </button>
  <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-600">
    <UserIcon className="w-3.5 h-3.5" />
    Minhas tarefas
  </button>

  {/* Spacer */}
  <div className="flex-1" />

  {/* Actions */}
  <div className="flex items-center gap-1">
    <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded">
      <Filter className="w-4 h-4" />
    </button>
    <button className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded">
      <Search className="w-4 h-4" />
    </button>
  </div>
</div>
```

---

## 9. EMPTY STATES

### O que o Notion faz
- Ilustracao vetorial monocromatica (preto/cinza)
- Texto principal: 18px font-medium
- Texto secundario: 14px regular, cor terciaria
- CTA: texto link azul (nao botao)
- Muito espaco em branco ao redor
- Centralizado verticalmente na area disponivel

### Traducao Nobibecode
```tsx
<div className="flex flex-col items-center justify-center py-20 text-center">
  <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
    <FolderOpen className="w-7 h-7 text-zinc-300" />
  </div>
  <h3 className="text-base font-bold text-zinc-900 mb-1">
    Nenhum projeto ainda
  </h3>
  <p className="text-sm text-zinc-400 mb-4 max-w-xs">
    Crie seu primeiro projeto para comecar a gerenciar as entregas.
  </p>
  <button className="text-sm font-bold text-[#00CC6A] hover:underline">
    + Criar projeto
  </button>
</div>
```

---

## 10. WORKSPACE REAL REVHACKERS NO NOTION (Estrutura Interna)

Analisado via Notion MCP - estas sao as paginas reais do workspace e como organizam informacao.

### Home Page (Hub Central)
**Estrutura observada:**
- Callout de boas-vindas (amarelo) no topo
- Divider
- Secao "Acesso Rapido" com callout de destaque (azul) para AI OS
- Layout em 3 colunas: Projetos | Acompanhamento | Playbooks
- Cada coluna: H3 com emoji + lista de links internos
- Database inline (Tasks) como widget abaixo
- Tabela de contatos
- Checklist de onboarding

**Padroes visuais a replicar:**
```tsx
// Hub dashboard - 3 colunas de quick access
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div>
    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-3">
      Projetos
    </h3>
    <div className="space-y-2">
      <Link className="text-sm font-medium text-zinc-700 hover:text-zinc-900 block">
        Revenue Control Scrum
      </Link>
    </div>
  </div>
</div>
```

### Revenue Control Scrum (Dashboard de Projetos)
**Estrutura observada:**
- Callout azul explicativo no topo
- Dashboard em 2 colunas: Tasks por Status | Sprints
- Abaixo: 2 colunas - Urgentes | Concluidas Recentes
- Database de Clientes (lista)
- Database de Sprints
- Database de Tarefas
- 2 callouts informativos no rodape (fluxo scrum)

**Padroes visuais a replicar:**
```tsx
// Dashboard com databases side-by-side
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-3">
      Tarefas por Status
    </h3>
    {/* Kanban inline ou tabela */}
  </div>
  <div>
    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-3">
      Sprints
    </h3>
    {/* Lista de sprints */}
  </div>
</div>
```

### Pipeline de Vendas (Database Kanban)
**Schema real observado:**
- Views: Kanban Pipeline | Todos os Leads (tabela) | Follow-ups Hoje (tabela filtrada)
- Kanban agrupado por Status: Novo Lead -> Qualificando -> Call Agendada -> Demo Realizada -> Proposta Enviada -> Negociando -> Ganho/Perdido
- Properties exibidas no card: Lead, Empresa, Valor, Score, Proxima Acao
- Score com emojis: Hot/Warm/Cold
- Canal de Origem: LinkedIn, WhatsApp, Indicacao, Inbound, Evento

**Padrao de multi-view tabs a replicar:**
```tsx
// Database com multiplas views (tab bar)
<div className="border-b border-zinc-200">
  <div className="flex items-center gap-1">
    <button className="px-3 py-2 text-xs font-bold text-zinc-900 border-b-2 border-zinc-900">
      Kanban Pipeline
    </button>
    <button className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-600">
      Todos os Leads
    </button>
    <button className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-600">
      Follow-ups Hoje
    </button>
  </div>
</div>
```

### Template de Projeto (Pagina de Detalhe)
**Estrutura observada:**
- Callout azul de instrucoes no topo
- Tabela de metadados: Cliente, Objetivo, Escopo, Responsavel, Datas
- Database inline de Sprints
- Secao de Tarefas
- Database inline de Documentacoes
- Callout verde de acompanhamento (Status geral)
- Checklist de Riscos
- Checklist de Proximos Passos
- Area de notas livres

**Padrao de pagina de detalhe a replicar:**
```tsx
// Project detail page - structured sections
<div className="max-w-4xl mx-auto space-y-8">
  {/* Alert/Banner */}
  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-start gap-3">
    <Info className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
    <p className="text-sm text-zinc-600">Instrucoes ou contexto</p>
  </div>

  {/* Metadata table */}
  <div className="border border-zinc-200 rounded-xl overflow-hidden">
    <div className="grid grid-cols-2 divide-y divide-zinc-100">
      <div className="px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 bg-zinc-50">
        Cliente
      </div>
      <div className="px-4 py-3 text-sm text-zinc-900">Nome</div>
    </div>
  </div>

  {/* Inline database */}
  <section>
    <h2 className="text-lg font-black text-zinc-900 mb-4">Sprints</h2>
    {/* Table/Kanban component */}
  </section>

  {/* Checklist section */}
  <section>
    <h2 className="text-lg font-black text-zinc-900 mb-4">Proximos Passos</h2>
    <div className="space-y-2">
      {/* Checkbox items */}
    </div>
  </section>
</div>
```

### AI OS Command Center
**Estrutura observada:**
- Callout amarelo com destaque
- Tabela de agentes: Nome, Camada, Funcao, Comando Telegram
- 3 databases inline: Projetos de Growth | Task Queue | Deliverables
- Links rapidos no rodape

**Padroes chave:**
- Tabelas com header row como componente de referencia rapida
- Databases inline empilhadas verticalmente com dividers entre elas
- Callout como "status bar" no topo da pagina

---

## 11. MAPEAMENTO: NOTION WORKSPACE -> REVHACKERS APP

| Notion Page | RevHackers Equivalente | Status |
|---|---|---|
| Home | `/admin` (AdminDashboard) | Existe, refinar layout |
| Revenue Control Scrum | `/admin/projects` (AdminProjects) | Existe |
| Pipeline de Vendas (Kanban) | `/admin/pipeline` (RevenueCockpit) | Existe |
| Template de Projeto | `/admin/projects/:id` (ProjectDetails) | Existe |
| Agent Task Queue | Nao existe | Implementar |
| Deliverables & Outputs | Nao existe | Implementar |
| Sprints | Dentro de ProjectDetails | Existe |

### O que replicar da estrutura Notion no app:
1. **Hub com quick-access links** em 3 colunas (Home)
2. **Dashboard com databases lado a lado** em 2 colunas (Revenue Control)
3. **Multi-view tabs** no Pipeline (Kanban | Tabela | Follow-ups)
4. **Pagina de detalhe** com metadata table + inline databases + checklists (Template)
5. **Callouts como banners** de contexto/status no topo das paginas
6. **Dividers** entre secoes para separacao visual clara

---

## 12. RESUMO: O QUE EXTRAIR vs O QUE IGNORAR

### EXTRAIR do Notion (inspiracao)
- Hierarquia visual clara: sidebar -> header -> conteudo
- Espacamento generoso entre secoes (py-8, gap-6)
- Cards minimalistas: bg sutil, sem borda pesada
- Tabs como navegacao de views dentro da pagina
- Loading skeletons que espelham o conteudo final
- Empty states com icone + texto + acao
- Command palette como atalho principal de navegacao
- Contadores/badges nos items de navegacao
- Hover states sutis (shadow-sm, scale mínimo)

### IGNORAR do Notion (nao cabe no Nobibecode)
- Azul como cor de accent (usar #00CC6A)
- Font-weight leve em titulos (manter font-black)
- Sidebar clara (manter bg-zinc-950 dark)
- Rounded-full em qualquer card
- Emojis como icones de pagina (usar Lucide)
- Drag-and-drop complexo (nao necessario agora)
- Gradientes ou sombras pesadas
- Nested pages na sidebar (simplificar navegacao)
