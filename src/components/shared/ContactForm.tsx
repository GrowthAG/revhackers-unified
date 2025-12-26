
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-black font-medium">Nome completo *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className="bg-white border-gray-300 text-black"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-black font-medium">E-mail *</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="bg-white border-gray-300 text-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-black font-medium">Empresa *</Label>
          <Input
            id="company"
            type="text"
            placeholder="Nome da empresa"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            required
            className="bg-white border-gray-300 text-black"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-black font-medium">Telefone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            className="bg-white border-gray-300 text-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-black font-medium">Segmento *</Label>
          <select
            id="industry"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-black"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            required
            style={{ appearance: 'menulist', cursor: 'pointer' }}
          >
            <option value="" disabled>Selecione o segmento</option>
            <option value="technology">Tecnologia</option>
            <option value="finance">Financeiro</option>
            <option value="health">Saúde</option>
            <option value="education">Educação</option>
            <option value="retail">Varejo</option>
            <option value="manufacturing">Indústria</option>
            <option value="services">Serviços</option>
            <option value="real_estate">Imobiliário</option>
            <option value="consulting">Consultoria</option>
            <option value="other">Outros</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-black font-medium">Cargo *</Label>
          <select
            id="role"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-black"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            required
            style={{ appearance: 'menulist', cursor: 'pointer' }}
          >
            <option value="" disabled>Selecione seu cargo</option>
            <option value="ceo">CEO/Presidente</option>
            <option value="cto">CTO/Diretor de Tecnologia</option>
            <option value="cmo">CMO/Diretor de Marketing</option>
            <option value="cfo">CFO/Diretor Financeiro</option>
            <option value="vp_sales">VP/Diretor de Vendas</option>
            <option value="vp_marketing">VP/Diretor de Marketing</option>
            <option value="manager">Gerente</option>
            <option value="coordinator">Coordenador</option>
            <option value="analyst">Analista</option>
            <option value="consultant">Consultor</option>
            <option value="owner">Proprietário</option>
            <option value="other">Outros</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-black font-medium">Mensagem</Label>
        <Textarea
          id="message"
          placeholder="Conte-nos sobre seus principais desafios..."
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className="bg-white border-gray-300 min-h-[100px] text-black"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-revgreen hover:bg-revgreen/90 text-black font-semibold py-3"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : formType === 'diagnosis' ? 'Solicitar Diagnóstico' : 'Enviar Mensagem'}
      </Button>
    </form>
  );
};

export default ContactForm;
