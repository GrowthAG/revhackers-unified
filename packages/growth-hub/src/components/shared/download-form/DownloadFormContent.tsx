
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadFormData } from './types';
import FormPersonalSection from './FormPersonalSection';
import FormCompanySection from './FormCompanySection';
import FormRoleSection from './FormRoleSection';
import FormPrivacySection from './FormPrivacySection';
import { Download, Lock } from 'lucide-react';

interface DownloadFormContentProps {
  formData: DownloadFormData;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleRadioChange: (value: string) => void;
  handleCheckboxChange: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const DownloadFormContent: React.FC<DownloadFormContentProps> = ({
  formData,
  isSubmitting,
  handleInputChange,
  handleSelectChange,
  handleRadioChange,
  handleCheckboxChange,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <FormPersonalSection
          formData={formData}
          handleInputChange={handleInputChange}
        />

        <FormCompanySection
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
        />

        <FormRoleSection
          formData={formData}
          handleRadioChange={handleRadioChange}
        />
      </div>

      <FormPrivacySection
        formData={formData}
        onCheckedChange={handleCheckboxChange}
      />

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-black hover:bg-zinc-800 text-white font-bold h-12 text-[11px] rounded-none transition-all uppercase tracking-[0.25em] shadow-none flex items-center justify-center gap-2 group"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Liberando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 stroke-[2.5]" />
              Acessar Material
            </span>
          )}
        </Button>

        <p className="text-[10px] text-gray-400 mt-2 text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" />
          Seus dados estão seguros conosco. Não fazemos spam.
        </p>
      </div>
    </form>
  );
};

export default DownloadFormContent;
