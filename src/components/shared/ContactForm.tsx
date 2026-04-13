
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
import { sendToGHL } from '@/lib/ghlRelay';

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
      // Send to GHL relay
      await sendToGHL('contact_form', submissionData as Record<string, unknown>);

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
    ? "bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-revgreen focus:ring-0 focus:outline-none focus:ring-offset-0 text-sm"
    : "bg-white border-zinc-200 text-black placeholder:text-zinc-300 focus:border-black focus:ring-0 focus:outline-none focus:ring-offset-0 text-sm";

  const labelStyles = "text-xs font-medium text-zinc-500";

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
          className={`${inputStyles} h-11 rounded transition-all`}
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
          className={`${inputStyles} h-11 rounded transition-all`}
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
          className={`${inputStyles} h-11 rounded transition-all`}
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
          className={`${inputStyles} h-11 rounded transition-all`}
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
              <SelectItem value="executivo-senior">Executivo sênior</SelectItem>
              <SelectItem value="socio-vp">Sócio / VP</SelectItem>
              <SelectItem value="chefe-diretor">Chefe / Diretor</SelectItem>
              <SelectItem value="gerente-lider">Gerente / Líder de equipe</SelectItem>
              <SelectItem value="especialista-consultor">Especialista / Consultor</SelectItem>
              <SelectItem value="colaborador-individual">Colaborador individual</SelectItem>
              <SelectItem value="autonomo">Autônomo</SelectItem>
              <SelectItem value="estudante">Estudante</SelectItem>
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
          className={`${inputStyles} min-h-[100px] rounded py-3`}
        />
      </div>

      <Button
        type="submit"
        variant={variant === 'dark' ? 'default' : 'default'}
        className="w-full h-12 rounded mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : formType === 'diagnosis' ? 'Agendar Diagnóstico' : 'Solicitar Aprovação'}
      </Button>
    </form>
  );
};

export default ContactForm;

