import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Sparkles, Bot, Loader2, Plus, LayoutGrid, MessageSquare, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/context/AIContext';
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
    const { agents, sessions, isLoadingAI, selectedAgentId, deleteSession } = useAI();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Sync expansion with selection
    useEffect(() => {
        if (selectedAgentId) {
            setExpandedId(selectedAgentId);
        }
    }, [selectedAgentId]);

    const toggleAgent = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const isActive = (path?: string) => {
        if (!path) return false;
        if (path === '/admin' && location.pathname === '/admin') {
            return true;
        }
        if (path !== '/admin') {
            return location.pathname.startsWith(path);
        }
        return false;
    };

    const renderMenuSection = (title: string, items: MenuItem[]) => (
        <div className="mb-6">
            {isOpen && (
                <h3 className="px-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 transition-opacity duration-300 delay-100">
                    {title}
                </h3>
            )}
            <div className="space-y-0.5">
                {items.map((item, idx) => {
                    const active = isActive(item.path);
                    const IconComponent = item.icon;
                    const isImage = typeof item.icon === 'string';

                    return (
                        <div key={idx} className={cn("flex", !isOpen && "justify-center")}>
                            {item.path ? (
                                <Link
                                    to={item.path}
                                    title={!isOpen ? item.label : undefined}
                                    className={cn(
                                        "group flex items-center gap-2 py-2 rounded-sm transition-all duration-150 mx-2",
                                        isOpen ? "px-3 w-full" : "px-0 w-10 justify-center",
                                        active
                                            ? "bg-zinc-900 text-revgreen"
                                            : "text-zinc-400 hover:bg-zinc-900 hover:text-revgreen",
                                        item.highlight ? "text-revgreen hover:text-white" : ""
                                    )}
                                >
                                    {isImage ? (
                                        <img
                                            src={item.icon}
                                            alt={item.label}
                                            className={cn(
                                                "w-4 h-4 shrink-0 transition-transform duration-150 object-contain",
                                                active ? "scale-105" : "group-hover:scale-105",
                                                active ? "brightness-100 invert-0" : "opacity-50 group-hover:opacity-100"
                                            )}
                                        />
                                    ) : (
                                        <IconComponent
                                            size={16}
                                            strokeWidth={2}
                                            className={cn(
                                                "shrink-0 transition-transform duration-150",
                                                active ? "scale-105" : "group-hover:scale-105"
                                            )}
                                        />
                                    )}
                                    <span className={cn("font-medium transition-all duration-200", !isOpen && "hidden w-0 opacity-0")}>
                                        {item.label}
                                    </span>
                                </Link>
                            ) : (
                                <button
                                    onClick={item.action}
                                    title={!isOpen ? item.label : undefined}
                                    className={cn(
                                        "group flex items-center gap-2 py-2 rounded-sm transition-all duration-150 mx-2 text-left",
                                        isOpen ? "px-3 w-full" : "px-0 w-10 justify-center",
                                        "text-zinc-400 hover:bg-zinc-900 hover:text-revgreen",
                                        item.highlight ? "text-revgreen hover:bg-revgreen/10" : ""
                                    )}
                                >
                                    {isImage ? (
                                        <img
                                            src={item.icon}
                                            alt={item.label}
                                            className="w-4 h-4 shrink-0 transition-transform duration-150 object-contain opacity-70 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <IconComponent
                                            size={16}
                                            strokeWidth={2}
                                            className="shrink-0 group-hover:scale-105 transition-transform duration-150"
                                        />
                                    )}
                                    <span className={cn("font-medium transition-all duration-200", !isOpen && "hidden w-0 opacity-0")}>
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
                "bg-black h-screen fixed left-0 top-0 flex flex-col border-r border-zinc-800 z-50 transition-all duration-300",
                isOpen ? "w-64" : "w-20"
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={toggle}
                className="absolute -right-3 top-24 h-6 w-6 bg-revgreen text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer z-50 border border-black"
                title={isOpen ? "Fechar Sidebar" : "Abrir Sidebar"}
            >
                <ChevronLeft size={14} className={cn("transition-transform duration-300", !isOpen && "rotate-180")} />
            </button>

            {/* Logo */}
            <div className={cn(
                "h-20 flex items-center border-b border-zinc-900/50 transition-all duration-300",
                isOpen ? "px-8 justify-start" : "px-0 justify-center"
            )}>
                <Link to="/admin">
                    <img
                        src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                        alt="RevHackers"
                        className={cn(
                            "w-auto hover:opacity-90 transition-all duration-300",
                            isOpen ? "h-14" : "h-6 opacity-80"
                        )}
                    />
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

                {renderMenuSection("Operacional", [
                    { icon: "https://img.icons8.com/ios/50/ffffff/dashboard.png", label: 'Dashboard', path: '/admin' },
                    { icon: "https://img.icons8.com/ios/50/ffffff/lightning-bolt.png", label: 'Onboarding', path: '/admin/rei' },
                    { icon: "https://img.icons8.com/ios/50/ffffff/user-group-man-man.png", label: 'Clientes', path: '/admin/clients' },
                    { icon: "https://img.icons8.com/ios/50/ffffff/user-shield.png", label: 'Usuários do Time', path: '/admin/users' }
                ])}

                {renderMenuSection("Publishing (CMS)", [
                    { icon: "https://img.icons8.com/ios/50/ffffff/news.png", label: 'Blog Posts', path: '/admin/posts' },
                    { icon: "https://img.icons8.com/ios/50/ffffff/open-book.png", label: 'Materiais Ricos', path: '/admin/materials' },
                    { icon: "https://img.icons8.com/ios/50/ffffff/briefcase.png", label: 'Case Studies', path: '/admin/cases' }
                ])}

                {/* Intelligence (AI) - OpenAI Style Sidebar */}
                <div className="mb-4">
                    {isOpen && (
                        <div className="px-3 mb-2 flex items-center justify-between group/aisection">
                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={10} className="text-zinc-500" />
                                <span>Intelligence</span>
                            </h3>
                            {isLoadingAI && <Loader2 className="w-2.5 h-2.5 animate-spin text-revgreen" />}
                        </div>
                    )}

                    <div className="space-y-0.5">
                        {/* Explorar (Agent Hub Link) */}
                        <div className="px-2">
                            <Link
                                to="/admin/agents"
                                className={cn(
                                    "flex items-center gap-2 py-2 px-3 rounded-[8px] cursor-pointer transition-all",
                                    location.pathname === '/admin/agents'
                                        ? "bg-zinc-900 text-white"
                                        : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
                                )}
                            >
                                <LayoutGrid size={16} className="shrink-0" />
                                {isOpen && <span className="text-[14px] font-bold flex-1">Explorar</span>}
                            </Link>
                        </div>

                        {/* Recent Chats (Global, OpenAI Style) */}
                        {isOpen && (
                            <div className="mt-4 px-3">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Recentes</h4>
                                <div className="space-y-1">
                                    {(sessions || []).slice(0, 8).map(session => {
                                        const agent = agents.find(a => a.id === session.agentId);
                                        const isSelected = location.search.includes(session.id);
                                        return (
                                            <div key={session.id} className="group/session relative">
                                                <Link
                                                    to={`/admin/ai-chat?agent=${session.agentId || 'default'}&session=${session.id}`}
                                                    className={cn(
                                                        "flex items-center gap-2 py-1.5 px-3 rounded-[8px] text-[13px] font-medium transition-all w-full",
                                                        isSelected
                                                            ? "bg-zinc-900 text-white"
                                                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
                                                        isSelected ? "bg-revgreen" : "bg-transparent group-hover/session:bg-zinc-700"
                                                    )} />
                                                    <span className="truncate flex-1 pr-6">{session.title}</span>
                                                </Link>
                                                <button
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (confirm('Excluir esta conversa?')) {
                                                            try {
                                                                await deleteSession(session.id);
                                                            } catch (err) {
                                                                // Error is handled in context
                                                            }
                                                        }
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/session:opacity-100 p-1.5 text-zinc-600 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={12} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {!isOpen && (
                            <div className="flex flex-col items-center gap-4 mt-4">
                                <Link to="/admin/agents" title="Explorar" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg">
                                    <LayoutGrid size={18} />
                                </Link>
                                <div className="w-10 h-[1px] bg-zinc-900" />
                                {sessions.slice(0, 3).map(s => (
                                    <Link key={s.id} to={`/admin/ai-chat?session=${s.id}`} title={s.title} className="p-2 text-zinc-500 hover:text-white">
                                        <MessageSquare size={16} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </nav>

            {/* Bottom Navigation */}
            <div className="p-4 border-t border-zinc-900/50 space-y-1 bg-black flex flex-col items-center">
                <Link
                    to="/admin/settings"
                    title={!isOpen ? "Configurações" : undefined}
                    className={cn(
                        "group flex items-center gap-2 py-2 rounded-sm text-zinc-500 hover:text-white transition-colors",
                        isOpen ? "px-3 w-full" : "px-0 w-10 justify-center"
                    )}
                >
                    <img
                        src="https://img.icons8.com/ios/50/ffffff/settings.png"
                        alt="Configurações"
                        className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                    <span className={cn("font-medium", !isOpen && "hidden")}>Configurações</span>
                </Link>
                <button
                    onClick={() => signOut()}
                    title={!isOpen ? "Sair" : undefined}
                    className={cn(
                        "group flex items-center gap-2 py-2 rounded-sm text-zinc-500 hover:text-red-400 transition-colors",
                        isOpen ? "px-3 w-full" : "px-0 w-10 justify-center text-center"
                    )}
                >
                    <img
                        src="https://img.icons8.com/ios/50/ffffff/exit.png"
                        alt="Sair"
                        className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                    <span className={cn("font-medium", !isOpen && "hidden")}>Sair</span>
                </button>
            </div>
        </aside >
    );
};

export default Sidebar;
