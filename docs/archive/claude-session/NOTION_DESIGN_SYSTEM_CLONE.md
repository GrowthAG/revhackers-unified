# 🎨 Notion Design System Clone - RevHackers Implementation Guide

**Data:** 2026-04-03  
**Objetivo:** Clonar padrões de design do Notion mantendo identidade "Nobibecode"  
**Status:** Pronto para implementação

---

## 📊 Análise do Design System do Notion

### Princípios Core Identificados

1. **Minimalismo Funcional**
   - Interface limpa, sem distrações
   - Hierarquia visual clara
   - Espaçamento generoso

2. **Consistência Absoluta**
   - Componentes reutilizáveis
   - Padrões de interação previsíveis
   - Design tokens bem definidos

3. **Performance Percebida**
   - Skeleton loading
   - Optimistic updates
   - Transições suaves (200-300ms)

4. **Navegação Intuitiva**
   - Sidebar persistente e colapsável
   - Breadcrumbs contextuais
   - Command palette (Cmd+K)

---

## 🎯 Design Tokens - Sistema Completo

### Cores (Adaptado para Nobibecode)

```typescript
// src/design-system/tokens/colors.ts
export const COLORS = {
  // Base (Notion usa cinzas neutros, nós usamos zinc)
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F4F4F5',
    elevated: '#FFFFFF',
    dark: '#09090B',
  },
  
  // Text (Notion usa opacidade, nós usamos zinc scale)
  text: {
    primary: '#18181B',      // zinc-900
    secondary: '#52525B',    // zinc-600
    tertiary: '#A1A1AA',     // zinc-400
    disabled: '#D4D4D8',     // zinc-300
    inverse: '#FFFFFF',
  },
  
  // Borders (Notion usa cinzas muito sutis)
  border: {
    default: '#E4E4E7',      // zinc-200
    hover: '#D4D4D8',        // zinc-300
    focus: '#00CC6A',        // accent
    subtle: '#F4F4F5',       // zinc-100
  },
  
  // Accent (único accent permitido)
  accent: {
    primary: '#00CC6A',
    hover: '#00B35E',
    active: '#009A52',
    subtle: 'rgba(0, 204, 106, 0.1)',
    text: '#00CC6A',
  },
  
  // Status (minimalista, sem cores vibrantes)
  status: {
    success: '#00CC6A',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
} as const;
```

### Tipografia (Inspirado em Notion)

```typescript
// src/design-system/tokens/typography.ts
export const TYPOGRAPHY = {
  // Font Family (Notion usa Inter, nós mantemos nossa stack)
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
  },
  
  // Font Sizes (escala consistente)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  // Font Weights (Notion usa 400, 500, 600)
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    black: 900,  // Para títulos Nobibecode
  },
  
  // Line Heights (Notion usa valores generosos)
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',  // Para uppercase labels
  },
} as const;
```

### Spacing (Sistema 4px base)

```typescript
// src/design-system/tokens/spacing.ts
export const SPACING = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;
```

### Shadows (Notion usa sombras muito sutis)

```typescript
// src/design-system/tokens/shadows.ts
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const;
```

### Border Radius (Notion usa cantos arredondados sutis)

```typescript
// src/design-system/tokens/radius.ts
export const RADIUS = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px - Nobibecode padrão
  full: '9999px',  // EVITAR em cards
} as const;
```

### Transitions (Notion usa animações rápidas e suaves)

```typescript
// src/design-system/tokens/transitions.ts
export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  
  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
```

---

## 🧩 Componentes Core (Notion-Inspired)

### 1. Sidebar Global

