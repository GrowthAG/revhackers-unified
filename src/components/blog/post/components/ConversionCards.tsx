
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
        switch (type) {
            case 'danger': return <XCircle className="w-8 h-8 text-red-500 mb-4" />;
            case 'success': return <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />;
            case 'warning': return <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />;
            case 'info': return <Zap className="w-8 h-8 text-revgreen mb-4" />;
            default: return <XCircle className="w-8 h-8 text-red-500 mb-4" />;
        }
    };

    const getBgColor = (type?: string) => {
        switch (type) {
            case 'danger': return 'bg-red-50/50 border-red-100 hover:border-red-200';
            case 'success': return 'bg-green-50/50 border-green-100 hover:border-green-200';
            case 'warning': return 'bg-amber-50/50 border-amber-100 hover:border-amber-200';
            default: return 'bg-gray-50/50 border-gray-100 hover:border-gray-200';
        }
    };

    return (
        <div className="my-12 not-prose">
            {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
            <div className="grid md:grid-cols-3 gap-6">
                {items.map((item, i) => (
                    <Card
                        key={i}
                        className={`p-6 transition-colors shadow-sm cursor-pointer ${getBgColor(item.type)}`}
                        onClick={onCTAClick}
                    >
                        {getIcon(item.type)}
                        <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                        {item.fix && (
                            <div className="text-xs bg-white p-2 rounded border border-gray-100 text-gray-700 font-medium flex gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                {item.fix}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ConversionCards;
