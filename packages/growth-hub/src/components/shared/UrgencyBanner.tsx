import { useState, useEffect } from 'react';
import { Clock, X, ArrowRight, Flame, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const UrgencyBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    // Show banner after 10 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl mx-auto px-4">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-2xl p-4 animate-slide-down">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Clock className="h-6 w-6" />
            <div>
              <p className="font-bold text-sm flex items-center gap-1">
                <Flame className="h-4 w-4 text-yellow-300" /> Oferta Limitada - Diagnóstico Gratuito
              </p>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-white tracking-wide text-xs md:text-sm">
                  OFERTA POR TEMPO LIMITADO
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
              <span className="text-xs font-mono">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <Button
              asChild
              variant="secondary"
              size="sm"
              className="bg-white text-orange-600 hover:bg-gray-100 text-xs"
            >
              <Link to="/diagnostico" onClick={scrollToTop}>
                Garantir vaga
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>

            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgencyBanner;