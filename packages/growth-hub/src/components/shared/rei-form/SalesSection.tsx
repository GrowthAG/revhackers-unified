
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ReiFormData } from './types';

interface SalesSectionProps {
  formData: ReiFormData;
  onChange: (name: keyof ReiFormData, value: string) => void;
}

const SalesSection = ({ formData, onChange }: SalesSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="salesChannels" className="text-white">
          Quais são os principais canais de vendas que você utiliza atualmente e que têm melhor desempenho? *
        </Label>
        <Textarea
          id="salesChannels"
          value={formData.salesChannels}
          onChange={(e) => onChange('salesChannels', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Site próprio, marketplace, vendas diretas..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="marketingTools" className="text-white">
          Quais ferramentas de marketing sua empresa utiliza atualmente? *
        </Label>
        <Textarea
          id="marketingTools"
          value={formData.marketingTools}
          onChange={(e) => onChange('marketingTools', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="CRM, automação de marketing, redes sociais..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyAdBudget" className="text-white">
          Qual valor você pretende investir em mídia paga por mês?
        </Label>
        <Input
          id="monthlyAdBudget"
          value={formData.monthlyAdBudget}
          onChange={(e) => onChange('monthlyAdBudget', e.target.value)}
          placeholder="R$ 5.000,00"
          className="bg-gray-900 border-gray-700 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adScheduleRestrictions" className="text-white">
          Existe alguma restrição de horário para seus anúncios serem veiculados? Se sim, qual? (Caso não tenha, apenas responda "Não").
        </Label>
        <Textarea
          id="adScheduleRestrictions"
          value={formData.adScheduleRestrictions}
          onChange={(e) => onChange('adScheduleRestrictions', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[80px]"
          placeholder="Ex: Não veicular aos domingos, apenas horário comercial..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adRegions" className="text-white">
          Em quais regiões seus anúncios devem veicular? *
        </Label>
        <Textarea
          id="adRegions"
          value={formData.adRegions}
          onChange={(e) => onChange('adRegions', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[80px]"
          placeholder="São Paulo, Rio de Janeiro, Brasil todo..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="previousStrategies" className="text-white">
          Já testou alguma estratégia de marketing e vendas? Se sim qual foi mais eficaz?
        </Label>
        <Textarea
          id="previousStrategies"
          value={formData.previousStrategies}
          onChange={(e) => onChange('previousStrategies', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Estratégias testadas e resultados..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sdrCount" className="text-white">Quantos SDRs no time? *</Label>
          <Input
            id="sdrCount"
            value={formData.sdrCount}
            onChange={(e) => onChange('sdrCount', e.target.value)}
            placeholder="Ex: 2, 5, 10..."
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closerCount" className="text-white">Quantos closers no time? *</Label>
          <Input
            id="closerCount"
            value={formData.closerCount}
            onChange={(e) => onChange('closerCount', e.target.value)}
            placeholder="Ex: 1, 3, 5..."
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="currentCrm" className="text-white">Qual seu CRM atual? *</Label>
          <Input
            id="currentCrm"
            value={formData.currentCrm}
            onChange={(e) => onChange('currentCrm', e.target.value)}
            placeholder="Ex: HubSpot, Pipedrive, Salesforce..."
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentMarketingTool" className="text-white">Qual sua ferramenta de marketing? *</Label>
          <Input
            id="currentMarketingTool"
            value={formData.currentMarketingTool}
            onChange={(e) => onChange('currentMarketingTool', e.target.value)}
            placeholder="Ex: RD Station, HubSpot, Mailchimp..."
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default SalesSection;
