
import { Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialShareButtonsProps {
  category: string;
}

const SocialShareButtons = ({ category }: SocialShareButtonsProps) => {
  return (
    <div className="not-prose my-6">
      <p className="text-sm font-medium">Recursos adicionais:</p>
      <div className="flex flex-col space-y-2 mt-2">
        <a href="#" className="flex items-center text-revgreen hover:underline">
          <Download className="h-4 w-4 mr-2" />
          <span>Guia Completo de {category} para B2B (PDF)</span>
        </a>
        <a href="#" className="flex items-center text-revgreen hover:underline">
          <MessageSquare className="h-4 w-4 mr-2" />
          <span>Webinar: Implementando {category} na prática</span>
        </a>
      </div>
    </div>
  );
};

export default SocialShareButtons;
