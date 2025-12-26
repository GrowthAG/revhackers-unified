import { Linkedin, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
const BlogPostFooter = () => {
  const shareUrl = window.location.href;
  const shareTitle = document.title;

  // Função para compartilhar nas redes sociais
  const shareOnSocial = (platform: string) => {
    let shareLink = '';
    switch (platform) {
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }
    window.open(shareLink, '_blank', 'width=600,height=400');
  };
  return <div className="max-w-3xl mx-auto mt-12 border-t border-gray-100 pt-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <span className="text-gray-500">Compartilhe este artigo:</span>
      <div className="flex space-x-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareOnSocial('linkedin')}
                className="h-10 w-10 rounded-full bg-revgreen border-revgreen hover:bg-revgreen/90"
              >
                <Linkedin className="h-4 w-4 text-black" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compartilhar no LinkedIn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareOnSocial('twitter')}
                className="h-10 w-10 rounded-full bg-revgreen border-revgreen hover:bg-revgreen/90"
              >
                <Twitter className="h-4 w-4 text-black" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compartilhar no Twitter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => shareOnSocial('facebook')}
                className="h-10 w-10 rounded-full bg-revgreen border-revgreen hover:bg-revgreen/90"
              >
                <Facebook className="h-4 w-4 text-black" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Compartilhar no Facebook</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>

    <div className="mt-8 pt-6 border-t border-gray-100">
      <div className="flex justify-center items-center gap-6">
        <span className="text-gray-500">Siga-nos:</span>
        <a href="https://www.linkedin.com/company/34579614/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Linkedin className="h-5 w-5 text-gray-600 hover:text-revgreen" />
          </Button>
        </a>
        <a href="https://www.instagram.com/revhackers.com.br/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Instagram className="h-5 w-5 text-gray-600 hover:text-revgreen" />
          </Button>
        </a>
        <a href="https://www.youtube.com/@RevHackersTV" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Youtube className="h-5 w-5 text-gray-600 hover:text-revgreen" />
          </Button>
        </a>
      </div>
    </div>
  </div>;
};
export default BlogPostFooter;