import { Badge } from '@/components/ui/badge';
import StatsCounter from './StatsCounter';

const SocialProofBar = () => {
  return (
    <div className="bg-revgreen/5 border-y border-revgreen/10 py-4">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-center gap-6 text-center">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-revgreen/20 text-revgreen border-revgreen/30">
              ⭐ 4.9/5.0
            </Badge>
            <span className="text-sm text-gray-600">Avaliação média dos clientes</span>
          </div>
          
          <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              📈 <StatsCounter end={320} suffix="%" />
            </Badge>
            <span className="text-sm text-gray-600">Aumento médio em ROI</span>
          </div>
          
          <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              🏆 <StatsCounter end={95} suffix="%" />
            </Badge>
            <span className="text-sm text-gray-600">Taxa de recomendação</span>
          </div>
          
          <div className="h-4 w-px bg-gray-300 hidden md:block"></div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
              ⚡ <StatsCounter end={2} suffix="h" />
            </Badge>
            <span className="text-sm text-gray-600">Tempo de resposta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofBar;