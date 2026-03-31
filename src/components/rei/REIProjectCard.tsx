import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
    REIProject,
    getDaysUntilNextREI,
    getREIStatus,
    formatNextREIDate,
    getStatusColor,
    getStatusText
} from '@/lib/reiQuarterlySystem';

interface REIProjectCardProps {
    project: REIProject;
    onUpdateClick?: () => void;
}

const REIProjectCard = ({ project, onUpdateClick }: REIProjectCardProps) => {
    const [daysUntil, setDaysUntil] = useState(getDaysUntilNextREI(project.nextREIDate));
    const [status, setStatus] = useState(getREIStatus(project.nextREIDate));

    useEffect(() => {
        const interval = setInterval(() => {
            setDaysUntil(getDaysUntilNextREI(project.nextREIDate));
            setStatus(getREIStatus(project.nextREIDate));
        }, 60000);

        return () => clearInterval(interval);
    }, [project.nextREIDate]);

    const getStatusMessage = () => {
        const absDays = Math.abs(daysUntil);

        if (status === 'overdue') {
            if (absDays === 0) return 'REI venceu hoje';
            if (absDays === 1) return 'REI venceu ontem';
            return `REI venceu há ${absDays} dias`;
        }

        if (status === 'pending') {
            if (daysUntil <= 7) return `REI vence em ${daysUntil} dias`;
            if (daysUntil <= 14) return `REI vence em ${daysUntil} dias`;
            return `Próximo REI em ${daysUntil} dias`;
        }

        return `Próxima renovação em ${daysUntil} dias`;
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'overdue':
                return <AlertTriangle className="h-5 w-5 text-zinc-900" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-zinc-500" />;
            default:
                return <CheckCircle className="h-5 w-5 text-zinc-400" />;
        }
    };

    const getBorderColor = () => {
        switch (status) {
            case 'overdue':
                return '#18181b'; // zinc-900
            case 'pending':
                return '#a1a1aa'; // zinc-400
            default:
                return '#03FC3B'; // revgreen
        }
    };

    return (
        <Card
            className="bg-white border-2 transition-all duration-300 overflow-hidden"
            style={{ borderLeftWidth: '6px', borderLeftColor: getBorderColor() }}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                            {project.clientName}
                        </h3>
                        {project.clientCompany && project.clientCompany !== project.clientName && (
                            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-1 mb-1.5">
                                {project.clientCompany}
                            </p>
                        )}
                        <p className="text-sm text-zinc-500">{project.clientEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <span className="text-xxs font-black uppercase tracking-widest bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5">
                            {getStatusText(status)}
                        </span>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`p-4 mb-4 border-2 ${
                        status === 'overdue' ? 'bg-zinc-900 border-zinc-800' :
                        status === 'pending' ? 'bg-zinc-100 border-zinc-300' :
                            'bg-[#03FC3B]/10 border-[#03FC3B]/40'
                    }`}>
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`h-5 w-5 ${
                                status === 'overdue' ? 'text-white' :
                                status === 'pending' ? 'text-zinc-600' :
                                    'text-zinc-900'
                            }`} />
                        <p className={`font-semibold ${
                                status === 'overdue' ? 'text-white' :
                                status === 'pending' ? 'text-zinc-700' :
                                    'text-zinc-900'
                            }`}>
                            {getStatusMessage()}
                        </p>
                    </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-zinc-50 p-4 border border-zinc-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-zinc-500" />
                            <span className="text-xs text-zinc-600 font-semibold uppercase tracking-wide">Último REI</span>
                        </div>
                        <p className="text-base font-bold text-zinc-900">
                            {project.lastREIDate.toLocaleDateString('pt-BR')}
                        </p>
                    </div>

                    <div className="bg-zinc-50 p-4 border border-zinc-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-zinc-500" />
                            <span className="text-xs text-zinc-600 font-semibold uppercase tracking-wide">Próximo REI</span>
                        </div>
                        <p className="text-base font-bold text-zinc-900">
                            {formatNextREIDate(project.nextREIDate)}
                        </p>
                    </div>
                </div>

                {/* Quarter Info */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-sm text-zinc-600">Período</span>
                    <span className="text-sm font-bold text-zinc-900">{project.quarter} {project.year}</span>
                </div>

                {/* Action Button */}
                {(status === 'pending' || status === 'overdue') && (
                    <button
                        onClick={onUpdateClick}
                        className="w-full bg-revgreen text-black font-bold py-3 px-4 hover:bg-revgreen/90 transition-all duration-300 text-sm tracking-widest uppercase"
                    >
                        {status === 'overdue' ? 'Atualizar Agora →' : 'Agendar Atualização →'}
                    </button>
                )}
            </div>
        </Card>
    );
};

export default REIProjectCard;
