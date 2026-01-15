import { ReactNode, useState } from 'react';
import { PanelRight, X } from 'lucide-react';
import AdminAIChat from '@/pages/admin/AdminAIChat'; // We'll adapt this or create a simplified version
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

interface AIEditorLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    onSave?: () => void;
    saving?: boolean;
    actions?: ReactNode;
    sidebarContent?: ReactNode;
}

const AIEditorLayout = ({ children, title, description, onSave, saving, actions, sidebarContent }: AIEditorLayoutProps) => {
    const [showAI, setShowAI] = useState(false);

    return (
        <div className="flex h-[calc(100vh-60px)] overflow-hidden bg-[#fafafa]">
            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${showAI ? 'w-2/3' : 'w-full'}`}>
                {/* Header */}
                <div className="h-14 border-b border-zinc-200 bg-white px-8 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-[16px] font-semibold text-zinc-900">{title}</h1>
                        {description && <p className="text-[12px] text-zinc-500">{description}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        {actions}

                        <div className="h-6 w-px bg-zinc-200 mx-2" />

                        <button
                            onClick={() => setShowAI(!showAI)}
                            className={`p-2 rounded-lg transition-all ${showAI ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                            title={showAI ? "Ocultar Assistente IA" : "Mostrar Assistente IA"}
                        >
                            <PanelRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto space-y-8 pb-20">
                        {children}
                    </div>
                </div>
            </div>

            {/* AI Assistant Sidebar */}
            <div
                className={`border-l border-zinc-200 bg-white flex flex-col transition-all duration-300 ${showAI ? 'w-[400px] translate-x-0' : 'w-0 translate-x-full opacity-0 overflow-hidden'}`}
            >
                <div className="h-14 border-b border-zinc-100 flex items-center justify-between px-4 shrink-0 bg-white">
                    <span className="text-[13px] font-medium text-zinc-900 flex items-center gap-2">
                        ✨ Assistente RevHackers
                    </span>
                    <button onClick={() => setShowAI(false)} className="text-zinc-400 hover:text-zinc-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Embed logic: Check if sidebarContent is provided, otherwise default to AdminAIChat */}
                <div className="flex-1 overflow-hidden">
                    {sidebarContent ? (
                        sidebarContent
                    ) : (
                        <ErrorBoundary>
                            <AdminAIChat embed />
                        </ErrorBoundary>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIEditorLayout;
