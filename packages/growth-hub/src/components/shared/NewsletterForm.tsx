import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from "@/components/ui/checkbox";

const NewsletterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
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
      role,
      formType: 'newsletter',
      source: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Newsletter webhook URL (same as diagnostic form)
    const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/824c1633-dd07-4343-9ca4-2f25653042f5';

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
      setRole('');
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="NOME"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-0 py-2 h-8 bg-transparent border-b border-zinc-800 rounded-none text-zinc-300 placeholder:text-zinc-700 text-xs focus-visible:ring-0 focus-visible:border-white transition-colors"
          />

          <Input
            type="email"
            placeholder="EMAIL CORPORATIVO"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-0 py-2 h-8 bg-transparent border-b border-zinc-800 rounded-none text-zinc-300 placeholder:text-zinc-700 text-xs focus-visible:ring-0 focus-visible:border-white transition-colors"
          />

          <Input
            type="text"
            placeholder="CARGO"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-0 py-2 h-8 bg-transparent border-b border-zinc-800 rounded-none text-zinc-300 placeholder:text-zinc-700 text-xs focus-visible:ring-0 focus-visible:border-white transition-colors"
          />
        </div>

        <div className="flex items-start my-3">
          <Checkbox
            id="privacyPolicy"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked as boolean)}
            className="h-3 w-3 border-zinc-700 rounded-none data-[state=checked]:bg-white data-[state=checked]:text-black"
          />
          <label
            htmlFor="privacyPolicy"
            className="ml-2 text-[10px] uppercase tracking-wide text-zinc-600 cursor-pointer leading-tight"
            onClick={() => setConsent(!consent)}
          >
            CONFIRMO O RECEBIMENTO DE<br />INTELIGÊNCIA DE MERCADO.
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-8 bg-white hover:bg-zinc-200 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-none border-0 transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              PROCESSANDO...
            </span>
          ) : (
            "INSCREVER"
          )}
        </Button>
      </form>
    </div>
  );
};

export default NewsletterForm;
