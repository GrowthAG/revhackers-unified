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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-[#0F0F11] border border-white/10 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'form' ? (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-revgreen/10 rounded-full mx-auto mb-4 flex items-center justify-center border border-revgreen/20">
                <IconComponent className="h-8 w-8 text-revgreen" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                {currentMagnet.title}
              </h2>
              <p className="text-gray-400">
                {currentMagnet.subtitle}
              </p>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-white">O que você vai receber:</h3>
              <ul className="space-y-2">
                {currentMagnet.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-300">
                    <div className="h-1.5 w-1.5 bg-revgreen rounded-full mr-3 flex-shrink-0 shadow-[0_0_10px_#03FC3B]"></div>
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
                  className="bg-[#18181b] border-white/10 text-white placeholder-gray-500 focus:border-revgreen focus:ring-revgreen/10 transition-all"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email*"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-[#18181b] border-white/10 text-white placeholder-gray-500 focus:border-revgreen focus:ring-revgreen/10 transition-all"
                  required
                />
              </div>

              <Input
                placeholder="Empresa*"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-[#18181b] border-white/10 text-white placeholder-gray-500 focus:border-revgreen focus:ring-revgreen/10 transition-all"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="bg-[#18181b] border-white/10 text-white focus:ring-revgreen/10 focus:border-revgreen">
                    <SelectValue placeholder="Cargo*" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-white/10 text-white">
                    <SelectItem value="ceo" className="focus:bg-white/10 focus:text-white cursor-pointer">CEO/Fundador</SelectItem>
                    <SelectItem value="cmo" className="focus:bg-white/10 focus:text-white cursor-pointer">CMO/Dir. Marketing</SelectItem>
                    <SelectItem value="sales" className="focus:bg-white/10 focus:text-white cursor-pointer">Dir. Vendas</SelectItem>
                    <SelectItem value="marketing" className="focus:bg-white/10 focus:text-white cursor-pointer">Marketing</SelectItem>
                    <SelectItem value="sales-rep" className="focus:bg-white/10 focus:text-white cursor-pointer">Vendas</SelectItem>
                    <SelectItem value="other" className="focus:bg-white/10 focus:text-white cursor-pointer">Outro</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, employees: value }))}>
                  <SelectTrigger className="bg-[#18181b] border-white/10 text-white focus:ring-revgreen/10 focus:border-revgreen">
                    <SelectValue placeholder="Funcionários*" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#18181b] border-white/10 text-white">
                    <SelectItem value="1-10" className="focus:bg-white/10 focus:text-white cursor-pointer">1-10</SelectItem>
                    <SelectItem value="11-50" className="focus:bg-white/10 focus:text-white cursor-pointer">11-50</SelectItem>
                    <SelectItem value="51-200" className="focus:bg-white/10 focus:text-white cursor-pointer">51-200</SelectItem>
                    <SelectItem value="201-500" className="focus:bg-white/10 focus:text-white cursor-pointer">201-500</SelectItem>
                    <SelectItem value="500+" className="focus:bg-white/10 focus:text-white cursor-pointer">500+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-revgreen hover:bg-white text-black font-bold h-12 text-sm uppercase tracking-wide hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
                <Download className="mr-2 h-4 w-4" />
                Baixar Material Gratuito
              </Button>
            </form>

            {/* Trust elements */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs text-gray-500">
                ✅ Material enviado instantaneamente • ✅ Sem spam
              </p>
              <p className="text-xs text-gray-600">
                Usado por mais de 150 empresas B2B
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-revgreen/10 rounded-full mx-auto mb-6 flex items-center justify-center border border-revgreen/20">
              <Download className="h-8 w-8 text-revgreen" />
            </div>

            <h2 className="text-2xl font-bold mb-4 text-white">
              Material enviado! 🎉
            </h2>

            <p className="text-gray-400 mb-6">
              Verifique sua caixa de entrada (e pasta de spam) para acessar o material.
            </p>

            <div className="bg-revgreen/5 border border-revgreen/20 rounded-lg p-4 mb-6">
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