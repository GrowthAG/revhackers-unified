
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReiFormData } from './types';

interface ProductSectionProps {
  formData: ReiFormData;
  onChange: (name: keyof ReiFormData, value: string) => void;
}

const ProductSection = ({ formData, onChange }: ProductSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="expectedResults" className="text-white">
          Quais resultados você espera alcançar nos próximos 12 meses? *
        </Label>
        <Textarea
          id="expectedResults"
          value={formData.expectedResults}
          onChange={(e) => onChange('expectedResults', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Descreva seus objetivos e metas..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="solution" className="text-white">
          Qual é a solução (produto/serviço) que sua empresa oferece? *
        </Label>
        <Textarea
          id="solution"
          value={formData.solution}
          onChange={(e) => onChange('solution', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Descreva detalhadamente sua solução..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hasPlans" className="text-white">
          Seu produto/serviço tem planos ou pacotes? *
        </Label>
        <Select value={formData.hasPlans} onValueChange={(value) => onChange('hasPlans', value)}>
          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sim">Sim, temos diferentes planos/pacotes</SelectItem>
            <SelectItem value="nao">Não, oferecemos apenas uma opção</SelectItem>
            <SelectItem value="personalizado">Oferecemos soluções personalizadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="advantages" className="text-white">
          Cite pelo menos 3 vantagens que seus produtos/serviços têm em relação aos concorrentes *
        </Label>
        <Textarea
          id="advantages"
          value={formData.advantages}
          onChange={(e) => onChange('advantages', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[120px]"
          placeholder="1. Primeira vantagem...&#10;2. Segunda vantagem...&#10;3. Terceira vantagem..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetAudience" className="text-white">
          Para quem é o seu produto ou serviço (público-alvo)? *
        </Label>
        <Textarea
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => onChange('targetAudience', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Descreva seu público-alvo..."
          required
        />
      </div>
    </div>
  );
};

export default ProductSection;
