
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./styles/article.css";

// Pages
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Diagnostico from "./pages/Diagnostico";
import SupabaseDiagnostic from "./pages/SupabaseDiagnostic";
import NotFound from "./pages/NotFound";
import QuemSomos from "./pages/QuemSomos";
import Servicos from "./pages/Servicos";
import ServicosDetalhe from "./pages/ServicosDetalhe";
import Cases from "./pages/Cases";
import CasesDetalhe from "./pages/CasesDetalhe";
import Downloads from "./pages/Downloads";
import Materiais from "./pages/Materiais";
import MaterialDetalhe from "./pages/MaterialDetalhe";
import Metodologia from "./pages/Metodologia";
import AdminPosts from "./pages/admin/AdminPosts";
import AgendaDiagnostico from "./pages/AgendaDiagnostico";
import Comunidade from "./pages/Comunidade";
import Booking from "./pages/Booking";
import Agenda from "./pages/Agenda";
import PartnerDetail from "./pages/PartnerDetail";
import PartnerEnics from "./pages/PartnerEnics";
import TermosDeUso from "./pages/TermosDeUso";
import Privacidade from "./pages/Privacidade";
import ThankYou from "./pages/ThankYou";
import SecureBooking from "./pages/SecureBooking";
import CadastroParceiro from "./pages/CadastroParceiro";
import PesquisaNPS from "./pages/PesquisaNPS";
import ObrigadoNPS from "./pages/ObrigadoNPS";

// Specialized Pages
import AgendaLuna from "./pages/AgendaLuna";
import AgendaGiulliano from "./pages/AgendaGiulliano";
import AgendaLinkedin from "./pages/AgendaLinkedin";
import AgendaKickoff from "./pages/AgendaKickoff";

// REI Workflows
import ReiHub from "./pages/REI-Hub";
import ReiDev from "./pages/REI-Dev";
import ReiConsulting from "./pages/REI-Consulting";
import ReiFounder from "./pages/REI-Founder";
import REIWizardPage from "./pages/REIWizardPage";
import REIResult from "./pages/REIResult";
import GrowthScore from "./pages/GrowthScore";
import SiteScore from "./pages/SiteScore";
import FounderScore from "./pages/FounderScore";
import RevenueScore from "./pages/RevenueScore";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import CompleteProfile from "./pages/auth/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import PublicDiagnosticResult from "./pages/PublicDiagnosticResult";

// Admin Pages
import Admin from "./pages/Admin";
import AdminPostNew from "./pages/AdminPostNew";
import AdminPostEdit from "./pages/AdminPostEdit";
import AdminSettings from "./pages/AdminSettings";
import ProfileSettings from "./pages/admin/ProfileSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import Settings from "./pages/admin/Settings";


// New Admin Content Management
import AdminMaterials from "./pages/admin/AdminMaterials";

import AdminMaterialNew from "./pages/admin/AdminMaterialNew";
import AdminMaterialEdit from "./pages/admin/AdminMaterialEdit";
import AdminSync from './pages/admin/AdminSync';
import FixMaterialsPage from "./pages/admin/FixMaterialsPage";
import AdminCases from "./pages/admin/AdminCases";

import AdminCaseNew from "./pages/admin/AdminCaseNew";
import AdminCaseEdit from "./pages/admin/AdminCaseEdit";

// Admin - REI Projects
import AdminREIProjects from "./pages/admin/AdminREIProjects";
import REIProjectForm from "./pages/admin/REIProjectForm";

