import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface AdminPageLayoutProps {
    title: string;
    description?: string;
    backTo?: string;
    backLabel?: string;
    actions?: ReactNode;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    showBackButton?: boolean;
}

const AdminPageLayout = ({
    title,
    description,
    backTo = '/admin/rei',
    backLabel = 'Voltar ao Hub',
    actions,
    children,
    maxWidth = '7xl',
    showBackButton = true
}: AdminPageLayoutProps) => {
    const navigate = useNavigate();

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full'
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-20 transition-colors duration-300 relative bg-grain">
            <div className={`container mx-auto px-12 ${maxWidthClasses[maxWidth]}`}>
                {/* Header - Hyper Minimalist Surgical Standard */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-16">
                        {showBackButton ? (
                            <button
                                onClick={() => navigate(backTo)}
                                className="text-zinc-400 hover:text-black text-xs font-medium tracking-tight transition-all flex items-center gap-2 group"
                            >
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1} />
                                {backLabel}
                            </button>
                        ) : <div></div>}
                        <div className="flex items-center gap-6">
                            {actions}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-zinc-500 font-medium tracking-tight max-w-2xl leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminPageLayout;
