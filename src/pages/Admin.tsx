import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Users, Settings, ArrowRight, Loader2, Trophy, Download, LayoutDashboard } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-white pt-40 pb-20 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="container-custom max-w-6xl mx-auto relative z-10">

          {/* Header - Clean & Minimalist */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-black/10 pb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase leading-none">
                Admin<span className="text-zinc-400">Hub</span>
              </h1>
              <p className="text-zinc-400 text-sm font-medium mt-4 tracking-wide">
                Central de gerenciamento
              </p>
            </div>
            <div className="flex flex-col items-end mt-6 md:mt-0">
              <p className="text-right text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">
                Logado como
              </p>
              <p className="text-xl font-bold text-black border-l-2 border-revgreen pl-4">
                {firstName}
              </p>
            </div>
          </div>

          {/* Grid Layout with Motion */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemAnim}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="group bg-white p-10 md:p-14 relative cursor-pointer border border-zinc-100 hover:border-black transition-colors duration-300 z-0 hover:z-10 hover:shadow-xl shadow-sm"
                onClick={() => navigate(item.link)}
              >
                {/* Hover Border Effect replaced by standard border transition for simpler motion compatibility */}

                <div className="flex justify-between items-start mb-12">
                  <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all duration-300">
                    <item.icon className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-black transition-colors">
                    0{index + 1}
                  </span>
                </div>

                <div className="relative">
                  <h3 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight mb-3 group-hover:translate-x-1 transition-transform duration-300">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-relaxed max-w-xs group-hover:text-zinc-600 transition-colors">
                    {item.description}
                  </p>

                  {/* Action Link visual */}
                  <div className="absolute top-[2px] right-[-20px] opacity-0 group-hover:opacity-100 group-hover:right-0 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-black" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Admin;
