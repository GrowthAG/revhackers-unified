import { useState, useEffect } from 'react';
import { X, Download, CheckCircle, FileText, Calculator, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadMagnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  magnet: 'checklist' | 'roi-calculator' | 'template' | 'guide';
}

const leadMagnets = {
  checklist: {
    title: 'Checklist RevOps Completo',
    subtitle: '47 pontos essenciais para otimizar seu funil',
    icon: CheckCircle,
    benefits: [
      'Auditoria completa do seu funil atual',
      'Checklist de 47 pontos de otimização',
      'Métricas essenciais para acompanhar',
      'Template de relatório executivo'
    ]
  },
  'roi-calculator': {
    title: 'Calculadora de ROI B2B',
    subtitle: 'Planilha completa para medir retorno',
    icon: Calculator,
    benefits: [
      'Cálculo automático de ROI por canal',
      'Projeções de crescimento',
      'Análise de CAC e LTV',
      'Dashboard visual de resultados'
    ]
  },
  template: {
    title: 'Templates de Automação',
    subtitle: 'Fluxos prontos para implementar',
    icon: FileText,
    benefits: [
      '12 templates de email marketing',
      'Fluxos de nutrição segmentados',
      'Sequências de onboarding',
      'Scripts de vendas testados'
    ]
  },
  guide: {
    title: 'Guia Completo de RevOps',
    subtitle: 'Metodologia completa em 50 páginas',
    icon: Users,
    benefits: [
      'Estratégia completa de implementação',
      'Cases reais com resultados',
      'Framework de métricas',
      'Roadmap de 90 dias'
    ]
  }
};

const LeadMagnetModal = ({ isOpen, onClose, magnet }: LeadMagnetModalProps) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    employees: '',
    challenge: ''
  });

  const currentMagnet = leadMagnets[magnet];
  const IconComponent = currentMagnet.icon;

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormData({
        name: '',
        email: '',
        company: '',
        role: '',
        employees: '',
        challenge: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the data to your backend
    console.log('Lead magnet form submitted:', { ...formData, magnet });
    setStep('success');
    
    // Auto close after 5 seconds
    setTimeout(() => {
      onClose();
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'form' ? (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-revgreen/20 to-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <IconComponent className="h-8 w-8 text-revgreen" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                {currentMagnet.title}
              </h2>
              <p className="text-gray-600">
                {currentMagnet.subtitle}
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-900">O que você vai receber:</h3>
              <ul className="space-y-2">
                {currentMagnet.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                    <div className="h-2 w-2 bg-revgreen rounded-full mr-3 flex-shrink-0"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Nome*"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email*"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <Input
                placeholder="Empresa*"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cargo*" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO/Fundador</SelectItem>
                    <SelectItem value="cmo">CMO/Dir. Marketing</SelectItem>
                    <SelectItem value="sales">Dir. Vendas</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales-rep">Vendas</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, employees: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Funcionários*" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full bg-revgreen hover:bg-revgreen/90 text-white">
                <Download className="mr-2 h-4 w-4" />
                Baixar Material Gratuito
              </Button>
            </form>

            {/* Trust elements */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs text-gray-500">
                ✅ Material enviado instantaneamente • ✅ Sem spam
              </p>
              <p className="text-xs text-gray-400">
                Usado por mais de 150 empresas B2B
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-green-800">
              Material enviado! 🎉
            </h2>
            
            <p className="text-gray-600 mb-6">
              Verifique sua caixa de entrada (e pasta de spam) para acessar o material.
            </p>
            
            <div className="bg-revgreen/10 rounded-lg p-4 mb-6">
              <p className="text-sm text-revgreen font-medium">
                📧 Enviado para: {formData.email}
              </p>
            </div>
            
            <p className="text-sm text-gray-500">
              Prepare-se para transformar seus resultados! 🚀
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeadMagnetModal;