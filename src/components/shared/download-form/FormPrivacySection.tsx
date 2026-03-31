
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DownloadFormData } from './types';

interface FormPrivacySectionProps {
  formData: DownloadFormData;
  onCheckedChange: (checked: boolean) => void;
}

const FormPrivacySection = ({ formData, onCheckedChange }: FormPrivacySectionProps) => {
  return (
    <div className="flex items-start space-x-3 pt-4 border-t border-zinc-100 mt-4">
      <Checkbox
        id="agree"
        name="agree"
        checked={formData.agree}
        onCheckedChange={(checked) => onCheckedChange(checked === true)}
        className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:border-black data-[state=checked]:text-white mt-1 h-3.5 w-3.5"
      />
      <Label htmlFor="agree" className="text-xxs text-zinc-400 font-normal leading-relaxed cursor-pointer select-none">
        Concordo em receber atualizações sobre Growth B2B da RevHackers.
      </Label>
    </div>
  );
};

export default FormPrivacySection;
