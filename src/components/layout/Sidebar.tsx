import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronLeft,
    Sparkles,
    LayoutGrid,
    LayoutDashboard,
    Handshake,
    Zap,
    Users,
    Link2,
    FileText,
    BookOpen,
    Briefcase,
    Settings,
    LogOut,
    Trash2
} from 'lucide-react';
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
    const { sessions, deleteSession, renameSession } = useAI();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState("");

    const isActive = (path?: string) => {
        if (!path) return false;
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin') return location.pathname.startsWith(path);
        return false;
    };

    const handleRename = async (id: string) => {
        if (editingTitle.trim() && editingTitle !== sessions.find(s => s.id === id)?.title) {
            await renameSession(id, editingTitle.trim());
        }
        setExpandedId(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja excluir permanentemente este chat?')) {
            await deleteSession(id);
        }
    };

    const renderMenuSection = (title: string, items: MenuItem[]) => (
        <div className="mb-6">
            {isOpen && (
                <h3 className="px-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">
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
                                        size={16}
                                        strokeWidth={1.5}
                                        className={cn(
                                            "shrink-0 transition-transform duration-150",
                                            active ? "scale-110" : "group-hover:scale-110"
                                        )}
                                    />
                                    <span className={cn("text-[13px] font-bold tracking-tight transition-all duration-200", !isOpen && "hidden w-0 opacity-0")}>
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
                                        size={16}
                                        strokeWidth={1.5}
                                        className="shrink-0 group-hover:scale-110 transition-transform duration-150"
                                    />
                                    <span className={cn("text-[13px] font-bold tracking-tight transition-all duration-200", !isOpen && "hidden w-0 opacity-0")}>
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
                className="absolute -right-3 top-24 h-6 w-6 bg-revgreen text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer z-50 border border-black"
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
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
                    { icon: Handshake, label: 'Deal Rooms', path: '/admin/proposals' },
                    { icon: Zap, label: 'Projetos', path: '/admin/rei' },
                    { icon: Link2, label: 'Integrações', path: '/admin/integrations' },
                    { icon: Users, label: 'Equipe', path: '/admin/users' }
                ])}

                {renderMenuSection("CMS", [
                    { icon: FileText, label: 'Artigos', path: '/admin/posts' },
                    { icon: BookOpen, label: 'Materiais', path: '/admin/materials' },
                    { icon: Briefcase, label: 'Cases', path: '/admin/cases' }
                ])}

                <div className="mb-4">
                    {isOpen && (
                        <div className="px-5 mb-4 flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Sparkles size={10} /> Intelligence
                            </h3>
                        </div>
                    )}

                    <div className="space-y-0.5">
                        <div className="px-2">
                            <Link
                                to="/admin/agents"
                                className={cn(
                                    "flex items-center gap-3 py-2 px-3 transition-all",
                                    location.pathname === '/admin/agents' ? "bg-zinc-900 text-white" : "text-zinc-300 hover:text-white"
                                )}
                            >
                                <LayoutGrid size={16} />
                                {isOpen && <span className="text-[14px] font-bold">Modelos de IA</span>}
                            </Link>
                        </div>

                        {isOpen && (
                            <div className="mt-6 px-5 space-y-2">
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Recentes</h4>
                                {(sessions || []).slice(0, 5).map(session => (
                                    <div key={session.id} className="group/item relative">
                                        {expandedId === session.id ? (
                                            <div className="flex items-center gap-2 py-1">
                                                <input
                                                    autoFocus
                                                    className="bg-zinc-900 border border-zinc-800 text-xs text-white px-2 py-1 rounded w-full outline-none"
                                                    value={editingTitle}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    onBlur={() => handleRename(session.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleRename(session.id);
                                                        if (e.key === 'Escape') setExpandedId(null);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center group/link truncate">
                                                <Link
                                                    to={`/admin/ai-chat?session=${session.id}`}
                                                    className="flex items-center gap-2 py-1 text-[13px] text-zinc-300 hover:text-white transition-all truncate flex-1"
                                                >
                                                    <div className="w-1 h-1 rounded-full bg-zinc-800 flex-shrink-0" />
                                                    <span className="truncate">{session.title}</span>
                                                </Link>

                                                <div className="flex items-center gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity pr-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingTitle(session.title);
                                                            setExpandedId(session.id);
                                                        }}
                                                        className="p-1 hover:text-white text-zinc-600 transition-colors"
                                                    >
                                                        <Settings size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(session.id)}
                                                        className="p-1 hover:text-red-400 text-zinc-600 transition-colors"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-zinc-900 space-y-2">
                <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white transition-all"
                >
                    <Settings size={16} strokeWidth={1.5} />
                    {isOpen && <span className="text-[13px] font-bold">Ajustes</span>}
                </Link>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 transition-all w-full text-left"
                >
                    <LogOut size={16} strokeWidth={1.5} />
                    {isOpen && <span className="text-[13px] font-bold">Sair</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
