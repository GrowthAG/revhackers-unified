import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

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
    backTo = '/dashboard',
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
        <div className="min-h-screen bg-white pt-32 pb-20 transition-colors duration-300">
            <div className={`container mx-auto px-4 ${maxWidthClasses[maxWidth]}`}>
                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-12">
                        {showBackButton ? (
                            <Button
                                variant="outline"
                                onClick={() => navigate(backTo)}
                                className="border-black bg-white text-black hover:bg-black hover:text-white rounded-none shadow-none transition-all text-[10px] font-black uppercase tracking-[0.3em] px-6 h-10"
                            >
                                <ArrowLeft className="mr-3 h-3.5 w-3.5 stroke-[3]" /> {backLabel}
                            </Button>
                        ) : <div></div>}
                        <div className="flex items-center gap-3">
                            <ModeToggle />
                            {actions}
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-black mb-6 uppercase tracking-[0.1em] transition-colors">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-xs text-zinc-400 max-w-2xl uppercase tracking-[0.2em] font-medium leading-loose transition-colors">
                            {description}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div>
                    {children}
                </div>
            </div>
        </div >
    );
};

export default AdminPageLayout;
