
import { AlertTriangle } from 'lucide-react';

interface RedFlagsProps {
    flags: string[];
    title?: string;
}

const RedFlags = ({ flags, title = "Sinais de Alerta: Onde a maioria erra" }: RedFlagsProps) => {
    return (
        <div className="my-16 bg-red-50 border border-red-100 rounded-xl p-8 not-prose">
            <h3 className="text-red-900 font-bold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {title}
            </h3>
            <ul className="space-y-3 m-0">
                {flags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-3 text-red-800 text-sm">
                        <span className="text-red-500 font-bold">•</span>
                        {flag}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RedFlags;
