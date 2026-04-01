import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    LayoutDashboard,
    Handshake,
    Zap,
    Users,

    FileText,
    BookOpen,
    Briefcase,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { cn } from '@/lib/utils';

interface MenuItem {
    icon: any;
    label: string;
    path?: string;
    action?: () => void;
    highlight?: boolean;
}

interface SidebarProps {
    isOpen: boolean;
    toggle: () => void;
}

const Sidebar = ({ isOpen, toggle }: SidebarProps) => {
    const location = useLocation();
    const { signOut } = useAuth();

    const isActive = (path?: string) => {
        if (!path) return false;
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin') return location.pathname.startsWith(path);
        return false;
    };

    const renderMenuSection = (title: string, items: MenuItem[]) => (
        <div className="mb-6">
            {isOpen && (
                <h3 className="px-5 text-3xs font-black text-zinc-500 uppercase tracking-[0.25em] mb-4">
                    {title}
                </h3>
            )}
            <div className="space-y-0.5">
                {items.map((item, idx) => {
                    const active = isActive(item.path);
                    const IconComponent = item.icon;

                    return (
                        <div key={idx} className={cn("flex", !isOpen && "justify-center")}>
                            {item.path ? (
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "group flex items-center gap-3 py-2.5 transition-all duration-150 mx-2",
                                        isOpen ? "px-3 w-full" : "px-0 w-10 justify-center",
                                        active
                                            ? "bg-zinc-900 text-revgreen"
                                            : "text-zinc-300 hover:text-white",
                                    )}
                                >
                                    <IconComponent
                                        size={14}
                                        strokeWidth={1.5}
                                        className={cn(
                                            "shrink-0 transition-transform duration-150",
                                            active ? "scale-110" : "group-hover:scale-110"
                                        )}
                                    />
                                    <span className={cn("text-xs font-black uppercase tracking-widest transition-all duration-200 mt-0.5", !isOpen && "hidden w-0 opacity-0")}>
                                        {item.label}
                                    </span>
                                </Link>
                            ) : (
                                <button
                                    onClick={item.action}
                                    className={cn(
                                        "group flex items-center gap-3 py-2.5 transition-all duration-150 mx-2 text-left",
                                        isOpen ? "px-3 w-full" : "px-0 w-10 justify-center",
                                        "text-zinc-300 hover:text-white"
                                    )}
                                >
                                    <IconComponent
                                        size={14}
                                        strokeWidth={1.5}
                                        className="shrink-0 group-hover:scale-110 transition-transform duration-150"
                                    />
                                    <span className={cn("text-xs font-black uppercase tracking-widest transition-all duration-200 mt-0.5", !isOpen && "hidden w-0 opacity-0")}>
                                        {item.label}
                                    </span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <aside
            className={cn(
                "bg-black h-screen fixed left-0 top-0 flex flex-col border-r border-zinc-900 z-40 transition-all duration-300",
                isOpen ? "w-64" : "w-20"
            )}
        >
            <button
                onClick={toggle}
                className="absolute -right-3 top-24 h-6 w-6 bg-zinc-950 text-zinc-400 flex items-center justify-center hover:bg-zinc-900 hover:text-white transition-all cursor-pointer z-50 border border-zinc-800"
            >
                <ChevronLeft size={14} className={cn("transition-transform duration-300", !isOpen && "rotate-180")} />
            </button>

            <div className={cn(
                "h-24 flex items-center transition-all duration-300",
                isOpen ? "px-8 justify-start" : "px-0 justify-center"
            )}>
                <Link to="/admin/dashboard">
                    <img
                        src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                        alt="RevHackers"
                        className={cn("w-auto transition-all", isOpen ? "h-14" : "h-6 invert opacity-50")}
                    />
                </Link>
            </div>

            <nav className="flex-1 py-8 overflow-y-auto">
                {renderMenuSection("Operacional", [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
                    { icon: Handshake, label: 'Cockpit', path: '/admin/proposals' },
                    { icon: Users, label: 'Equipe', path: '/admin/users' }
                ])}

                {renderMenuSection("CMS", [
                    { icon: FileText, label: 'Artigos', path: '/admin/posts' },
                    { icon: BookOpen, label: 'Materiais', path: '/admin/materials' },
                    { icon: Briefcase, label: 'Cases', path: '/admin/cases' }
                ])}

            </nav>

            <div className="p-4 border-t border-zinc-900 space-y-2">
                <Link
                    to="/admin/profile"
                    className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white transition-all"
                >
                    <Settings size={14} strokeWidth={1.5} />
                    {isOpen && <span className="text-xs font-black uppercase tracking-widest mt-0.5">Ajustes</span>}
                </Link>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 transition-all w-full text-left"
                >
                    <LogOut size={14} strokeWidth={1.5} />
                    {isOpen && <span className="text-xs font-black uppercase tracking-widest mt-0.5">Sair</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
