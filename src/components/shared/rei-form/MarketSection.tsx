
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReiFormData } from './types';

interface MarketSectionProps {
  formData: ReiFormData;
  onChange: (name: keyof ReiFormData, value: string) => void;
}

const MarketSection = ({ formData, onChange }: MarketSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="challenges" className="text-white">
          Quais são os principais desafios que sua empresa enfrenta ao atender às necessidades do seu cliente? *
        </Label>
        <Textarea
          id="challenges"
          value={formData.challenges}
          onChange={(e) => onChange('challenges', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Principais desafios enfrentados..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="differentiation" className="text-white">
          Como seu produto/serviço se diferencia dos seus concorrentes? *
        </Label>
        <Textarea
          id="differentiation"
          value={formData.differentiation}
          onChange={(e) => onChange('differentiation', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Principais diferenciais competitivos..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="competitors" className="text-white">
          Quais são os concorrentes diretos da sua empresa? *
        </Label>
        <Textarea
          id="competitors"
          value={formData.competitors}
          onChange={(e) => onChange('competitors', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Liste seus principais concorrentes..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="marketTrends" className="text-white">
          Quais são as tendências ou mudanças no mercado que podem afetar a decisão de compra do seu cliente? *
        </Label>
        <Textarea
          id="marketTrends"
          value={formData.marketTrends}
          onChange={(e) => onChange('marketTrends', e.target.value)}
          className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
          placeholder="Tendências de mercado relevantes..."
          required
        />
      </div>
    </div>
  );
};

export default MarketSection;
