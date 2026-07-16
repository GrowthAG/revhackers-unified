
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReiFormData } from './types';

interface ResourcesSectionProps {
  formData: ReiFormData;
  onChange: (name: keyof ReiFormData, value: string) => void;
}

const ResourcesSection = ({ formData, onChange }: ResourcesSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="salesCycle" className="text-white">
          Qual é o ciclo de vendas típico do seu produto/serviço, desde o primeiro contato até a finalização? *
        </Label>
        <Textarea
          id="salesCycle"
          value={formData.salesCycle}
          onChange={(e) => onChange('salesCycle', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Descreva as etapas do seu ciclo de vendas..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="leadNurturing" className="text-white">
          Você realiza nutrição de leads e acompanhamento pós vendas? Se sim como é feito?
        </Label>
        <Textarea
          id="leadNurturing"
          value={formData.leadNurturing}
          onChange={(e) => onChange('leadNurturing', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Processos de nutrição e pós-vendas..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="decisionFactors" className="text-white">
          Qual o principal fator de decisão que faz seus clientes fecharem com você? *
        </Label>
        <Textarea
          id="decisionFactors"
          value={formData.decisionFactors}
          onChange={(e) => onChange('decisionFactors', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Principais fatores de decisão..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="growthStrategies" className="text-white">
          Quais são as principais estratégias que você gostaria de explorar para crescer nos próximos meses? *
        </Label>
        <Textarea
          id="growthStrategies"
          value={formData.growthStrategies}
          onChange={(e) => onChange('growthStrategies', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Estratégias de crescimento desejadas..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="marketingMaterials" className="text-white">
          Sua empresa possui materiais de marketing existentes (PDFs, vídeos, apresentações)?
        </Label>
        <Select value={formData.marketingMaterials} onValueChange={(value) => onChange('marketingMaterials', value)}>
          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sim-completo">Sim, temos materiais completos</SelectItem>
            <SelectItem value="sim-basico">Sim, mas são básicos</SelectItem>
            <SelectItem value="nao">Não temos materiais</SelectItem>
            <SelectItem value="parcial">Temos alguns materiais</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kpis" className="text-white">
          Quais métricas ou KPIs você acompanha regularmente? *
        </Label>
        <Textarea
          id="kpis"
          value={formData.kpis}
          onChange={(e) => onChange('kpis', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="ROI, CAC, LTV, taxa de conversão..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="limitations" className="text-white">
          Existe alguma limitação legal ou técnica que a agência precisa estar ciente?
        </Label>
        <Textarea
          id="limitations"
          value={formData.limitations}
          onChange={(e) => onChange('limitations', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[80px]"
          placeholder="Limitações regulamentares, técnicas, orçamentárias..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="approvalProcess" className="text-white">
          Como é o processo de aprovação interno para campanhas e ações? *
        </Label>
        <Textarea
          id="approvalProcess"
          value={formData.approvalProcess}
          onChange={(e) => onChange('approvalProcess', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Descreva o processo de aprovação..."
          required
        />
      </div>
    </div>
  );
};

export default ResourcesSection;
