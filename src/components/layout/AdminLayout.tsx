import { ReactNode, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

interface AdminLayoutProps {
    children: ReactNode;
}

const Breadcrumbs = () => {
    const crumbs = useBreadcrumbs();
    if (crumbs.length <= 1) return null;
    return (
        <nav className="flex items-center gap-1.5 mb-4">
            {crumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    {crumb.to ? (
                        <Link to={crumb.to} className="text-sm text-zinc-400 font-medium hover:text-zinc-900 transition-colors">
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-sm text-zinc-900 font-bold">{crumb.label}</span>
                    )}
                    {i < crumbs.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                </div>
            ))}
        </nav>
    );
};

const AdminLayoutInner = ({ children }: AdminLayoutProps) => {
    const { collapsed } = useSidebar();

    useEffect(() => {
        const cleanup = () => {
            const ghlScript = document.getElementById('ghl-chat-script');
            if (ghlScript) ghlScript.remove();
            document.querySelectorAll('chat-widget').forEach(el => el.remove());
            document.querySelectorAll('[id*="chat-widget"], [class*="chat-widget"], [id*="leadconnector"], [class*="leadconnector"]').forEach(el => el.remove());
            document.querySelectorAll('[id*="tawk"], [id*="intercom"], [id*="drift"], [id*="crisp-chat"]').forEach(el => el.remove());
        };
        cleanup();
        const t1 = setTimeout(cleanup, 1000);
        const t2 = setTimeout(cleanup, 3000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div className="min-h-screen bg-zinc-50 flex relative">
            <Sidebar />
            <CommandPalette />
            <main className={cn(
                'flex-1 min-w-0 overflow-x-hidden min-h-screen transition-all duration-200',
                collapsed ? 'ml-16' : 'ml-64'
            )}>
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <Breadcrumbs />
                    {children}
                </div>
            </main>
            <Toaster />
        </div>
    );
};

/**
 * AdminLayout - Legacy layout component
 * @deprecated Use AppShell instead for new pages
 */
const AdminLayout = ({ children }: AdminLayoutProps) => (
    <SidebarProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
);

export default AdminLayout;
