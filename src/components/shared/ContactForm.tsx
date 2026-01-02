
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { saveFormData } from '@/utils/formStorage';
import { useNavigate } from 'react-router-dom';

interface ContactFormProps {
  formType?: 'diagnosis' | 'contact' | 'material';
  variant?: 'light' | 'dark';
}

const ContactForm = ({ formType = 'contact', variant = 'light' }: ContactFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    message: '',
    role: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        formType,
        source: window.location.href,
        timestamp: new Date().toISOString(),
      };

      // Save to localStorage
      saveFormData(submissionData);
      console.log('Form data saved to localStorage:', submissionData);

      // Send to webhook
      const webhookResponse = await fetch('https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/824c1633-dd07-4343-9ca4-2f25653042f5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (webhookResponse.ok) {
        toast({
          title: "Sucesso!",
          description: "Suas informações foram enviadas com sucesso.",
        });

        // Redirect based on form type
        if (formType === 'diagnosis') {
          navigate('/agenda-diagnostico');
        } else if (formType === 'material') {
          navigate('/booking');
        } else {
          // Reset form for contact type
          setFormData({
            name: '',
            email: '',
            company: '',
            phone: '',
            industry: '',
            message: '',
            role: '',
          });
        }
      } else {
        throw new Error('Erro no envio');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputStyles = variant === 'dark'
    ? "bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-revgreen focus:ring-0 focus:outline-none focus:ring-offset-0 text-xs font-medium"
    : "bg-white border-zinc-200 text-black placeholder:text-zinc-300 focus:border-black focus:ring-0 focus:outline-none focus:ring-offset-0 text-xs font-medium";

  const labelStyles = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className={labelStyles}>Nome Completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Ex: João Silva"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className={`${inputStyles} h-12 rounded-none transition-all`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={labelStyles}>Email Corporativo</Label>
          <Input
            id="email"
            type="email"
            placeholder="Ex: nome@empresa.com.br"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className={`${inputStyles} h-12 rounded-none transition-all`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company" className={labelStyles}>Empresa</Label>
          <Input
            id="company"
            type="text"
            placeholder="Nome da sua empresa"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            required
            className={`${inputStyles} h-12 rounded-none transition-all`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className={labelStyles}>Telefone / WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            className={`${inputStyles} h-12 rounded-none transition-all`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className={labelStyles}>Segmento</Label>
          <Select onValueChange={(value) => handleInputChange('industry', value)}>
            <SelectTrigger className={`flex h-12 w-full items-center justify-between rounded-none px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputStyles}`}>
              <SelectValue placeholder="Selecione seu segmento" />
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-200">
              <SelectItem value="technology">Tecnologia / SaaS</SelectItem>
              <SelectItem value="finance">Financeiro / Fintech</SelectItem>
              <SelectItem value="health">Saúde / Healthtech</SelectItem>
              <SelectItem value="education">Educação / Edtech</SelectItem>
              <SelectItem value="retail">Varejo / E-commerce</SelectItem>
              <SelectItem value="manufacturing">Indústria</SelectItem>
              <SelectItem value="services">Serviços B2B</SelectItem>
              <SelectItem value="consulting">Consultoria</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={labelStyles}>Cargo</Label>
          <Select onValueChange={(value) => handleInputChange('role', value)}>
            <SelectTrigger className={`flex h-12 w-full items-center justify-between rounded-none px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 ${inputStyles}`}>
              <SelectValue placeholder="Selecione seu cargo" />
            </SelectTrigger>
            <SelectContent className="bg-white border-zinc-200">
              <SelectItem value="ceo">C-Level / Fundador</SelectItem>
              <SelectItem value="vp">VP / Diretor</SelectItem>
              <SelectItem value="manager">Gerente / Coordenador</SelectItem>
              <SelectItem value="analyst">Analista / Especialista</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className={labelStyles}>Como podemos ajudar?</Label>
        <Textarea
          id="message"
          placeholder="Descreva brevemente seus desafios atuais..."
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className={`${inputStyles} min-h-[120px] rounded-none py-3`}
        />
      </div>

      <Button
        type="submit"
        className={`w-full font-black h-14 rounded-none transition-all uppercase tracking-[0.2em] text-[10px] shadow-none ${variant === 'dark'
          ? "bg-revgreen text-black hover:bg-revgreen/90"
          : "bg-black text-white hover:bg-zinc-900 border border-black"
          }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : formType === 'diagnosis' ? 'Agendar Diagnóstico' : 'Solicitar Aprovação'}
      </Button>
    </form>
  );
};

export default ContactForm;

