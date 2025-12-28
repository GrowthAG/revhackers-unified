
import { AlertTriangle } from 'lucide-react';

interface RedFlagsProps {
    flags: string[];
    title?: string;
}

const RedFlags = ({ flags, title = "Sinais de Alerta: Onde a maioria erra" }: RedFlagsProps) => {
    return (
        <div className="my-16 border-l-4 border-black bg-gray-50 p-8 not-prose rounded-none">
            <h3 className="text-black font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {title}
            </h3>
            <ul className="space-y-4 m-0">
                {flags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed font-mono">
                        <span className="text-black font-bold">[!]</span>
                        {flag}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RedFlags;
