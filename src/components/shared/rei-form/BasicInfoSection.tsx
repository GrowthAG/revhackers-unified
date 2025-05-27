
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-white">Cargo *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => onChange('role', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
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
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-white">WhatsApp *</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => onChange('whatsapp', e.target.value)}
            placeholder="(11) 99999-9999"
            className="bg-gray-900 border-gray-700 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-white">Nome da Empresa *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
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
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector" className="text-white">Setor *</Label>
        <Select value={formData.sector} onValueChange={(value) => onChange('sector', value)}>
          <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
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
    </div>
  );
};

export default BasicInfoSection;
