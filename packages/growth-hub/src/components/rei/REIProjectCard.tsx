import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            default:
                return <CheckCircle className="h-5 w-5 text-green-600" />;
        }
    };

    const getBorderColor = () => {
        switch (status) {
            case 'overdue':
                return '#fca5a5'; // red-300
            case 'pending':
                return '#fcd34d'; // yellow-300
            default:
                return '#86efac'; // green-300
        }
    };

    return (
        <Card
            className="bg-white border-2 hover:shadow-lg transition-all duration-300 overflow-hidden"
            style={{ borderLeftWidth: '6px', borderLeftColor: getBorderColor() }}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{project.clientName}</h3>
                        <p className="text-sm text-gray-500">{project.clientEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <Badge className={`${getStatusColor(status)} border-0 font-semibold`}>
                            {getStatusText(status)}
                        </Badge>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`rounded-lg p-4 mb-4 border-2 ${status === 'overdue' ? 'bg-red-50 border-red-200' :
                        status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-green-50 border-green-200'
                    }`}>
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`h-5 w-5 ${status === 'overdue' ? 'text-red-600' :
                                status === 'pending' ? 'text-yellow-600' :
                                    'text-green-600'
                            }`} />
                        <p className={`font-semibold ${status === 'overdue' ? 'text-red-900' :
                                status === 'pending' ? 'text-yellow-900' :
                                    'text-green-900'
                            }`}>
                            {getStatusMessage()}
                        </p>
                    </div>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Último REI</span>
                        </div>
                        <p className="text-base font-bold text-gray-900">
                            {project.lastREIDate.toLocaleDateString('pt-BR')}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Próximo REI</span>
                        </div>
                        <p className="text-base font-bold text-gray-900">
                            {formatNextREIDate(project.nextREIDate)}
                        </p>
                    </div>
                </div>

                {/* Quarter Info */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-sm text-gray-600">Período</span>
                    <span className="text-sm font-bold text-gray-900">{project.quarter} {project.year}</span>
                </div>

                {/* Action Button */}
                {(status === 'pending' || status === 'overdue') && (
                    <button
                        onClick={onUpdateClick}
                        className="w-full bg-revgreen text-black font-bold py-3 px-4 rounded-lg hover:bg-revgreen/90 transition-all duration-300 text-sm tracking-wide shadow-sm"
                    >
                        {status === 'overdue' ? 'Atualizar Agora →' : 'Agendar Atualização →'}
                    </button>
                )}
            </div>
        </Card>
    );
};

export default REIProjectCard;
