
import { ShieldCheck } from 'lucide-react';

interface Takeaway {
    title: string;
    description: string;
}

interface KeyTakeawaysProps {
    items: Takeaway[];
    title?: string;
}

const KeyTakeaways = ({ items, title = "Key Takeaways" }: KeyTakeawaysProps) => {
    return (
        <div className="my-12 not-prose">
            <h3 className="flex items-center gap-2 text-xs font-bold text-revgreen uppercase tracking-widest mb-6">
                <ShieldCheck className="w-4 h-4" />
                {title}
            </h3>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 border-t border-gray-100 pt-6">
                {items.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start group">
                        <span className="text-xs font-bold text-gray-300 mt-1">
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                            <strong className="block text-gray-900 text-sm mb-1">{item.title}</strong>
                            <p className="text-gray-500 text-sm leading-relaxed m-0">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KeyTakeaways;
