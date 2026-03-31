import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/toaster';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Remove any chat widgets that may have been loaded from the public site
    useEffect(() => {
        const cleanup = () => {
            // GHL chat widget
            const ghlScript = document.getElementById('ghl-chat-script');
            if (ghlScript) ghlScript.remove();
            document.querySelectorAll('chat-widget').forEach(el => el.remove());
            // Generic chat widget iframes/containers
            document.querySelectorAll('[id*="chat-widget"], [class*="chat-widget"], [id*="leadconnector"], [class*="leadconnector"]').forEach(el => el.remove());
            // Tawk, Intercom, Drift, Crisp or other third-party chat bubbles
            document.querySelectorAll('[id*="tawk"], [id*="intercom"], [id*="drift"], [id*="crisp-chat"]').forEach(el => el.remove());
        };
        cleanup();
        // Run again after a delay in case widgets load async
        const t1 = setTimeout(cleanup, 1000);
        const t2 = setTimeout(cleanup, 3000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    return (
        <div className="min-h-screen bg-white flex relative bg-grain">
            <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className={`flex-1 min-w-0 overflow-x-hidden min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {children}
            </main>
            <Toaster />
        </div>
    );
};

export default AdminLayout;
