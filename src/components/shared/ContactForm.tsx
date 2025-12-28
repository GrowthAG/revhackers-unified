
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Label htmlFor="name" className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Field_01 // Full_Name</Label>
            <span className="font-mono text-[7px] text-zinc-300">REQ_ALPHA</span>
          </div>
          <Input
            id="name"
            type="text"
            placeholder="NOME COMPLETO"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className="bg-white border-zinc-200 border-[1.5px] focus:border-black rounded-none h-12 text-black transition-all placeholder:text-zinc-300 placeholder:font-mono placeholder:text-[10px]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Label htmlFor="email" className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Field_02 // Identity_Email</Label>
            <span className="font-mono text-[7px] text-zinc-300">REQ_SECURE</span>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="EX: SEU@EMAIL.COM"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="bg-white border-zinc-200 border-[1.5px] focus:border-black rounded-none h-12 text-black transition-all placeholder:text-zinc-300 placeholder:font-mono placeholder:text-[10px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Label htmlFor="company" className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Field_03 // Organization</Label>
            <span className="font-mono text-[7px] text-zinc-300">CORP_ID</span>
          </div>
          <Input
            id="company"
            type="text"
            placeholder="NOME DA EMPRESA"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            required
            className="bg-white border-zinc-200 border-[1.5px] focus:border-black rounded-none h-12 text-black transition-all placeholder:text-zinc-300 placeholder:font-mono placeholder:text-[10px]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Label htmlFor="phone" className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Field_04 // Contact_Phone</Label>
            <span className="font-mono text-[7px] text-zinc-300">INT_CODE</span>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="+55 (--) ---- ----"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
            className="bg-white border-zinc-200 border-[1.5px] focus:border-black rounded-none h-12 text-black transition-all placeholder:text-zinc-300 placeholder:font-mono placeholder:text-[10px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Label htmlFor="industry" className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Field_05 // Vertical_Market</Label>
            <span className="font-mono text-[7px] text-zinc-300">SEL_ONE</span>
          </div>
          <select
            id="industry"
            className="flex h-12 w-full rounded-none border-[1.5px] border-zinc-200 bg-white px-3 py-2 text-[11px] font-mono-tech uppercase tracking-widest focus-visible:outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50 text-black appearance-none transition-all"
            value={formData.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            required
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
          >
            <option value="" disabled className="text-zinc-300">SELECIONAR SEGMENTO</option>
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
          <div className="flex justify-between items-end">
            <Label htmlFor="role" className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Field_06 // Functional_Role</Label>
            <span className="font-mono text-[7px] text-zinc-300">SEL_ONE</span>
          </div>
          <select
            id="role"
            className="flex h-12 w-full rounded-none border-[1.5px] border-zinc-200 bg-white px-3 py-2 text-[11px] font-mono-tech uppercase tracking-widest focus-visible:outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-50 text-black appearance-none transition-all"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            required
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
          >
            <option value="" disabled>SELECIONAR CARGO</option>
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
        <div className="flex justify-between items-end">
          <Label htmlFor="message" className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Field_07 // Briefing_Notes</Label>
          <span className="font-mono text-[7px] text-zinc-300">OPT_DATA</span>
        </div>
        <Textarea
          id="message"
          placeholder="DESCREVA SEUS DESAFIOS ATUAIS..."
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className="bg-white border-zinc-200 border-[1.5px] focus:border-black rounded-none min-h-[120px] text-black transition-all placeholder:text-zinc-300 placeholder:font-mono placeholder:text-[10px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-black hover:bg-revgreen text-white hover:text-black font-bold h-16 rounded-none transition-all duration-300 border-2 border-transparent hover:border-black uppercase tracking-[0.2em] text-xs"
        disabled={isSubmitting}
      >
        <span className="relative z-10">{isSubmitting ? 'ENGINE_SUBMITTING...' : formType === 'diagnosis' ? 'SOLICITAR DIAGNÓSTICO // AGENDAR' : 'ENVIAR REQUISIÇÃO // SUBMIT'}</span>
      </Button>
    </form>
  );
};

export default ContactForm;
