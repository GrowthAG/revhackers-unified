
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReiFormData } from './types';

interface CustomerSectionProps {
  formData: ReiFormData;
  onChange: (name: keyof ReiFormData, value: string) => void;
}

const CustomerSection = ({ formData, onChange }: CustomerSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="whereCustomersSearch" className="text-white">
          Onde seu potencial cliente procura respostas para o problema que sua empresa resolve? *
        </Label>
        <Textarea
          id="whereCustomersSearch"
          value={formData.whereCustomersSearch}
          onChange={(e) => onChange('whereCustomersSearch', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Google, redes sociais, fóruns, indicações..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="problemCauses" className="text-white">
          O que causa os problemas dos seus clientes? *
        </Label>
        <Textarea
          id="problemCauses"
          value={formData.problemCauses}
          onChange={(e) => onChange('problemCauses', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Principais causas dos problemas..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerLocations" className="text-white">
          Quais são os locais que seu cliente frequenta e onde ele está propenso a te escutar? *
        </Label>
        <Textarea
          id="customerLocations"
          value={formData.customerLocations}
          onChange={(e) => onChange('customerLocations', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Eventos, grupos online, redes sociais específicas..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="keywords" className="text-white">
          Quais são as principais palavras chave que seus clientes procuram ao buscarem sua solução? *
        </Label>
        <Textarea
          id="keywords"
          value={formData.keywords}
          onChange={(e) => onChange('keywords', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="palavra-chave 1, palavra-chave 2, palavra-chave 3..."
          required
        />
      </div>
    </div>
  );
};

export default CustomerSection;