```tsx
// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, Pipeline, Folder, Users, FileText, 
  Book, Briefcase, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800',
        'transition-all duration-200 ease-out z-50',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
        {!collapsed && (
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            RevHackers
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        <SidebarSection title={collapsed ? '' : 'WORKSPACE'}>
          <SidebarItem
            icon={Home}
            label="Dashboard"
            to="/admin"
            active={location.pathname === '/admin'}
            collapsed={collapsed}
          />
          <SidebarItem
            icon={Pipeline}
            label="Pipeline"
            to="/admin/pipeline"
            active={location.pathname.startsWith('/admin/pipeline')}
            collapsed={collapsed}
          />
          <SidebarItem
            icon={Folder}
            label="Projetos"
            to="/admin/projects"
            active={location.pathname.startsWith('/admin/projects')}
            collapsed={collapsed}
          />
        </SidebarSection>

        <SidebarSection title={collapsed ? '' : 'CLIENTES'}>
          <SidebarItem
            icon={Users}
            label="Clientes"
            to="/admin/clients"
            active={location.pathname.startsWith('/admin/clients')}
            collapsed={collapsed}
          />
          <SidebarItem
            icon={FileText}
            label="Propostas"
            to="/admin/proposals"
            active={location.pathname.startsWith('/admin/proposals')}
            collapsed={collapsed}
          />
        </SidebarSection>

        <SidebarSection title={collapsed ? '' : 'CONTEÚDO'}>
          <SidebarItem
            icon={Book}
            label="Materiais"
            to="/admin/materials"
            active={location.pathname.startsWith('/admin/materials')}
            collapsed={collapsed}
          />
          <SidebarItem
            icon={Briefcase}
            label="Cases"
            to="/admin/cases"
            active={location.pathname.startsWith('/admin/cases')}
            collapsed={collapsed}
          />
        </SidebarSection>
      </nav>
    </aside>
  );
};

// Section Component
interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  if (!title) return <div className="space-y-1">{children}</div>;
  
  return (
    <div className="space-y-1 mt-6 first:mt-0">
      <div className="px-3 mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
};

// Item Component
interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  active: boolean;
  collapsed: boolean;
}

const SidebarItem = ({ icon: Icon, label, to, active, collapsed }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md',
        'transition-colors duration-150',
        'text-sm font-medium',
        active
          ? 'bg-zinc-800 text-white'
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};
```

### 2. Command Palette (Cmd+K)

```tsx
// src/components/ui/CommandPalette.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, Home, Pipeline, Folder, Plus } from 'lucide-react';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <Command.Input
          placeholder="Buscar ou executar ação..."
          className="w-full px-4 py-3 text-sm border-b border-zinc-200 outline-none"
        />
        
        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="px-4 py-8 text-center text-sm text-zinc-500">
            Nenhum resultado encontrado.
          </Command.Empty>

          <Command.Group heading="Navegação" className="mb-4">
            <CommandItem
              icon={Home}
              label="Dashboard"
              onSelect={() => {
                navigate('/admin');
                setOpen(false);
              }}
            />
            <CommandItem
              icon={Pipeline}
              label="Pipeline"
              onSelect={() => {
                navigate('/admin/pipeline');
                setOpen(false);
              }}
            />
            <CommandItem
              icon={Folder}
              label="Projetos"
              onSelect={() => {
                navigate('/admin/projects');
                setOpen(false);
              }}
            />
          </Command.Group>

          <Command.Group heading="Ações Rápidas">
            <CommandItem
              icon={Plus}
              label="Novo Projeto"
              onSelect={() => {
                // Abrir modal de novo projeto
                setOpen(false);
              }}
            />
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};

// Item Component
interface CommandItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onSelect: () => void;
}

const CommandItem = ({ icon: Icon, label, onSelect }: CommandItemProps) => {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-zinc-100 transition-colors"
    >
      <Icon className="w-4 h-4 text-zinc-500" />
      <span className="text-sm text-zinc-900">{label}</span>
    </Command.Item>
  );
};
```

### 3. Skeleton Loading (Notion-Style)

