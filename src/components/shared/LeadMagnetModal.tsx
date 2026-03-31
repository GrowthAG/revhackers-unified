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
    setStep('success');

    // Auto close after 5 seconds
    setTimeout(() => {
      onClose();
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-[#0F0F11] border border-white/10 shadow-sm relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
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
              <p className="text-zinc-400">
                {currentMagnet.subtitle}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xxs font-bold mb-4 text-white uppercase tracking-widest">CONTEÚDO DO MATERIAL:</h3>
              <ul className="space-y-3">
                {currentMagnet.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-tiny text-zinc-400 uppercase tracking-widest font-medium">
                    <div className="h-1 w-1 bg-revgreen mr-4 flex-shrink-0"></div>
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
                  className="bg-[#18181b] border-white/10 text-white placeholder-zinc-500 focus:border-revgreen focus:ring-revgreen/10 transition-all"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email*"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-[#18181b] border-white/10 text-white placeholder-zinc-500 focus:border-revgreen focus:ring-revgreen/10 transition-all"
                  required
                />
              </div>

              <Input
                placeholder="Empresa*"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-[#18181b] border-white/10 text-white placeholder-zinc-500 focus:border-revgreen focus:ring-revgreen/10 transition-all"
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
            <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-2">
              <p className="text-2xs text-zinc-500 font-bold uppercase tracking-[0.2em]">
                TRANSFERÊNCIA SEGURA • INFRAESTRUTURA ANTI-SPAM
              </p>
              <p className="text-2xs text-zinc-700 font-bold uppercase tracking-[0.2em]">
                UTILIZADO POR OPERAÇÕES DE ALTA PERFORMANCE
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-revgreen/10 rounded-full mx-auto mb-6 flex items-center justify-center border border-revgreen/20">
              <Download className="h-8 w-8 text-revgreen" />
            </div>

            <h2 className="text-2xl font-black mb-4 text-white uppercase tracking-tighter">
              MATERIAL ENVIADO
            </h2>

            <p className="text-zinc-500 text-xxs font-bold uppercase tracking-widest mb-8">
              Verifique sua caixa de entrada para acessar os dados solicitados.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-none p-4 mb-8">
              <p className="text-xxs text-revgreen font-bold uppercase tracking-widest">
                DESTINATÁRIO: {formData.email}
              </p>
            </div>

            <p className="text-2xs text-zinc-600 font-bold uppercase tracking-[0.3em]">
              SISTEMA DE ENTREGA AUTOMATIZADO
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeadMagnetModal;