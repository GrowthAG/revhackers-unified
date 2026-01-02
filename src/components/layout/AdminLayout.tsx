import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/toaster';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex relative">
            <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className={`flex-1 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {children}
            </main>
            <Toaster />
        </div>
    );
};

export default AdminLayout;
