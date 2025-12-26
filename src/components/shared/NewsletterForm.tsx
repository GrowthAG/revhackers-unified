import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from "@/components/ui/checkbox";

const NewsletterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos para se inscrever.",
        variant: "destructive",
      });
      return;
    }

    if (!consent) {
      toast({
        title: "Consentimento necessário",
        description: "Por favor, aceite os termos para prosseguir com a inscrição.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare data for webhook
    const webhookData = {
      name,
      email,
      formType: 'newsletter',
      source: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Updated webhook URL
    const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a98d7f48-96fb-4433-a10d-4fa22370034f';

    try {
      console.log('Newsletter submission:', webhookData);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok && response.status !== 0) {
        throw new Error('Failed to submit newsletter subscription');
      }

      toast({
        title: "Inscrição confirmada!",
        description: "Você foi inscrito em nossa newsletter com sucesso.",
      });

      // Reset form
      setName('');
      setEmail('');
      setConsent(false);
    } catch (error) {
      console.error('Newsletter submission error:', error);
      toast({
        title: "Erro ao processar inscrição",
        description: "Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 h-auto bg-[#1A1A1A] border-0 rounded-lg text-white placeholder:text-[#999999]"
        />

        <Input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 h-auto bg-[#1A1A1A] border-0 rounded-lg text-white placeholder:text-[#999999]"
        />

        <Button
          type="submit"
          className="w-full h-auto py-2 px-3 bg-[#00FF66] hover:bg-[#00e65c] text-black font-bold text-sm rounded-lg transition-all duration-300 hover:-translate-y-[1px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Mail className="mr-2 h-4 w-4" />
              Processando...
            </span>
          ) : (
            "Inscrever-se"
          )}
        </Button>

        <div className="flex items-start mt-1 mb-2">
          <Checkbox
            id="privacyPolicy"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked as boolean)}
            className="h-3 w-3 border-gray-500 rounded"
          />
          <label
            htmlFor="privacyPolicy"
            className="ml-2 text-[0.7rem] text-[#888888] cursor-pointer"
            onClick={() => setConsent(!consent)}
          >
            Ao se inscrever, você aceita receber
            <br />conteúdos da RevHackers.
          </label>
        </div>
      </form>
    </div>
  );
};

export default NewsletterForm;
