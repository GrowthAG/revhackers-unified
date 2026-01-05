import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/toaster';
import ChatbotManager from '../shared/ChatbotManager';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-white flex relative bg-grain">
            <ChatbotManager />
            <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className={`flex-1 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {children}
            </main>
            <Toaster />
        </div>
    );
};

export default AdminLayout;
