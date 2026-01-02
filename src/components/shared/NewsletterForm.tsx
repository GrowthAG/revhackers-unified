import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from "@/components/ui/checkbox";

interface NewsletterFormProps {
  variant?: 'default' | 'footer';
}

const NewsletterForm = ({ variant = 'default' }: NewsletterFormProps) => {
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
        description: "Preencha nome e e-mail.",
        variant: "destructive",
      });
      return;
    }

    if (!consent) {
      toast({
        title: "Consentimento necessário",
        description: "Aceite os termos para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const webhookData = {
      name,
      email,
      formType: 'newsletter',
      source: window.location.href,
      timestamp: new Date().toISOString()
    };

    const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/824c1633-dd07-4343-9ca4-2f25653042f5';

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok && response.status !== 0) throw new Error('Submission failed');

      toast({
        title: "INSCRIÇÃO CONFIRMADA",
        description: "BEM-VINDO À REVHACKERS.",
      });

      setName('');
      setEmail('');
      setConsent(false);
    } catch (error) {
      toast({
        title: "FALHA NA INSCRIÇÃO",
        description: "TENTE NOVAMENTE.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'footer') {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 bg-zinc-900 border-none text-white placeholder:text-zinc-600 text-[13px] rounded-sm focus-visible:ring-1 focus-visible:ring-revgreen transition-all"
          />
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 bg-zinc-900 border-none text-white placeholder:text-zinc-600 text-[13px] rounded-sm focus-visible:ring-1 focus-visible:ring-revgreen transition-all"
          />
          <Button
            type="submit"
            className="w-full h-11 bg-revgreen hover:bg-white text-black font-bold text-[13px] rounded-sm transition-all shadow-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Inscrever-se"}
          </Button>
          <div className="flex items-start gap-3 py-1">
            <Checkbox
              id="footerConsent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              className="h-4 w-4 border-zinc-800 rounded-none data-[state=checked]:bg-revgreen data-[state=checked]:border-revgreen data-[state=checked]:text-black"
            />
            <label htmlFor="footerConsent" className="text-[10px] text-zinc-600 leading-tight">
              Ao se inscrever, você aceita receber conteúdos da RevHackers.
            </label>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <Input
            type="text"
            placeholder="NOME"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 h-11 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-zinc-600 text-[11px] font-bold tracking-widest focus-visible:ring-0 focus-visible:border-revgreen/50 transition-all"
          />

          <Input
            type="email"
            placeholder="EMAIL CORPORATIVO"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 h-11 bg-white/5 border border-white/10 rounded-none text-white placeholder:text-zinc-600 text-[11px] font-bold tracking-widest focus-visible:ring-0 focus-visible:border-revgreen/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="privacyConsent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked as boolean)}
            className="h-4 w-4 border-white/20 rounded-none data-[state=checked]:bg-revgreen data-[state=checked]:border-revgreen"
          />
          <label htmlFor="privacyConsent" className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
            Aceito os termos da política.
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-white hover:bg-revgreen text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-none transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? "ENVIANDO..." : "INSCREVER →"}
        </Button>
      </form>
    </div>
  );
};

export default NewsletterForm;
