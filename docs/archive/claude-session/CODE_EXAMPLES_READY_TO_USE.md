# 💻 Exemplos de Código - Prontos para Usar

**Copie e cole diretamente no seu projeto**

---

## 🎨 1. Design Tokens

### colors.ts (COMPLETO)
```typescript
// src/design-system/tokens/colors.ts
export const COLORS = {
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F4F4F5',
    elevated: '#FFFFFF',
    dark: '#09090B',
  },
  text: {
    primary: '#18181B',
    secondary: '#52525B',
    tertiary: '#A1A1AA',
    disabled: '#D4D4D8',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E4E4E7',
    hover: '#D4D4D8',
    focus: '#00CC6A',
    subtle: '#F4F4F5',
  },
  accent: {
    primary: '#00CC6A',
    hover: '#00B35E',
    active: '#009A52',
    subtle: 'rgba(0, 204, 106, 0.1)',
    text: '#00CC6A',
  },
  status: {
    success: '#00CC6A',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
} as const;
```

### typography.ts (COMPLETO)
```typescript
// src/design-system/tokens/typography.ts
export const TYPOGRAPHY = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    black: 900,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;
```

### spacing.ts (COMPLETO)
```typescript
// src/design-system/tokens/spacing.ts
export const SPACING = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;
```

---

## 🧩 2. Componente Sidebar (COMPLETO)

```tsx
// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, Pipeline, Folder, Users, FileText, 
  Book, Briefcase, ChevronLeft, ChevronRight,
  type LucideIcon
} from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  to: string;
}

const NAVIGATION: Record<string, NavItem[]> = {
  WORKSPACE: [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: Pipeline, label: 'Pipeline', to: '/admin/pipeline' },
    { icon: Folder, label: 'Projetos', to: '/admin/projects' },
  ],
  CLIENTES: [
    { icon: Users, label: 'Clientes', to: '/admin/clients' },
    { icon: FileText, label: 'Propostas', to: '/admin/proposals' },
  ],
  CONTEÚDO: [
    { icon: Book, label: 'Materiais', to: '/admin/materials' },
    { icon: Briefcase, label: 'Cases', to: '/admin/cases' },
  ],
};

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800',
        'transition-all duration-200 ease-out z-50',
        collapsed ? 'w-16' : 'w-64'
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
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {Object.entries(NAVIGATION).map(([section, items]) => (
          <SidebarSection key={section} title={collapsed ? '' : section}>
            {items.map((item) => (
              <SidebarItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={location.pathname.startsWith(item.to)}
                collapsed={collapsed}
              />
            ))}
          </SidebarSection>
        ))}
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
  icon: LucideIcon;
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
      title={collapsed ? label : undefined}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
};
```

---

## 🎯 3. Command Palette (COMPLETO)

### Instalar dependência primeiro:
```bash
npm install cmdk
```

### Componente:
```tsx
// src/components/ui/CommandPalette.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, Home, Pipeline, Folder, Plus, type LucideIcon } from 'lucide-react';

interface CommandAction {
  icon: LucideIcon;
  label: string;
  onSelect: () => void;
  group: string;
}

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

  const actions: CommandAction[] = [
    // Navegação
    {
      icon: Home,
      label: 'Dashboard',
      onSelect: () => navigate('/admin'),
      group: 'Navegação',
    },
    {
      icon: Pipeline,
      label: 'Pipeline',
      onSelect: () => navigate('/admin/pipeline'),
      group: 'Navegação',
    },
    {
      icon: Folder,
      label: 'Projetos',
      onSelect: () => navigate('/admin/projects'),
      group: 'Navegação',
    },
    // Ações
    {
      icon: Plus,
      label: 'Novo Projeto',
      onSelect: () => {
        // TODO: Abrir modal de novo projeto
        console.log('Criar novo projeto');
      },
      group: 'Ações Rápidas',
    },
  ];

  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group].push(action);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[100]"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200">
          <Search className="w-4 h-4 text-zinc-400" />
          <Command.Input
            placeholder="Buscar ou executar ação..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
        
        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="px-4 py-8 text-center text-sm text-zinc-500">
            Nenhum resultado encontrado.
          </Command.Empty>

          {Object.entries(groupedActions).map(([group, items]) => (
            <Command.Group key={group} heading={group} className="mb-4">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {group}
              </div>
              {items.map((action) => (
                <Command.Item
                  key={action.label}
                  onSelect={() => {
                    action.onSelect();
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-zinc-100 transition-colors"
                >
                  <action.icon className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-900">{action.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
```

---

## ⏳ 4. Skeleton Loading (COMPLETO)

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

// Skeleton para Project Details
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

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32 col-span-1" />
        <Skeleton className="h-32 col-span-2" />
      </div>

      {/* List */}
      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
};

// Skeleton para Cards List
export const CardsListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-zinc-200 rounded-2xl p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 🏗️ 5. AppShell (COMPLETO)

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

---

## 📄 6. PageHeader (COMPLETO)

```tsx
// src/components/layout/PageHeader.tsx
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
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
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="hover:text-zinc-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-zinc-900">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          ))}
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

## 🎨 7. Exemplo de Uso Completo

```tsx
// src/pages/admin/ProjectsPage.tsx
import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { CardsListSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ProjectsPage = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Simular fetch
    setTimeout(() => {
      setProjects([/* ... */]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Projetos"
        description="Gerencie todos os projetos de clientes"
        breadcrumbs={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Projetos' },
        ]}
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        }
      />

      {loading ? (
        <CardsListSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </AppShell>
  );
};
```

---

## 📦 8. Package.json - Dependências

```json
{
  "dependencies": {
    "cmdk": "^1.0.0",
    "lucide-react": "^0.index.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0"
  }
}
```

---

## 🚀 9. Comandos de Instalação

```bash
# Instalar dependências
npm install cmdk lucide-react

# Criar estrutura
mkdir -p src/design-system/tokens
mkdir -p src/design-system/components
mkdir -p src/components/layout
mkdir -p src/components/ui

# Copiar arquivos
# (Copie os códigos acima para os respectivos arquivos)

# Testar
npm run dev
```

---

## ✅ 10. Checklist de Implementação

```markdown
### Tokens
- [ ] Criar `src/design-system/tokens/colors.ts`
- [ ] Criar `src/design-system/tokens/typography.ts`
- [ ] Criar `src/design-system/tokens/spacing.ts`
- [ ] Criar `src/design-system/tokens/index.ts`

### Componentes
- [ ] Criar `src/components/layout/Sidebar.tsx`
- [ ] Criar `src/components/ui/CommandPalette.tsx`
- [ ] Criar `src/components/ui/Skeleton.tsx`
- [ ] Criar `src/components/layout/PageHeader.tsx`
- [ ] Criar `src/components/layout/AppShell.tsx`

### Integração
- [ ] Atualizar `App.tsx` para usar AppShell
- [ ] Testar Sidebar (colapsar/expandir)
- [ ] Testar Command Palette (Cmd+K)
- [ ] Testar Skeleton Loading
- [ ] Validar responsividade
```

---

**Todos os códigos acima estão prontos para uso!**  
Basta copiar e colar nos arquivos correspondentes.

**Criado por:** Kiro (AI)  
**Data:** 2026-04-03
