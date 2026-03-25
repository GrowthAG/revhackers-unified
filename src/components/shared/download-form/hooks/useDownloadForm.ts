
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { DownloadFormData } from '../types';
import { validateForm } from '../utils';
import { saveFormData } from '@/utils/formStorage';
import { sendToGHL } from '@/lib/ghlRelay';

export const useDownloadForm = (
  materialId: string,
  materialType: string,
  onSubmit: () => void,
  linkMaterial?: string
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<DownloadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    role: '',
    roleType: 'decision-maker',
    agree: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      roleType: value
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      agree: checked
    });
  };

  const sendMaterialByEmail = async (webhookData: any) => {
    try {
      const emailData = {
        ...webhookData,
        materialTitle: materialType,
        materialLink: linkMaterial || '',
        actionType: 'send_material_email'
      };

      await sendToGHL('email_material', emailData as Record<string, unknown>);
    } catch (error) {
      console.error('Error sending email request:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const { isValid, errorMessage } = validateForm(formData);

    if (!isValid) {
      toast({
        title: "Campos obrigatórios",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }


    // Strict Validation Rule: materiallink is MANDATORY
    if (!linkMaterial) {
      console.error("CRITICAL ERROR: 'materiallink' (material_url) is missing for this material.");
      toast({
        title: "Erro de Configuração",
        description: "Este material não possui um link de download configurado. Por favor, contate o suporte.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare data for webhook

    const webhookData = {
      ...formData,
      formType: 'download',
      materialId,
      materialType,
      materiallink: linkMaterial || '',
      source: window.location.href,
      timestamp: new Date().toISOString()
    };

    try {
      // Save form data to localStorage for use on booking page
      saveFormData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        industry: formData.industry,
        role: formData.role,
        formType: 'download'
      });

      // Send data to GHL relay
      await sendToGHL('download', webhookData as Record<string, unknown>);


      // Send material by email
      await sendMaterialByEmail(webhookData);

      setIsSubmitting(false);
      setIsSuccess(true);

      // We removed window.open and onSubmit here to show the Success View instead.

      toast({
        title: "Sucesso!",
        description: "Seu material está pronto para acesso.",
        duration: 5000
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro ao enviar formulário",
        description: "Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    isSuccess,
    handleInputChange,
    handleSelectChange,
    handleRadioChange,
    handleCheckboxChange,
    handleSubmit
  };
};
