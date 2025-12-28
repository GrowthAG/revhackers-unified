import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Users, Settings, ArrowRight, Loader2, Trophy, Download, LayoutDashboard } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { user, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    if (userProfile?.full_name) {
      const first = userProfile.full_name.split(' ')[0];
      setFirstName(first);
    } else if (user?.email) {
      const emailName = user.email.split('@')[0];
      setFirstName(emailName);
    }
  }, [user, userProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  const menuItems = [
    {
      title: "Blog Posts",
      description: "Gerencie artigos, categorias e autores do blog.",
      icon: FileText,
      link: "/admin/posts",
    },
    {
      title: "Materiais Ricos",
      description: "Ebooks, planilhas e whitepapers para download.",
      icon: Download,
      link: "/admin/materials",
    },
    {
      title: "Cases de Sucesso",
      description: "Histórias de clientes e resultados alcançados.",
      icon: Trophy,
      link: "/admin/cases",
    },
    {
      title: "REI",
      description: "Revenue Intelligence Hub",
      icon: LayoutDashboard,
      link: "/rei-hub",
    }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-white py-32">
        <div className="container-custom max-w-7xl mx-auto">
          {/* Header Minimalista Centralizado */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-black mb-4 tracking-tighter uppercase">
              Admin Hub
            </h1>
            <p className="text-xs text-zinc-400 font-normal tracking-wide uppercase">
              Bem-vindo de volta, {firstName}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="group bg-white border border-zinc-200 hover:border-black transition-all duration-300 cursor-pointer p-8 flex flex-col justify-between h-[240px]"
                onClick={() => navigate(item.link)}
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center group-hover:border-black transition-colors">
                    <item.icon className="h-5 w-5 text-zinc-400 group-hover:text-black transition-colors" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-black transition-colors" />
                </div>

                <div>
                  <h3 className="text-black text-lg font-black uppercase tracking-[0.2em] mb-2 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-[10px] uppercase tracking-[0.25em] font-bold leading-relaxed transition-colors max-w-[240px]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Admin;
