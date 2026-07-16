
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DownloadFormData } from './types';
import { UserCheck, Users } from 'lucide-react';

interface FormRoleSectionProps {
  formData: DownloadFormData;
  handleRadioChange: (value: string) => void;
}

const FormRoleSection = ({ formData, handleRadioChange }: FormRoleSectionProps) => {
  return (
    <div className="col-span-1 md:col-span-2 space-y-2 pt-1">
      <Label className="text-gray-900 text-xs font-bold uppercase tracking-wider">Perfil de Tomada de Decisão *</Label>
      <RadioGroup
        value={formData.roleType}
        onValueChange={handleRadioChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1"
      >
        <label
          htmlFor="decision-maker"
          className={`flex items-start space-x-2 border p-3 rounded-sm cursor-pointer transition-all ${formData.roleType === 'decision-maker' ? 'border-black bg-zinc-50' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
        >
          <RadioGroupItem value="decision-maker" id="decision-maker" className="mt-1 border-zinc-300 text-black data-[state=checked]:border-black data-[state=checked]:bg-black" />
          <div className="space-y-0.5">
            <span className="font-bold text-gray-900 text-[11px] uppercase tracking-wider block">Decisor</span>
            <p className="text-[10px] text-gray-400 leading-tight">Tenho autonomia de aprovação.</p>
          </div>
        </label>

        <label
          htmlFor="influencer"
          className={`flex items-start space-x-2 border p-3 rounded-sm cursor-pointer transition-all ${formData.roleType === 'influencer' ? 'border-black bg-zinc-50' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}
        >
          <RadioGroupItem value="influencer" id="influencer" className="mt-1 border-zinc-300 text-black data-[state=checked]:border-black data-[state=checked]:bg-black" />
          <div className="space-y-0.5">
            <span className="font-bold text-gray-900 text-[11px] uppercase tracking-wider block">Influenciador</span>
            <p className="text-[10px] text-gray-400 leading-tight">Influencio e recomendo soluções.</p>
          </div>
        </label>
      </RadioGroup>
    </div>
  );
};

export default FormRoleSection;
