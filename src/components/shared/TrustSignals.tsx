import { Shield, Award, Users, Clock } from 'lucide-react';

const TrustSignals = () => {
  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Dados 100% Seguros</p>
            <p className="text-xs text-gray-600">LGPD Compliance</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Certificações</p>
            <p className="text-xs text-gray-600">Google Partners</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-zinc-700" />
            </div>
            <p className="text-sm font-medium text-gray-900">150+ Clientes</p>
            <p className="text-xs text-gray-600">Empresas B2B</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">5+ Anos</p>
            <p className="text-xs text-gray-600">de Experiência</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;