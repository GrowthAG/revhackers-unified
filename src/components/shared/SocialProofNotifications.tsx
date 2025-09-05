import React, { useState, useEffect } from 'react';
import { Download, Eye, Calendar, TrendingUp, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NotificationData {
  id: string;
  name: string;
  company: string;
  action: 'download' | 'view' | 'booking' | 'roi_calc';
  material?: string;
  timeAgo: string;
  icon: React.ElementType;
}

const mockActivities: NotificationData[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    company: 'TechCorp',
    action: 'download',
    material: 'Guia RevOps B2B 2024',
    timeAgo: '2 min',
    icon: Download
  },
  {
    id: '2',
    name: 'Ana Santos',
    company: 'InnovaTech',
    action: 'booking',
    timeAgo: '5 min',
    icon: Calendar
  },
  {
    id: '3',
    name: 'Roberto Mendes',
    company: 'Growth Solutions',
    action: 'roi_calc',
    timeAgo: '8 min',
    icon: TrendingUp
  },
  {
    id: '4',
    name: 'Mariana Costa',
    company: 'DigitalFlow',
    action: 'download',
    material: 'Checklist de Automação',
    timeAgo: '12 min',
    icon: Download
  },
  {
    id: '5',
    name: 'Pedro Oliveira',
    company: 'ScaleUp Ventures',
    action: 'view',
    material: 'Case Heineken',
    timeAgo: '15 min',
    icon: Eye
  },
  {
    id: '6',
    name: 'Julia Ferreira',
    company: 'B2B Masters',
    action: 'download',
    material: 'Template de ROI',
    timeAgo: '18 min',
    icon: Download
  },
  {
    id: '7',
    name: 'Fernando Lima',
    company: 'Revenue Labs',
    action: 'booking',
    timeAgo: '22 min',
    icon: Calendar
  },
  {
    id: '8',
    name: 'Camila Rocha',
    company: 'Marketing Pro',
    action: 'roi_calc',
    timeAgo: '25 min',
    icon: TrendingUp
  }
];

const getActionText = (action: string, material?: string) => {
  switch (action) {
    case 'download':
      return `baixou ${material || 'um material'}`;
    case 'view':
      return `visualizou ${material || 'um case'}`;
    case 'booking':
      return 'agendou um diagnóstico';
    case 'roi_calc':
      return 'calculou seu ROI';
    default:
      return 'interagiu com o site';
  }
};

interface SocialProofNotificationsProps {
  position?: 'top-right' | 'bottom-right' | 'inline';
  limit?: number;
}

const SocialProofNotifications = ({ 
  position = 'bottom-right', 
  limit = 3 
}: SocialProofNotificationsProps) => {
  const [currentNotifications, setCurrentNotifications] = useState<NotificationData[]>([]);
  const [nextIndex, setNextIndex] = useState(0);

  useEffect(() => {
    // Função para adicionar nova notificação
    const addNotification = () => {
      const newNotification = {
        ...mockActivities[nextIndex % mockActivities.length],
        id: `${Date.now()}-${nextIndex}` // ID único
      };

      setCurrentNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, limit);
        return updated;
      });

      setNextIndex(prev => prev + 1);
    };

    // Adicionar primeira notificação após 2 segundos
    const initialTimer = setTimeout(addNotification, 2000);

    // Adicionar novas notificações a cada 8-15 segundos
    const interval = setInterval(() => {
      addNotification();
    }, Math.random() * 7000 + 8000); // 8-15 segundos aleatório

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [nextIndex, limit]);

  const removeNotification = (id: string) => {
    setCurrentNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Auto-remove notifications after 12 seconds
  useEffect(() => {
    currentNotifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 12000);

      return () => clearTimeout(timer);
    });
  }, [currentNotifications]);

  if (position === 'inline') {
    return (
      <div className="space-y-3">
        {currentNotifications.map((notification, index) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className="animate-slide-in-right animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="p-4 bg-white/95 backdrop-blur-sm border-revgreen/20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-revgreen/10 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-revgreen" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      <span className="font-semibold">{notification.name}</span> da{' '}
                      <span className="text-revgreen">{notification.company}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      {getActionText(notification.action, notification.material)}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {notification.timeAgo}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    );
  }

  const positionClasses = {
    'top-right': 'fixed top-20 right-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50'
  };

  return (
    <div className={`${positionClasses[position]} space-y-3 max-w-sm`}>
      {currentNotifications.map((notification, index) => {
        const Icon = notification.icon;
        const animationClass = position === 'top-right' 
          ? 'animate-fade-in animate-scale-in' 
          : 'animate-slide-in-right animate-fade-in';
          
        return (
          <div
            key={notification.id}
            className={`${animationClass} transform transition-all duration-300 hover:scale-105`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Card className="p-4 bg-white/95 backdrop-blur-sm border-revgreen/20 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-revgreen/20 to-green-200/20 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-revgreen" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    <span className="font-semibold">{notification.name}</span>
                  </p>
                  <p className="text-xs text-revgreen font-medium">
                    {notification.company}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {getActionText(notification.action, notification.material)}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="text-xs text-gray-400">
                    {notification.timeAgo}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default SocialProofNotifications;