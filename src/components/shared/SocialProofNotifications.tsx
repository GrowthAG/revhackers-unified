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

interface WordPressMaterial {
  title: { rendered: string };
  excerpt: { rendered: string };
  link_material?: string;
}

const mockNames = [
  { name: 'Carlos Silva', company: 'TechCorp' },
  { name: 'Ana Santos', company: 'InnovaTech' },
  { name: 'Roberto Mendes', company: 'Growth Solutions' },
  { name: 'Mariana Costa', company: 'DigitalFlow' },
  { name: 'Pedro Oliveira', company: 'ScaleUp Ventures' },
  { name: 'Julia Ferreira', company: 'B2B Masters' },
  { name: 'Fernando Lima', company: 'Revenue Labs' },
  { name: 'Camila Rocha', company: 'Marketing Pro' },
  { name: 'Rafael Santos', company: 'SalesForce Pro' },
  { name: 'Luciana Pereira', company: 'ConversionHub' },
  { name: 'Bruno Costa', company: 'GrowthLab' },
  { name: 'Patrícia Lima', company: 'Scale Solutions' }
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

const getRandomTimeAgo = () => {
  const times = ['2 min', '5 min', '8 min', '12 min', '15 min', '18 min', '22 min', '25 min', '28 min', '32 min'];
  return times[Math.floor(Math.random() * times.length)];
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
  const [materials, setMaterials] = useState<WordPressMaterial[]>([]);
  const [nextIndex, setNextIndex] = useState(0);

  // Fetch materiais do WordPress
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('https://materiais.revhackers.com.br/wp-json/wp/v2/posts?_embed');
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error('Erro ao buscar materiais:', error);
        // Fallback para materiais estáticos
        setMaterials([
          { title: { rendered: 'LinkedIn Outreach Revolution' }, excerpt: { rendered: '' } },
          { title: { rendered: 'Timing Sales Playbook' }, excerpt: { rendered: '' } },
          { title: { rendered: 'Como Conseguir Telefone e Email de Qualquer Decisor' }, excerpt: { rendered: '' } }
        ]);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    if (materials.length === 0) return;

    const generateNotification = (): NotificationData => {
      const randomPerson = mockNames[Math.floor(Math.random() * mockNames.length)];
      const actions: { action: NotificationData['action'], icon: React.ElementType }[] = [
        { action: 'download', icon: Download },
        { action: 'view', icon: Eye },
        { action: 'booking', icon: Calendar },
        { action: 'roi_calc', icon: TrendingUp }
      ];
      
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      let material = '';
      if (randomAction.action === 'download' || randomAction.action === 'view') {
        const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
        material = randomMaterial.title.rendered;
      }

      return {
        id: `${Date.now()}-${Math.random()}`,
        name: randomPerson.name,
        company: randomPerson.company,
        action: randomAction.action,
        material: material || undefined,
        timeAgo: getRandomTimeAgo(),
        icon: randomAction.icon
      };
    };

    const addNotification = () => {
      const newNotification = generateNotification();

      setCurrentNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, limit);
        return updated;
      });

      setNextIndex(prev => prev + 1);
    };

    // Primeira notificação após 5 segundos (mais lento)
    const initialTimer = setTimeout(addNotification, 5000);

    // Novas notificações a cada 20-35 segundos (bem mais lento)
    const interval = setInterval(() => {
      addNotification();
    }, Math.random() * 15000 + 20000); // 20-35 segundos

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [materials, limit, nextIndex]);

  const removeNotification = (id: string) => {
    setCurrentNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Auto-remove notifications after 18 seconds (mais tempo de visualização)
  useEffect(() => {
    currentNotifications.forEach(notification => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 18000);

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
              style={{ animationDelay: `${index * 0.2}s` }}
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
            className={`${animationClass} transform transition-all duration-500 hover:scale-105`}
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            <Card className="p-4 bg-white/95 backdrop-blur-sm border-revgreen/20 shadow-xl hover:shadow-2xl transition-shadow duration-500">
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
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
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