import REIDashboard from "./pages/REIDashboard";
import REIOnboarding from "./pages/REIOnboarding";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/quem-somos" element={<QuemSomos />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/servicos/:slug" element={<ServicosDetalhe />} />
            <Route path="/metodologia" element={<Metodologia />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:slug" element={<CasesDetalhe />} />
            <Route path="/partners/:slug" element={<PartnerDetail />} />
            <Route path="/partners/enics" element={<PartnerEnics />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/materiais" element={<Materiais />} />
            <Route path="/materiais/:slug" element={<MaterialDetalhe />} />
            <Route path="/comunidade" element={<Comunidade />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/agenda-diagnostico" element={<AgendaDiagnostico />} />
            <Route path="/supabase-diagnostic" element={<SupabaseDiagnostic />} />

            {/* Legal & Feedback */}
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/obrigado" element={<ThankYou />} />
            <Route path="/pesquisa-nps" element={<PesquisaNPS />} />
            <Route path="/obrigado-nps" element={<ObrigadoNPS />} />

// Specialized Pages
            {/* Specialized Pages - Imports moved to top */}

            // ... existing code ...

            {/* Specialized Pages */}
            <Route path="/agenda/giulliano" element={<SecureBooking />} /> {/* Keeping legacy secure booking just in case, but user asked for standard pages */}
            <Route path="/agenda-giulliano" element={<AgendaGiulliano />} />
            <Route path="/agenda-luna" element={<AgendaLuna />} />
            <Route path="/agenda-linkedin" element={<AgendaLinkedin />} />
            <Route path="/agenda-kickoff" element={<AgendaKickoff />} />

            <Route path="/cadastro-parceiro" element={<CadastroParceiro />} />

            {/* REI System (Internal) - Unified */}
            <Route path="/rei" element={<ReiHub />} />
            <Route path="/rei/wizard" element={<ProtectedRoute><REIWizardPage /></ProtectedRoute>} />
            <Route path="/rei/resultado/:id" element={<REIResult />} />

            {/* Legacy REI Routes - Redirect to new system */}
            <Route path="/rei-onboarding" element={<Navigate to="/rei" replace />} />
            <Route path="/rei-dashboard" element={<Navigate to="/rei" replace />} />

            {/* Public Scores (Lead Gen) */}
            <Route path="/score" element={<GrowthScore />} />
            <Route path="/score-site" element={<SiteScore />} />
            <Route path="/score-founder" element={<FounderScore />} />
            <Route path="/score-revenue" element={<RevenueScore />} />
            <Route path="/diagnostico/resultado/:id" element={<PublicDiagnosticResult />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<UpdatePassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/rei-hub" element={<ReiHub />} />
            <Route path="/rei-dev" element={<ReiDev />} />
            <Route path="/rei-consulting" element={<ReiConsulting />} />
            <Route path="/rei-founder" element={<ReiFounder />} />

            {/* Redirect /dashboard to /admin (unified GROWTHHUB) */}
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

            {/* Admin Management - GROWTHHUB */}
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Admin - Posts */}
            <Route path="/admin/posts" element={<ProtectedRoute><AdminPosts /></ProtectedRoute>} />
            <Route path="/admin/posts/new" element={<ProtectedRoute><AdminPostNew /></ProtectedRoute>} />
            <Route path="/admin/posts/edit/:id" element={<ProtectedRoute><AdminPostEdit /></ProtectedRoute>} />

            {/* Admin - Materials */}
            <Route path="/admin/materials" element={<ProtectedRoute><AdminMaterials /></ProtectedRoute>} />
            <Route path="/admin/materials/new" element={<ProtectedRoute><AdminMaterialNew /></ProtectedRoute>} />
            <Route path="/admin/materials/edit/:id" element={<ProtectedRoute><AdminMaterialEdit /></ProtectedRoute>} />
            <Route path="/admin/fix-materials" element={<ProtectedRoute><FixMaterialsPage /></ProtectedRoute>} />

            {/* Admin - Cases */}
            <Route path="/admin/cases" element={<ProtectedRoute><AdminCases /></ProtectedRoute>} />
            <Route path="/admin/cases/new" element={<ProtectedRoute><AdminCaseNew /></ProtectedRoute>} />
            <Route path="/admin/cases/edit/:id" element={<ProtectedRoute><AdminCaseEdit /></ProtectedRoute>} />

            {/* Admin - REI Projects */}
            <Route path="/admin/rei" element={<ProtectedRoute><AdminREIProjects /></ProtectedRoute>} />
            <Route path="/admin/rei/novo" element={<ProtectedRoute><REIProjectForm /></ProtectedRoute>} />
            <Route path="/admin/rei/:id" element={<ProtectedRoute><REIProjectForm /></ProtectedRoute>} />

            {/* Admin - Sync */}
            <Route path="/admin/sync" element={<ProtectedRoute><AdminSync /></ProtectedRoute>} />



            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
