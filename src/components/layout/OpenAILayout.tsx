import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OpenAILayoutProps {
    children: ReactNode;
    sidebar?: ReactNode;
    sidebarTitle?: string;
    newButtonText?: string;
    newButtonLink?: string;
    onNew?: () => void;
}

export const OpenAILayout = ({
    children,
    sidebar,
    sidebarTitle,
    newButtonText,
    newButtonLink,
    onNew
}: OpenAILayoutProps) => {
    return (
        <div className="h-screen flex bg-[#fafafa]">
            {/* Sidebar */}
            {(sidebar || newButtonText) && (
                <div className="w-60 border-r border-zinc-100 flex flex-col">
                    {/* New Button */}
                    {newButtonText && (
                        <div className="p-3">
                            {newButtonLink ? (
                                <Link
                                    to={newButtonLink}
                                    className="flex items-center gap-2 w-full px-3 py-2.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> {newButtonText}
                                </Link>
                            ) : (
                                <button
                                    onClick={onNew}
                                    className="flex items-center gap-2 w-full px-3 py-2.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> {newButtonText}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Title */}
                    {sidebarTitle && (
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 mt-2 px-5">
                            {sidebarTitle}
                        </p>
                    )}

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto px-3">
                        {sidebar}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
};

// Reusable Sidebar Item
interface SidebarItemProps {
    icon?: ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
}

export const SidebarItem = ({ icon, label, active, onClick, onDelete }: SidebarItemProps) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-all ${active ? 'bg-white shadow-sm' : 'hover:bg-white/60'
            }`}
    >
        {icon && <span className="text-zinc-400">{icon}</span>}
        <span className="text-[12px] text-zinc-600 truncate flex-1">{label}</span>
        {onDelete && (
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-400 transition-opacity text-xs"
            >
                ×
            </button>
        )}
    </div>
);

// Card Component
interface CardProps {
    children: ReactNode;
    className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => (
    <div className={`bg-white rounded-xl border border-zinc-200 ${className}`}>
        {children}
    </div>
);

// Input styled
interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const StyledInput = ({ className = '', ...props }: StyledInputProps) => (
    <input
        {...props}
        className={`w-full px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 bg-white border border-zinc-200 rounded-2xl outline-none focus:border-zinc-300 transition-all ${className}`}
    />
);

// Button styled
interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: ReactNode;
}

export const StyledButton = ({ variant = 'primary', children, className = '', ...props }: StyledButtonProps) => (
    <button
        {...props}
        className={`px-4 py-2.5 text-[13px] font-medium rounded-xl transition-all ${variant === 'primary'
                ? 'bg-zinc-900 hover:bg-black text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
            } ${className}`}
    >
        {children}
    </button>
);
