import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Activity, Users, TrendingUp, BarChart2, Lock, User, ArrowRight, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from "@/lib/utils";
import LeadCaptureModal from '@/components/shared/LeadCaptureModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  variant?: 'default' | 'light';
}

const Header = ({ variant = 'default' }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Helper variables for styling based on variant/scroll state
  const isLightMode = variant === 'light' && !scrolled;

  const textColor = isLightMode ? "text-zinc-600 hover:text-black" : "text-zinc-300 hover:text-white";
  const navBg = isLightMode ? "bg-white border-zinc-200/50 shadow-sm" : "bg-white/5 border-white/10";
  const hoverBg = isLightMode ? "hover:bg-zinc-100" : "hover:bg-white/5";
  const logoClass = isLightMode ? "invert" : "";

  const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link
      to={to}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${textColor} ${hoverBg}`}
      onClick={() => window.scrollTo(0, 0)}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ to, onClick, children }: { to: string, onClick: () => void, children: React.ReactNode }) => (
    <Link
      to={to}
      className={`text-xl font-medium transition-colors py-2 border-b block ${isLightMode ? "text-zinc-800 border-zinc-100" : "text-zinc-300 border-white/5 hover:text-revgreen"}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (data) {
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchProfile();

    // Realtime subscription for instant updates
    const channel = supabase
      .channel('profile-avatar-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && 'avatar_url' in payload.new) {
            setAvatarUrl((payload.new as any).avatar_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    // Redirecionamento é feito automaticamente pelo signOut
  };

  return (
    <>
      <header
        className={cn(
          "w-full fixed top-0 left-0 right-0 z-[60] transition-all duration-300 border-b",
          scrolled
            ? "bg-black/95 backdrop-blur-md border-white/10 shadow-sm py-4"
            : isLightMode
              ? "bg-white/80 backdrop-blur-md border-zinc-200/50 py-6"
              : "bg-black border-transparent py-6"
        )}
      >
        <div className="container-custom flex justify-between items-center relative">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" onClick={scrollToTop} className="block group">
              <img
                src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                alt="RevHackers Logo"
                className={`w-auto h-14 transition-all duration-300 group-hover:opacity-90 ${logoClass}`}
              />
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={`flex items-center rounded-full px-2 py-1 backdrop-blur-md ${navBg}`}>
              <div className="flex items-center space-x-1">
                <NavLink to="/">Home</NavLink>
                <div className={`w-px h-3 mx-1 ${isLightMode ? "bg-zinc-200" : "bg-white/10"}`}></div>

                {/* Dropdown de Ferramentas */}
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1 focus:outline-none data-[state=open]:bg-white/5",
                    isLightMode ? "text-zinc-600 hover:text-black data-[state=open]:text-black data-[state=open]:bg-zinc-100" : "text-zinc-300 hover:text-white data-[state=open]:text-white"
                  )}>
                    Diagnósticos <ChevronDown className="w-3 h-3 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={8} className="bg-black/95 border-white/10 p-2 backdrop-blur-xl w-[220px] z-[70]">
                    <DropdownMenuItem asChild>
                      <Link to="/score-site" className="flex items-center gap-2 text-zinc-300 hover:text-revgreen hover:bg-white/5 cursor-pointer px-3 py-2 rounded-sm" onClick={scrollToTop}>
                        <Activity className="w-4 h-4 text-revgreen" /> Site / Conversão
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/score-founder" className="flex items-center gap-2 text-zinc-300 hover:text-revgreen hover:bg-white/5 cursor-pointer px-3 py-2 rounded-sm" onClick={scrollToTop}>
                        <Users className="w-4 h-4 text-revgreen" /> Founder Led Sales
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/score-revenue" className="flex items-center gap-2 text-zinc-300 hover:text-revgreen hover:bg-white/5 cursor-pointer px-3 py-2 rounded-sm" onClick={scrollToTop}>
                        <TrendingUp className="w-4 h-4 text-revgreen" /> Máquina de Vendas
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-white/10 my-1" />
                    <DropdownMenuItem asChild>
                      <Link to="/score" className="flex items-center gap-2 text-zinc-300 hover:text-revgreen hover:bg-white/5 cursor-pointer px-3 py-2 rounded-sm" onClick={scrollToTop}>
                        <BarChart2 className="w-4 h-4 text-white" /> Diagnóstico Geral
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className={`w-px h-3 mx-1 ${isLightMode ? "bg-zinc-200" : "bg-white/10"}`}></div>
                <NavLink to="/quem-somos">Quem Somos</NavLink>
                <div className={`w-px h-3 mx-1 ${isLightMode ? "bg-zinc-200" : "bg-white/10"}`}></div>
                <NavLink to="/servicos">Serviços</NavLink>
                <div className={`w-px h-3 mx-1 ${isLightMode ? "bg-zinc-200" : "bg-white/10"}`}></div>
                <NavLink to="/cases">Cases</NavLink>
                <div className={`w-px h-3 mx-1 ${isLightMode ? "bg-zinc-200" : "bg-white/10"}`}></div>
                <NavLink to="/materiais">Materiais</NavLink>
                <div className={`w-px h-3 mx-1 ${isLightMode ? "bg-zinc-200" : "bg-white/10"}`}></div>
                <NavLink to="/blog">Blog</NavLink>
                <div className={`w-px h-3 mx-1 ${isLightMode ? "bg-zinc-200" : "bg-white/10"}`}></div>
              </div>
            </div>
          </nav>

          {/* Right: Subtle CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={`flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none ${textColor}`}>
                  {avatarUrl ? (
                    <div className="w-8 h-8 rounded-full border border-revgreen/30 overflow-hidden">
                      <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-revgreen/20 border border-revgreen/30 flex items-center justify-center text-revgreen font-bold text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black/95 border-white/10 p-2 backdrop-blur-xl w-[200px] z-[70]">
                  <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-revgreen">
                    <Link to="/admin/profile" className="flex items-center gap-2 text-zinc-300 cursor-pointer px-3 py-2 rounded-sm outline-none">
                      <User className="w-4 h-4" /> Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-revgreen">
                    <Link to="/admin" className="flex items-center gap-2 text-zinc-300 cursor-pointer px-3 py-2 rounded-sm outline-none">
                      <Lock className="w-4 h-4" /> Admin Hub
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-revgreen">
                    <Link to="/admin/settings" className="flex items-center gap-2 text-zinc-300 cursor-pointer px-3 py-2 rounded-sm outline-none">
                      <Settings className="w-4 h-4" /> Configurações
                    </Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-white/10 my-1" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-white/5 cursor-pointer px-3 py-2 rounded-sm"
                    onClick={handleLogout}
                  >
                    <ArrowRight className="w-4 h-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login"
                className={`text-sm font-medium transition-colors ${textColor}`}
                onClick={scrollToTop}
              >
                Admin
              </Link>
            )}

            <Button
              onClick={() => setIsLeadModalOpen(true)}
              className="bg-revgreen text-black hover:bg-revgreen/90 font-bold rounded-full px-6 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
            >
              <span className="flex items-center gap-2">
                Agendar Call <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>

          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 transition-colors ml-auto ${isLightMode ? "text-black hover:text-revgreen" : "text-white hover:text-revgreen"}`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {
          isMenuOpen && (
            <div className="md:hidden bg-black border-t border-white/10 absolute top-full left-0 w-full h-screen animate-fade-in z-50 p-6 overflow-y-auto pb-20">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <Link to="/" onClick={scrollToTop} className="block">
                    <img
                      src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                      alt="RevHackers Logo"
                      className="h-14 w-auto"
                    />
                  </Link>
                </div>
                <MobileNavLink to="/" onClick={scrollToTop}>Home</MobileNavLink>

                <div className="py-2 border-b border-white/5">
                  <div className="text-xs font-mono-tech text-zinc-500 uppercase mb-3">Diagnósticos Gratuitos</div>
                  <div className="space-y-4 pl-2">
                    <Link to="/score-site" onClick={scrollToTop} className="flex items-center gap-3 text-lg font-medium text-zinc-300 hover:text-revgreen">
                      <Activity className="w-4 h-4 text-revgreen" /> Site / Conversão
                    </Link>
                    <Link to="/score-founder" onClick={scrollToTop} className="flex items-center gap-3 text-lg font-medium text-zinc-300 hover:text-revgreen">
                      <Users className="w-4 h-4 text-revgreen" /> Founder Led Sales
                    </Link>
                    <Link to="/score-revenue" onClick={scrollToTop} className="flex items-center gap-3 text-lg font-medium text-zinc-300 hover:text-revgreen">
                      <TrendingUp className="w-4 h-4 text-revgreen" /> Máquina de Vendas
                    </Link>
                  </div>
                </div>

                <MobileNavLink to="/quem-somos" onClick={scrollToTop}>Quem Somos</MobileNavLink>
                <MobileNavLink to="/servicos" onClick={scrollToTop}>Serviços</MobileNavLink>
                <MobileNavLink to="/cases" onClick={scrollToTop}>Cases</MobileNavLink>
                <MobileNavLink to="/materiais" onClick={scrollToTop}>Materiais</MobileNavLink>
                <MobileNavLink to="/blog" onClick={scrollToTop}>Blog</MobileNavLink>

                <div className="py-2 border-b border-white/5 mb-4">
                  <Link
                    to={user ? "/admin" : "/login"}
                    onClick={scrollToTop}
                    className="text-xl font-medium text-zinc-400 hover:text-white transition-colors block py-2"
                  >
                    {user ? "Acessar Admin" : "Login Membros"}
                  </Link>
                </div>

                <Button
                  onClick={() => { scrollToTop(); setIsLeadModalOpen(true); }}
                  className="w-full bg-revgreen text-black hover:bg-revgreen/90 font-bold rounded-full h-12 text-lg shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                >
                  <span className="flex items-center justify-center gap-2">
                    Agendar Call <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </div>
            </div>
          )
        }
      </header >
      <LeadCaptureModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
    </>
  );
};

export default Header;
