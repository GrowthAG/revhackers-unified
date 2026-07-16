
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DownloadFormData } from './types';

interface FormPersonalSectionProps {
  formData: DownloadFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormPersonalSection = ({ formData, handleInputChange }: FormPersonalSectionProps) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="firstName" className="text-gray-900 text-xs font-bold uppercase tracking-wider">Nome *</Label>
        <Input
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          placeholder="Seu nome"
          className="bg-white border-zinc-200 text-gray-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-black h-10 rounded-sm transition-all shadow-none"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="lastName" className="text-gray-900 text-xs font-bold uppercase tracking-wider">Sobrenome</Label>
        <Input
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          placeholder="Seu sobrenome"
          className="bg-white border-zinc-200 text-gray-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-black h-10 rounded-sm transition-all shadow-none"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email" className="text-gray-900 text-xs font-bold uppercase tracking-wider">Email Corporativo *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="seuemail@seudominio.com.br"
          className="bg-white border-zinc-200 text-gray-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-black h-10 rounded-sm transition-all shadow-none"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone" className="text-gray-900 text-xs font-bold uppercase tracking-wider">WhatsApp</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="(11) 99999-9999"
          className="bg-white border-zinc-200 text-gray-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-black h-10 rounded-sm transition-all shadow-none"
        />
      </div>
    </>
  );
};

export default FormPersonalSection;
