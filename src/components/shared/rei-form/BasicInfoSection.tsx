
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ReiFormData } from './types';

interface BasicInfoSectionProps {
  formData: ReiFormData;
  onChange: (name: keyof ReiFormData, value: string) => void;
}

const BasicInfoSection = ({ formData, onChange }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-white">Cargo *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => onChange('role', e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
            required
          />
        </div>



        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-white">Nome da Empresa *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            className="bg-zinc-900 border-zinc-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySite" className="text-white">Site da Empresa</Label>
          <Input
            id="companySite"
            value={formData.companySite}
            onChange={(e) => onChange('companySite', e.target.value)}
            placeholder="https://exemplo.com"
            className="bg-zinc-900 border-zinc-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector" className="text-white">Setor *</Label>
        <Select value={formData.sector} onValueChange={(value) => onChange('sector', value)}>
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
            <SelectValue placeholder="Selecione o setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="saas">Software as a Service (SaaS)</SelectItem>
            <SelectItem value="tech">Tecnologia</SelectItem>
            <SelectItem value="startup">Startup</SelectItem>
            <SelectItem value="b2b">B2B</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="fintech">Fintech</SelectItem>
            <SelectItem value="edtech">EdTech</SelectItem>
            <SelectItem value="health">Healthtech</SelectItem>
            <SelectItem value="logistics">Logística</SelectItem>
            <SelectItem value="manufacturing">Indústria</SelectItem>
            <SelectItem value="retail">Varejo</SelectItem>
            <SelectItem value="services">Serviços</SelectItem>
            <SelectItem value="consulting">Consultoria</SelectItem>
            <SelectItem value="other">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-white">Qual a receita anual aproximada da sua empresa?</Label>
        <RadioGroup
          value={formData.annualRevenue}
          onValueChange={(value) => onChange('annualRevenue', value)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="até-500k" id="até-500k" />
            <Label htmlFor="até-500k" className="text-white cursor-pointer">
              Até R$ 500 mil
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="500k-1m" id="500k-1m" />
            <Label htmlFor="500k-1m" className="text-white cursor-pointer">
              Entre R$ 500 mil e R$ 1 milhão
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1m-3m" id="1m-3m" />
            <Label htmlFor="1m-3m" className="text-white cursor-pointer">
              Entre R$ 1 milhão e R$ 3 milhões
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3m-5m" id="3m-5m" />
            <Label htmlFor="3m-5m" className="text-white cursor-pointer">
              Entre R$ 3 milhões e R$ 5 milhões
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="5m-10m" id="5m-10m" />
            <Label htmlFor="5m-10m" className="text-white cursor-pointer">
              Entre R$ 5 milhões e R$ 10 milhões
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="acima-10m" id="acima-10m" />
            <Label htmlFor="acima-10m" className="text-white cursor-pointer">
              Acima de R$ 10 milhões
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="prefiro-nao-responder" id="prefiro-nao-responder" />
            <Label htmlFor="prefiro-nao-responder" className="text-white cursor-pointer">
              Prefiro não responder agora
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default BasicInfoSection;
