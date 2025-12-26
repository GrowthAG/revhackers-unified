
import { Zap } from 'lucide-react';
import { ReactNode } from 'react';

interface StrategicContextProps {
    children: ReactNode;
    label?: string;
}

const StrategicContext = ({ children, label = "Contexto Estratégico" }: StrategicContextProps) => {
    return (
        <div className="pl-6 border-l-2 border-revgreen my-8 not-prose">
            <h4 className="font-bold text-black text-xs uppercase tracking-widest mb-1">{label}</h4>
            <div className="text-gray-600 m-0 text-base leading-relaxed italic">
                {children}
            </div>
        </div>
    );
};

export default StrategicContext;
