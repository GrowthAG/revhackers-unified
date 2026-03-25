import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'greeting' | 'form' | 'success'>('greeting');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Auto-open after 30 seconds for first-time visitors
  useEffect(() => {
    const hasSeenChat = localStorage.getItem('hasSeenChat');
    if (!hasSeenChat) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('hasSeenChat', 'true');
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  const quickResponses = [
    "Quero falar sobre Revenue Operations",
    "Preciso de um diagnóstico gratuito",
    "Quero ver cases de sucesso",
    "Tenho dúvidas sobre automação"
  ];

  const handleQuickResponse = (response: string) => {
    setMessage(response);
    setStep('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsOpen(false);
      setStep('greeting');
      setMessage('');
      setFormData({ name: '', email: '', company: '', message: '' });
    }, 3000);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-revgreen hover:bg-revgreen/90 shadow-sm transition-all duration-300 animate-bounce-gentle"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">1</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="bg-white shadow-sm border-0 overflow-hidden">
        {/* Header */}
        <div className="bg-revgreen text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">RevHackers</h3>
              <p className="text-xs opacity-90 flex items-center">
                <div className="h-2 w-2 bg-green-300 rounded-full mr-1 animate-pulse"></div>
                Online agora
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 h-80 overflow-y-auto">
          {step === 'greeting' && (
            <div className="space-y-4">
              <div className="bg-zinc-100 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-zinc-800">
                  👋 Olá! Sou da RevHackers. Como posso ajudar você hoje?
                </p>
              </div>
              
              <div className="space-y-2">
                {quickResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    className="block w-full text-left p-2 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    {response}
                  </button>
                ))}
              </div>

              <div className="flex items-center text-xs text-zinc-500 mt-4">
                <Clock className="h-3 w-3 mr-1" />
                Resposta em até 5 minutos
              </div>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-4">
              <div className="bg-zinc-100 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-zinc-800">
                  Perfeito! Me conte um pouco sobre você para eu conectar com o especialista certo:
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="text-sm"
                />
                <Input
                  type="email"
                  placeholder="Seu email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="text-sm"
                />
                <Input
                  placeholder="Sua empresa"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  required
                  className="text-sm"
                />
                <Textarea
                  placeholder="Descreva brevemente seu desafio..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="text-sm resize-none"
                />
                
                <Button type="submit" className="w-full bg-revgreen hover:bg-revgreen/90">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar mensagem
                </Button>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4 text-center">
              <div className="bg-green-100 rounded-lg p-6">
                <div className="h-12 w-12 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-green-800 mb-2">Mensagem enviada!</h3>
                <p className="text-sm text-green-700">
                  Nosso time entrará em contato em até 1 hora no horário comercial.
                </p>
              </div>
              
              <div className="bg-revgreen/10 rounded-lg p-3">
                <p className="text-xs text-revgreen font-medium flex items-center justify-center">
                  <Users className="h-3 w-3 mr-1" />
                  +150 empresas já cresceram conosco
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatWidget;