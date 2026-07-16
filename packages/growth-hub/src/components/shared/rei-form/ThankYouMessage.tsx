
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYouMessage = () => {
  return (
    <Card className="max-w-2xl mx-auto bg-black border border-white/10 p-12 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="w-16 h-16 text-revgreen" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">
        Obrigado pelo seu tempo!
      </h2>
      
      <p className="text-lg text-gray-300 mb-8 leading-relaxed">
        Suas respostas foram enviadas com sucesso. Nossa equipe irá analisar 
        as informações e entrar em contato em breve com insights personalizados 
        para acelerar o crescimento da sua empresa.
      </p>
      
      <div className="flex justify-center">
        <Button 
          asChild 
          className="bg-revgreen text-black font-medium px-8 py-3 rounded-md hover:brightness-110 transition-all"
          size="lg"
        >
          <Link to="/" onClick={() => window.scrollTo(0, 0)}>
            Voltar para a Home
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default ThankYouMessage;
