import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

const AppShellInner = ({ children }: { children: React.ReactNode }) => {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <CommandPalette />
      <main
        className={cn(
          'transition-all duration-200 min-h-screen',
          collapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="max-w-7xl mx-auto px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
};
