
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
        <Label htmlFor="company" className="text-zinc-900 text-xs font-bold uppercase tracking-wider">Empresa *</Label>
        <Input
          id="company"
          name="company"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="Nome da sua empresa"
          className="bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-black h-10 rounded-sm transition-all shadow-none"
          required
        />
      </div>



      <div className="space-y-1">
        <Label htmlFor="industry" className="text-zinc-900 text-xs font-bold uppercase tracking-wider">Setor *</Label>
        <Select
          value={formData.industry}
          onValueChange={(value) => handleSelectChange('industry', value)}
        >
          <SelectTrigger id="industry" className="bg-white border-zinc-200 text-zinc-900 h-10 rounded-sm focus:ring-0 focus:border-black shadow-none font-medium">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-none rounded-sm">
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
        <Label htmlFor="role" className="text-zinc-900 text-xs font-bold uppercase tracking-wider">Cargo *</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleSelectChange('role', value)}
        >
          <SelectTrigger id="role" className="bg-white border-zinc-200 text-zinc-900 h-10 rounded-sm focus:ring-0 focus:border-black shadow-none font-medium">
            <SelectValue placeholder="Selecione sua função" />
          </SelectTrigger>
          <SelectContent className="bg-white border-zinc-200 text-zinc-900 shadow-none rounded-sm">
            <SelectItem value="executivo-senior" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Executivo sênior</SelectItem>
            <SelectItem value="socio-vp" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Sócio / VP</SelectItem>
            <SelectItem value="chefe-diretor" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Chefe / Diretor</SelectItem>
            <SelectItem value="gerente-lider" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Gerente / Líder de equipe</SelectItem>
            <SelectItem value="especialista-consultor" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Especialista / Consultor</SelectItem>
            <SelectItem value="colaborador-individual" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Colaborador individual</SelectItem>
            <SelectItem value="autonomo" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Autônomo</SelectItem>
            <SelectItem value="estudante" className="focus:bg-zinc-50 focus:text-black cursor-pointer">Estudante</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default FormCompanySection;
