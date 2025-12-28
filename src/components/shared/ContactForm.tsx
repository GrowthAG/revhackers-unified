
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { saveFormData } from '@/utils/formStorage';
import { useNavigate } from 'react-router-dom';

interface ContactFormProps {
  formType?: 'diagnosis' | 'contact' | 'material';
}

const ContactForm = ({ formType = 'contact' }: ContactFormProps) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-700">Nome Completo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Ex: João Silva"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className="bg-white border-zinc-200 h-12 text-black focus:border-black rounded-none placeholder:text-zinc-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-700">Email Corporativo</Label>
          <Input
            id="email"
            type="email"
            placeholder="Ex: nome@empresa.com.br"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="bg-white border-zinc-200 h-12 text-black focus:border-black rounded-none placeholder:text-zinc-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-zinc-700">Empresa</Label>
          <Input
            id="company"
            type="text"
            placeholder="Nome da sua empresa"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            required
            className="bg-white border-zinc-200 h-12 text-black focus:border-black rounded-none placeholder:text-zinc-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-zinc-700">Telefone / WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            className="bg-white border-zinc-200 h-12 text-black focus:border-black rounded-none placeholder:text-zinc-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-xs font-bold uppercase tracking-wider text-zinc-700">Segmento</Label>
          <select
            id="industry"
            className="flex h-12 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            required
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
          >
            <option value="" disabled>Selecione seu segmento</option>
            <option value="technology">Tecnologia / SaaS</option>
            <option value="finance">Financeiro / Fintech</option>
            <option value="health">Saúde / Healthtech</option>
            <option value="education">Educação / Edtech</option>
            <option value="retail">Varejo / E-commerce</option>
            <option value="manufacturing">Indústria</option>
            <option value="services">Serviços B2B</option>
            <option value="consulting">Consultoria</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-zinc-700">Cargo</Label>
          <select
            id="role"
            className="flex h-12 w-full rounded-none border border-zinc-200 bg-white px-3 py-2 text-sm text-black focus-visible:outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            required
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
          >
            <option value="" disabled>Selecione seu cargo</option>
            <option value="ceo">C-Level / Fundador</option>
            <option value="vp">VP / Diretor</option>
            <option value="manager">Gerente / Coordenador</option>
            <option value="analyst">Analista / Especialista</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-zinc-700">Como podemos ajudar?</Label>
        <Textarea
          id="message"
          placeholder="Descreva brevemente seus desafios atuais..."
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className="bg-white border-zinc-200 min-h-[120px] text-black focus:border-black rounded-none placeholder:text-zinc-400"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-black hover:bg-zinc-900 text-white font-bold h-14 rounded-none transition-all uppercase tracking-widest text-xs"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : formType === 'diagnosis' ? 'Agendar Diagnóstico' : 'Solicitar Contato'}
      </Button>
    </form>
  );
};

export default ContactForm;
