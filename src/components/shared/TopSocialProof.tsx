import React, { useState, useEffect } from 'react';
import { Download, Eye, Calendar, TrendingUp, X } from 'lucide-react';

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

const realCompanies = [
  { name: 'Carlos Silva', company: 'Heineken' },
  { name: 'Ana Santos', company: 'FMU Virtual' },
  { name: 'Roberto Mendes', company: 'TOEFL' },
  { name: 'Mariana Costa', company: 'Placlux' },
  { name: 'Pedro Oliveira', company: 'Enics' },
  { name: 'Fernando Lima', company: 'Datavoxx' },
  { name: 'Camila Rocha', company: 'Agence MR' },
  { name: 'Rafael Santos', company: 'Emagrecentro' },
  { name: 'Luciana Pereira', company: 'Anhembi Morumbi' },
  { name: 'Bruno Costa', company: 'BLDN Digital' },
  { name: 'Patrícia Lima', company: 'Funnels Brasil' }
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
  const times = ['3 min', '7 min', '12 min', '18 min', '25 min', '32 min'];
  return times[Math.floor(Math.random() * times.length)];
};

const TopSocialProof = () => {
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const [materials, setMaterials] = useState<WordPressMaterial[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const closeNotification = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentNotification(null);
    }, 300);
  };

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
      const randomPerson = realCompanies[Math.floor(Math.random() * realCompanies.length)];
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

    const showNotification = () => {
      const newNotification = generateNotification();
      setCurrentNotification(newNotification);
      setIsVisible(true);

      // Hide notification after 20 seconds
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentNotification(null);
        }, 500); // Wait for fade out animation
      }, 20000);
    };

    // First notification after 15 seconds
    const initialTimer = setTimeout(showNotification, 15000);

    // New notification every 60 seconds (1 minute)
    const interval = setInterval(() => {
      showNotification();
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [materials]);

  if (!currentNotification) return null;

  const Icon = currentNotification.icon;

  return (
    <div className={`fixed top-20 right-2 md:right-4 z-40 transition-all duration-500 transform ${
      isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
    }`}>
      <div className="bg-white border-2 border-zinc-100 rounded-xl shadow-sm p-3 md:p-4 max-w-xs md:max-w-sm mx-2 relative">
        {/* Botão X para fechar */}
        <button
          onClick={closeNotification}
          className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 transition-colors p-1 hover:bg-zinc-100 rounded-full"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3 pr-6">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm md:text-base font-bold text-zinc-900 truncate">
                {currentNotification.name}
              </p>
            </div>
            <p className="text-xs md:text-sm text-green-700 font-semibold mb-1">
              {currentNotification.company}
            </p>
            <p className="text-xs md:text-sm text-zinc-700 leading-relaxed font-medium">
              {getActionText(currentNotification.action, currentNotification.material)}
            </p>
            <p className="text-xs text-zinc-500 font-medium mt-2">
              {currentNotification.timeAgo}
            </p>
          </div>
        </div>
        
        {/* Progress bar showing time remaining */}
        <div className="mt-3 w-full bg-zinc-100 rounded-full h-1.5">
          <div 
            className="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
            style={{
              width: '100%',
              animation: 'shrinkProgress 20s linear forwards'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopSocialProof;