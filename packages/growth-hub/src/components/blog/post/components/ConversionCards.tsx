
import React from 'react';
import { Card } from '@/components/ui/card';
import { XCircle, CheckCircle2, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

interface CardItem {
    title: string;
    description: string;
    fix?: string;
    type?: 'danger' | 'success' | 'warning' | 'info';
}

interface ConversionCardsProps {
    title?: string;
    items: CardItem[];
    onCTAClick?: () => void;
}

const ConversionCards = ({ title, items, onCTAClick }: ConversionCardsProps) => {
    const getIcon = (type?: string) => {
        const iconClasses = "w-6 h-6 text-black mb-6";
        switch (type) {
            case 'danger': return <XCircle className={iconClasses} />;
            case 'success': return <CheckCircle2 className={iconClasses} />;
            case 'warning': return <AlertTriangle className={iconClasses} />;
            case 'info': return <Zap className={iconClasses} />;
            default: return <XCircle className={iconClasses} />;
        }
    };

    return (
        <div className="my-16 not-prose">
            {title && (
                <h2 className="text-2xl font-black text-black tracking-tighter uppercase mb-10 border-l-4 border-revgreen pl-6">
                    {title}
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-100">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="p-8 border-r border-b md:border-b-0 last:border-r-0 border-zinc-100 bg-white hover:bg-zinc-50 transition-colors cursor-pointer group"
                        onClick={onCTAClick}
                    >
                        {getIcon(item.type)}
                        <h3 className="text-[13px] font-bold text-black uppercase tracking-widest mb-4">{item.title}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed mb-6 font-medium">{item.description}</p>
                        {item.fix && (
                            <div className="pt-4 border-t border-zinc-100">
                                <span className="text-[10px] font-bold text-revgreen uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" />
                                    AÇÃO: {item.fix}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConversionCards;
