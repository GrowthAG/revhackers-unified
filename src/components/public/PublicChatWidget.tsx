import { useLocation } from "react-router-dom";
import { MessageSquare, X, Minus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AdminAIChat from "@/pages/admin/AdminAIChat";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export function PublicChatWidget() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Exclusion Logic
    const excludedPaths = [
        '/agendamento',
        '/blog/', // Subpages of blog
        '/materiais/',
        '/cases/',
        '/admin', // Don't show public widget on admin
        '/auth',
        '/p/' // Don't show on Deal Room (it has its own focus)
    ];

    const isExcluded = excludedPaths.some(path => location.pathname.startsWith(path));

    if (isExcluded) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <Card className="w-[380px] h-[600px] shadow-2xl border-zinc-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-zinc-900 text-white p-3 flex items-center justify-between shrink-0">
                        <span className="font-semibold text-sm flex items-center gap-2">
                            <div className="h-2 w-2 bg-[#03FC3B] rounded-full animate-pulse" />
                            RevHackers AI
                        </span>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-zinc-800 text-zinc-400" onClick={() => setIsOpen(false)}>
                                <Minus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 bg-white relative">
                        <ErrorBoundary>
                            <AdminAIChat embed={true} />
                        </ErrorBoundary>
                    </div>
                </Card>
            )}

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 ${isOpen ? 'bg-zinc-800 hover:bg-zinc-900' : 'bg-[#03FC3B] hover:bg-[#02d632] text-black'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </Button>
        </div>
    );
}
