
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReiFormData } from './types';

interface ProblemSectionProps {
  formData: ReiFormData;
  onChange: (name: keyof ReiFormData, value: string) => void;
}

const ProblemSection = ({ formData, onChange }: ProblemSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="idealCustomerProfiles" className="text-white">
          Liste e descreva os perfis ideais dos seus clientes *
        </Label>
        <Textarea
          id="idealCustomerProfiles"
          value={formData.idealCustomerProfiles}
          onChange={(e) => onChange('idealCustomerProfiles', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[120px]"
          placeholder="Perfil 1: ...&#10;Perfil 2: ...&#10;Perfil 3: ..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="demographicProfile" className="text-white">
          Qual é o perfil demográfico do seu cliente ideal? *
        </Label>
        <Textarea
          id="demographicProfile"
          value={formData.demographicProfile}
          onChange={(e) => onChange('demographicProfile', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Idade, gênero, localização, renda, escolaridade..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recurringProblems" className="text-white">
          Quais problemas mais recorrentes sua empresa resolve? *
        </Label>
        <Textarea
          id="recurringProblems"
          value={formData.recurringProblems}
          onChange={(e) => onChange('recurringProblems', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Liste os principais problemas que você resolve..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPains" className="text-white">
          Quando alguém procura sua empresa, quais dores ele(a) mais tem? *
        </Label>
        <Textarea
          id="customerPains"
          value={formData.customerPains}
          onChange={(e) => onChange('customerPains', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Descreva as principais dores dos clientes..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="consequencesOfNotBuying" className="text-white">
          O que seu cliente em potencial perde caso não compre seu produto/serviço? *
        </Label>
        <Textarea
          id="consequencesOfNotBuying"
          value={formData.consequencesOfNotBuying}
          onChange={(e) => onChange('consequencesOfNotBuying', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Consequências de não adquirir sua solução..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emotionalResponses" className="text-white">
          Seu produto/serviço gera respostas emocionais positivas no cliente? Se sim, como?
        </Label>
        <Textarea
          id="emotionalResponses"
          value={formData.emotionalResponses}
          onChange={(e) => onChange('emotionalResponses', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Descreva as respostas emocionais..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="savesTimeOrMoney" className="text-white">
          Seu produto/serviço economiza tempo ou dinheiro para o cliente? Explique *
        </Label>
        <Textarea
          id="savesTimeOrMoney"
          value={formData.savesTimeOrMoney}
          onChange={(e) => onChange('savesTimeOrMoney', e.target.value)}
          className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
          placeholder="Como sua solução economiza tempo ou dinheiro..."
          required
        />
      </div>
    </div>
  );
};

export default ProblemSection;
