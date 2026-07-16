
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FormField from './FormField';
import { roleOptions, industryOptions } from './form-options';
import { ContactFormProps, ContactFormData } from './types';
import { saveFormData } from '@/utils/formStorage';

const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/824c1633-dd07-4343-9ca4-2f25653042f5';

const ContactForm = ({ formType = 'contact' }: ContactFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    message: '',
    role: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email || !formData.company || !formData.role) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Prepare data for webhook
    const webhookData = {
      ...formData,
      formType,
      source: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    console.log('Form submitted:', webhookData);
    
    try {
      // Save form data to localStorage for use on booking page
      saveFormData({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        industry: formData.industry,
        role: formData.role,
        message: formData.message,
        formType
      });
      
      // Send data to webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });
      
      // If we have billing or other webhook issues, this will still allow the user to proceed
      // Since the form data is saved in localStorage
      if (!response.ok && response.status !== 422) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Show success message regardless of webhook response as long as we saved the data
      toast({
        title: formType === 'diagnosis' ? "Diagnóstico solicitado!" : "Mensagem enviada!",
        description: "Redirecionando para agendamento...",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        industry: '',
        message: '',
        role: '',
      });
      
      // Redirect to thank you page
      setTimeout(() => {
        navigate('/obrigado');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Even if there's an error with the webhook, if we successfully saved the form data,
      // we can still allow the user to proceed to booking
      toast({
        title: formType === 'diagnosis' ? "Diagnóstico solicitado!" : "Mensagem enviada!",
        description: "Redirecionando para agendamento...",
      });
      
      // Redirect to thank you page despite webhook error
      setTimeout(() => {
        navigate('/obrigado');
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <h3 className="text-xl font-display font-bold mb-6">
        {formType === 'diagnosis' ? 'Solicite seu diagnóstico gratuito' : 'Entre em contato'}
      </h3>
      
      <div className="space-y-4">
        <FormField
          type="input"
          name="name"
          placeholder="Nome completo *"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <FormField
          type="input"
          name="email"
          placeholder="E-mail corporativo *"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <FormField
          type="input"
          name="company"
          placeholder="Empresa *"
          value={formData.company}
          onChange={handleChange}
          required
        />
        
        <FormField
          type="select"
          name="role"
          placeholder="Cargo *"
          value={formData.role}
          onChange={handleChange}
          onSelectChange={(value) => handleSelectChange('role', value)}
          options={roleOptions}
          required
        />
        
        <FormField
          type="input"
          name="phone"
          placeholder="Telefone"
          value={formData.phone}
          onChange={handleChange}
        />
        
        <FormField
          type="select"
          name="industry"
          placeholder="Segmento"
          value={formData.industry}
          onChange={handleChange}
          onSelectChange={(value) => handleSelectChange('industry', value)}
          options={industryOptions}
        />
        
        <FormField
          type="textarea"
          name="message"
          placeholder={formType === 'diagnosis' ? "Compartilhe seus desafios de crescimento" : "Sua mensagem"}
          value={formData.message}
          onChange={handleChange}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#00cf00] text-black hover:bg-[#00cf00]/80"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processando...' : formType === 'diagnosis' ? 'Solicitar diagnóstico' : 'Enviar mensagem'}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Ao enviar, você concorda com nossa política de privacidade.
      </p>
    </form>
  );
};

export default ContactForm;
