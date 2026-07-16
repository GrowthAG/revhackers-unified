
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DownloadFormData } from './types';

interface FormCompanySectionProps {
  formData: DownloadFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const FormCompanySection = ({
  formData,
  handleInputChange,
  handleSelectChange
}: FormCompanySectionProps) => {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="company" className="text-gray-900 text-xs font-bold uppercase tracking-wider">Empresa *</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="Nome da sua empresa"
          className="bg-white border-zinc-200 text-gray-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-black h-10 rounded-sm transition-all shadow-none"
          required
        />
      </div>



      <div className="space-y-1">
        <Label htmlFor="industry" className="text-gray-900 text-xs font-bold uppercase tracking-wider">Setor *</Label>
        <Select
          value={formData.industry}
          onValueChange={(value) => handleSelectChange('industry', value)}
        >
          <SelectTrigger id="industry" className="bg-white border-zinc-200 text-gray-900 h-10 rounded-sm focus:ring-0 focus:border-black shadow-none font-medium">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200 text-gray-900 shadow-none rounded-sm">
            <SelectItem value="saas" className="focus:bg-zinc-50 focus:text-black cursor-pointer">SaaS</SelectItem>
            <SelectItem value="tech" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Tecnologia</SelectItem>
            <SelectItem value="startup" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Startup</SelectItem>
            <SelectItem value="b2b" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Serviços B2B</SelectItem>
            <SelectItem value="ecommerce" className="focus:bg-zinc-50 focus:text-black cursor-pointer">E-commerce</SelectItem>
            <SelectItem value="fintech" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Fintech</SelectItem>
            <SelectItem value="marketing" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Agência/Marketing</SelectItem>
            <SelectItem value="other" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1 md:col-span-2 space-y-1">
        <Label htmlFor="role" className="text-gray-900 text-xs font-bold uppercase tracking-wider">Cargo *</Label>
        <Input
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="bg-white border-zinc-200 text-gray-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-black h-10 rounded-sm transition-all shadow-none"
          required
          placeholder="Ex: CEO, Head de Growth..."
        />
      </div>
    </>
  );
};

export default FormCompanySection;
