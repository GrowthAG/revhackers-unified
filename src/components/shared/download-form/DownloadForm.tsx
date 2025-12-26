
import React from 'react';
import { DownloadFormProps } from './types';
import { useDownloadForm } from './hooks/useDownloadForm';
import DownloadFormContent from './DownloadFormContent';

const DownloadForm = ({ materialId, materialType, onSubmit, linkMaterial }: DownloadFormProps) => {
  const {
    formData,
    isSubmitting,
    isSuccess,
    handleInputChange,
    handleSelectChange,
    handleRadioChange,
    handleCheckboxChange,
    handleSubmit
  } = useDownloadForm(materialId, materialType, onSubmit, linkMaterial);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full border border-black dark:border-white/20 flex items-center justify-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-[0.25em] mb-3">Acesso Liberado</h3>
        <p className="text-gray-500 text-sm mb-10 max-w-sm leading-relaxed">
          Seu conteúdo está disponível. Clique no botão abaixo para iniciar o download ou visualização.
        </p>

        <button
          onClick={() => {
            if (linkMaterial) window.open(linkMaterial, '_blank');
          }}
          className="w-full bg-black hover:bg-zinc-800 text-white font-bold h-12 text-[11px] rounded-none transition-all uppercase tracking-[0.25em] mb-10 border border-black flex items-center justify-center gap-3 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
          Abrir Material
        </button>

        <div className="border-t border-gray-100 pt-8 w-full">
          <div className="flex items-start gap-4 text-left">
            <div className="text-zinc-400 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                <path d="M3 7l9 6 9-6"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-[10px] uppercase tracking-widest mb-1.5">Verificação de E-mail</h4>
              <p className="text-gray-400 text-[10px] leading-relaxed">
                Enviamos um convite exclusivo. Caso não encontre na caixa de entrada, verifique sua pasta de spans ou promoções.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DownloadFormContent
      formData={formData}
      isSubmitting={isSubmitting}
      handleInputChange={handleInputChange}
      handleSelectChange={handleSelectChange}
      handleRadioChange={handleRadioChange}
      handleCheckboxChange={handleCheckboxChange}
      handleSubmit={handleSubmit}
    />
  );
};

export default DownloadForm;
