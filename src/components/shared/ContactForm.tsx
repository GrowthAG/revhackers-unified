
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        console.log('Form submitted:', submissionData);
        
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
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className="bg-white border-gray-300"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="bg-white border-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Empresa *</Label>
          <Input
            id="company"
            type="text"
            placeholder="Nome da empresa"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            required
            className="bg-white border-gray-300"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            className="bg-white border-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Segmento *</Label>
          <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)} required>
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="Selecione o segmento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Tecnologia</SelectItem>
              <SelectItem value="finance">Financeiro</SelectItem>
              <SelectItem value="health">Saúde</SelectItem>
              <SelectItem value="education">Educação</SelectItem>
              <SelectItem value="retail">Varejo</SelectItem>
              <SelectItem value="manufacturing">Indústria</SelectItem>
              <SelectItem value="services">Serviços</SelectItem>
              <SelectItem value="real_estate">Imobiliário</SelectItem>
              <SelectItem value="consulting">Consultoria</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Cargo *</Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)} required>
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="Selecione seu cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ceo">CEO/Presidente</SelectItem>
              <SelectItem value="cto">CTO/Diretor de Tecnologia</SelectItem>
              <SelectItem value="cmo">CMO/Diretor de Marketing</SelectItem>
              <SelectItem value="cfo">CFO/Diretor Financeiro</SelectItem>
              <SelectItem value="vp_sales">VP/Diretor de Vendas</SelectItem>
              <SelectItem value="vp_marketing">VP/Diretor de Marketing</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="coordinator">Coordenador</SelectItem>
              <SelectItem value="analyst">Analista</SelectItem>
              <SelectItem value="consultant">Consultor</SelectItem>
              <SelectItem value="owner">Proprietário</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          placeholder="Conte-nos sobre seus principais desafios..."
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className="bg-white border-gray-300 min-h-[100px]"
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
