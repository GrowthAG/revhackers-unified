import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home, LayoutDashboard, Users, FileText,
  Book, Briefcase, ChevronLeft, ChevronRight,
  FolderKanban, Settings, Plug, Target, MessageSquare, Layers,
  type LucideIcon
} from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';

const LOGO_URL = 'https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png';

interface NavItem {
  icon: LucideIcon;
  label: string;
  to: string;
  badgeKey?: 'pipeline' | 'projects';
}

const NAVIGATION: Record<string, NavItem[]> = {
  WORKSPACE: [
    { icon: Home, label: 'Dashboard', to: '/admin' },
    { icon: FolderKanban, label: 'Pipeline', to: '/admin/pipeline' },
    { icon: LayoutDashboard, label: 'Projetos', to: '/admin/projects' },
  ],
  CLIENTES: [
    { icon: Users, label: 'Clientes', to: '/admin/clients' },
    { icon: Layers, label: 'Contas GHL', to: '/admin/contas' },
  ],
  CONTEÚDO: [
    { icon: Book, label: 'Materiais', to: '/admin/materials' },
    { icon: Briefcase, label: 'Cases', to: '/admin/cases' },
  ],
  SISTEMA: [
    { icon: Users, label: 'Usuarios', to: '/admin/users' },
    { icon: Plug, label: 'Integracoes', to: '/admin/integrations' },
    { icon: Target, label: 'Estrategia', to: '/admin/estrategia' },
  ],
};

export const Sidebar = () => {
  const { collapsed, setCollapsed } = useSidebar();
  const location = useLocation();
  const badges = useSidebarBadges();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800',
        'transition-all duration-200 ease-out z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header com Logo */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-zinc-800">
        {!collapsed ? (
          <>
            <Link to="/admin" className="flex items-center gap-2">
              <img 
                src={LOGO_URL}
                alt="RevHackers" 
                className="h-7 w-auto brightness-0 invert opacity-90"
              />
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors"
              aria-label="Colapsar sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors mx-auto"
            aria-label="Expandir sidebar"
          >
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-2 overflow-y-auto h-[calc(100vh-4rem)]">
        {Object.entries(NAVIGATION).map(([section, items]) => (
          <SidebarSection key={section} title={collapsed ? '' : section}>
            {items.map((item) => (
              <SidebarItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
                collapsed={collapsed}
                badge={item.badgeKey ? badges[item.badgeKey] : undefined}
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
  if (!title) return <div className="space-y-0.5">{children}</div>;
  
  return (
    <div className="space-y-0.5 mt-4 first:mt-0">
      <div className="px-3 mb-1">
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
  badge?: number;
}

const SidebarItem = ({ icon: Icon, label, to, active, collapsed, badge }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-1.5 rounded-md',
        'transition-colors duration-150',
        'text-sm font-medium',
        active
          ? 'bg-zinc-800 text-white'
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
        collapsed && 'justify-center'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge != null && badge > 0 && (
            <span className="min-w-[18px] h-[18px] text-[10px] font-black flex items-center justify-center bg-zinc-800 text-zinc-400 px-1 rounded-sm">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
};
