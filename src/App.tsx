
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Diagnostico from "./pages/Diagnostico";
import NotFound from "./pages/NotFound";
import QuemSomos from "./pages/QuemSomos";
import Servicos from "./pages/Servicos";
import ServicosDetalhe from "./pages/ServicosDetalhe";
import Cases from "./pages/Cases";
import CasesDetalhe from "./pages/CasesDetalhe";
import Downloads from "./pages/Downloads";
import Materiais from "./pages/Materiais";
import MaterialDetalhe from "./pages/MaterialDetalhe";
import Comunidade from "./pages/Comunidade";
import Booking from "./pages/Booking";
import AgendaDiagnosticoPage from "./pages/AgendaDiagnostico";
import PartnerDetail from "./pages/PartnerDetail";
import PartnerEnics from "./pages/PartnerEnics";
import TermosDeUso from "./pages/TermosDeUso";
import Privacidade from "./pages/Privacidade";
import ThankYou from "./pages/ThankYou";
import SecureBooking from "./pages/SecureBooking";
import Rei from "./pages/Rei";
import CadastroParceiro from "./pages/CadastroParceiro";
import PesquisaNPS from "./pages/PesquisaNPS";
import ObrigadoNPS from "./pages/ObrigadoNPS";

// Admin Pages
import Admin from "./pages/Admin";
import AdminPosts from "./pages/AdminPosts";
import AdminPostNew from "./pages/AdminPostNew";
import AdminPostEdit from "./pages/AdminPostEdit";
import AdminSettings from "./pages/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/servicos/:slug" element={<ServicosDetalhe />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:slug" element={<CasesDetalhe />} />
          <Route path="/partners/:slug" element={<PartnerDetail />} />
          <Route path="/partners/enics" element={<PartnerEnics />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/materiais/:slug" element={<MaterialDetalhe />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/agenda-diagnostico" element={<AgendaDiagnosticoPage />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/obrigado" element={<ThankYou />} />
          <Route path="/agenda/giulliano" element={<SecureBooking />} />
          <Route path="/rei" element={<Rei />} />
          <Route path="/cadastro-parceiro" element={<CadastroParceiro />} />
          <Route path="/pesquisa-nps" element={<PesquisaNPS />} />
          <Route path="/obrigado-nps" element={<ObrigadoNPS />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/posts" element={<AdminPosts />} />
          <Route path="/admin/posts/new" element={<AdminPostNew />} />
          <Route path="/admin/posts/edit/:id" element={<AdminPostEdit />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