```tsx
// src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-zinc-200 rounded-md',
        className
      )}
    />
  );
};

// Skeleton específico para Project Details
export const ProjectDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32 col-span-1" />
        <Skeleton className="h-32 col-span-2" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
};
```

---

## 📐 Layout Patterns (Notion-Inspired)

### App Shell com Sidebar

```tsx
// src/components/layout/AppShell.tsx
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/ui/CommandPalette';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <CommandPalette />
      
      <main className="ml-64 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
```

### Page Header (Notion-Style)

```tsx
// src/components/layout/PageHeader.tsx
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) => {
  return (
    <div className={cn('space-y-4 mb-8', className)}>
      {breadcrumbs && (
        <div className="text-sm text-zinc-500">
          {breadcrumbs}
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-zinc-900">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-zinc-600">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🎬 Micro-interações (Notion-Style)

### Hover States

```css
/* src/styles/interactions.css */

/* Card hover (Notion usa scale sutil) */
.card-hover {
  @apply transition-all duration-200;
}

.card-hover:hover {
  @apply scale-[1.01] shadow-md;
}

/* Button hover */
.button-hover {
  @apply transition-colors duration-150;
}

/* Link hover (Notion usa underline animado) */
.link-hover {
  @apply relative;
}

.link-hover::after {
  content: '';
  @apply absolute bottom-0 left-0 w-0 h-px bg-current;
  @apply transition-all duration-200;
}

.link-hover:hover::after {
  @apply w-full;
}
```

---

## 📦 Implementação Prática

### Fase 1: Setup (1 dia)

```bash
# Instalar dependências
npm install cmdk lucide-react

# Criar estrutura
mkdir -p src/design-system/{tokens,components,hooks}
```

### Fase 2: Tokens (1 dia)

1. Criar todos os arquivos de tokens
2. Exportar em `src/design-system/tokens/index.ts`
3. Atualizar `tailwind.config.js` com tokens

### Fase 3: Sidebar (2 dias)

1. Implementar `Sidebar.tsx`
2. Integrar em `App.tsx`
3. Ajustar rotas para usar AppShell

### Fase 4: Command Palette (2 dias)

1. Implementar `CommandPalette.tsx`
2. Adicionar ações contextuais
3. Integrar busca

### Fase 5: Skeleton Loading (1 dia)

1. Criar componentes Skeleton
2. Substituir PageLoader por Skeletons
3. Adicionar em todas as páginas

---

## ✅ Checklist de Implementação

### Design Tokens
- [ ] Criar `colors.ts`
- [ ] Criar `typography.ts`
- [ ] Criar `spacing.ts`
- [ ] Criar `shadows.ts`
- [ ] Criar `radius.ts`
- [ ] Criar `transitions.ts`
- [ ] Atualizar `tailwind.config.js`

### Componentes Core
- [ ] Implementar `Sidebar.tsx`
- [ ] Implementar `CommandPalette.tsx`
- [ ] Implementar `Skeleton.tsx`
- [ ] Implementar `PageHeader.tsx`
- [ ] Implementar `AppShell.tsx`

### Integração
- [ ] Integrar Sidebar em todas as rotas admin
- [ ] Adicionar Command Palette global
- [ ] Substituir loaders por Skeletons
- [ ] Atualizar PageHeaders

### Polish
- [ ] Adicionar micro-interações
- [ ] Testar responsividade
- [ ] Validar acessibilidade
- [ ] Documentar componentes

---

## 🎯 Resultado Esperado

Após implementação completa:

- ✅ Navegação consistente (Sidebar + Command Palette)
- ✅ Loading states profissionais (Skeleton)
- ✅ Design tokens bem definidos
- ✅ Micro-interações suaves
- ✅ Performance percebida melhorada
- ✅ UX comparável ao Notion

**Score Alvo:** 9/10 vs Notion

---

**Criado por:** Kiro (AI)  
**Data:** 2026-04-03  
**Próxima Ação:** Implementar Fase 1 (Setup)
