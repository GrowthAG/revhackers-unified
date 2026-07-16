
import { AlertTriangle } from 'lucide-react';

interface RedFlagsProps {
    flags: string[];
    title?: string;
}

const RedFlags = ({ flags, title = "Sinais de Alerta: Onde a maioria erra" }: RedFlagsProps) => {
    return (
        <div className="my-16 bg-gray-50 p-8 not-prose border-l-2 border-black/10">
            <h3 className="text-black font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                {title}
            </h3>
            <ul className="space-y-4 m-0">
                {flags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-4 text-gray-600 text-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
                        {flag}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RedFlags;
