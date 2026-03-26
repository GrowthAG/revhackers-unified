import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./styles/article.css";

// ─── Eager Imports (Critical Public Pages) ───────────────────────────
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

// ─── Loading Fallback ────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
  </div>
);

// ─── Lazy Imports (Code-Split Routes) ────────────────────────────────
// Public Pages
const PublicDealRoom = lazy(() => import("./pages/public/PublicDealRoom"));
const Diagnostico = lazy(() => import("./pages/Diagnostico"));
const SupabaseDiagnostic = lazy(() => import("./pages/SupabaseDiagnostic"));
const QuemSomos = lazy(() => import("./pages/QuemSomos"));
const Servicos = lazy(() => import("./pages/Servicos"));
const ServicosDetalhe = lazy(() => import("./pages/ServicosDetalhe"));
const Cases = lazy(() => import("./pages/Cases"));
const CasesDetalhe = lazy(() => import("./pages/CasesDetalhe"));
const Downloads = lazy(() => import("./pages/Downloads"));
const Materiais = lazy(() => import("./pages/Materiais"));
const MaterialLanding = lazy(() => import("./pages/MaterialLanding"));
const Metodologia = lazy(() => import("./pages/Metodologia"));
const AgendaDiagnostico = lazy(() => import("./pages/AgendaDiagnostico"));
const Comunidade = lazy(() => import("./pages/Comunidade"));
const Booking = lazy(() => import("./pages/Booking"));
const Agenda = lazy(() => import("./pages/Agenda"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail"));
const PartnerEnics = lazy(() => import("./pages/PartnerEnics"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const SecureBooking = lazy(() => import("./pages/SecureBooking"));
const CadastroParceiro = lazy(() => import("./pages/CadastroParceiro"));
const PesquisaNPS = lazy(() => import("./pages/PesquisaNPS"));
const ObrigadoNPS = lazy(() => import("./pages/ObrigadoNPS"));
const ClientOnboarding = lazy(() => import("./pages/public/ClientOnboarding"));
const OnboardingSuccess = lazy(() => import("./pages/public/OnboardingSuccess"));
const MaterialUpload = lazy(() => import("./pages/public/MaterialUpload"));
const PublicDiagnosticResult = lazy(() => import("./pages/PublicDiagnosticResult"));
const SchedulingSuccess = lazy(() => import("./pages/SchedulingSuccess"));
const CertificateOfAuthenticity = lazy(() => import("./pages/public/CertificateOfAuthenticity"));
const MagicApproval = lazy(() => import("./pages/public/MagicApproval"));

// Specialized Agenda Pages
const AgendaLuna = lazy(() => import("./pages/AgendaLuna"));
const AgendaGiulliano = lazy(() => import("./pages/AgendaGiulliano"));
const AgendaLinkedin = lazy(() => import("./pages/AgendaLinkedin"));
const AgendaKickoff = lazy(() => import("./pages/AgendaKickoff"));

// Score Pages (Heavy - 21-70KB each)
const GrowthScore = lazy(() => import("./pages/GrowthScore"));
const SiteScore = lazy(() => import("./pages/SiteScore"));
const FounderScore = lazy(() => import("./pages/FounderScore"));
const RevenueScore = lazy(() => import("./pages/RevenueScore"));

// REI Workflows (Heavy - 15-38KB each)
const ReiHub = lazy(() => import("./pages/REI-Hub"));
const ReiDev = lazy(() => import("./pages/REI-Dev"));
const ReiConsulting = lazy(() => import("./pages/REI-Consulting"));
const ReiFounder = lazy(() => import("./pages/REI-Founder"));
const REIWizardPage = lazy(() => import("./pages/REIWizardPage"));
const REIResult = lazy(() => import("./pages/REIResult"));
const REIDashboard = lazy(() => import("./pages/REIDashboard"));
const REIOnboarding = lazy(() => import("./pages/REIOnboarding"));

// Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/auth/UpdatePassword"));
const CompleteProfile = lazy(() => import("./pages/auth/CompleteProfile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Admin Pages (Never loaded by public visitors)
const Admin = lazy(() => import("./pages/Admin"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const ProfileSettings = lazy(() => import("./pages/admin/ProfileSettings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AdminMaterials = lazy(() => import("./pages/admin/AdminMaterials"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const ClientForm = lazy(() => import("./pages/admin/ClientForm"));
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminMaterialNew = lazy(() => import("./pages/admin/AdminMaterialNew"));
const AdminMaterialEdit = lazy(() => import("./pages/admin/AdminMaterialEdit"));
const AdminSync = lazy(() => import("./pages/admin/AdminSync"));
const FixMaterialsPage = lazy(() => import("./pages/admin/FixMaterialsPage"));
const AdminCases = lazy(() => import("./pages/admin/AdminCases"));
const AdminCaseNew = lazy(() => import("./pages/admin/AdminCaseNew"));
const AdminCaseEdit = lazy(() => import("./pages/admin/AdminCaseEdit"));
const DiagnosticView = lazy(() => import("./pages/admin/DiagnosticView"));
const AdminREIProjects = lazy(() => import("./pages/admin/AdminREIProjects"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const REIProjectForm = lazy(() => import("./pages/admin/REIProjectForm"));
const StrategyPlanning = lazy(() => import("./pages/admin/StrategyPlanning"));
const GrowthCronograma = lazy(() => import("./pages/admin/GrowthCronograma"));
const OrchestratedOnboarding = lazy(() => import("./pages/admin/OrchestratedOnboarding"));
const LiveStrategicPlan = lazy(() => import("./pages/admin/LiveStrategicPlan"));
const ProjectDetails = lazy(() => import("./pages/admin/ProjectDetails"));
const StrategicPlanGenerator = lazy(() => import("./pages/admin/StrategicPlanGenerator"));
const KnowledgeDocument = lazy(() => import("./pages/admin/KnowledgeDocument"));
const AdminProposals = lazy(() => import("./pages/admin/AdminProposals"));
const RevenueCockpit = lazy(() => import("./pages/admin/RevenueCockpit"));
const AdminProposalNew = lazy(() => import("./pages/admin/AdminProposalNew"));
const AdminProposalEdit = lazy(() => import("./pages/admin/AdminProposalEdit"));
const MeetingRecordingDoc = lazy(() => import("./pages/admin/MeetingRecordingDoc"));

// Client Pages
const StrategicPlanPresentation = lazy(() => import("./pages/client/StrategicPlanPresentation"));
const ClientProjectHub = lazy(() => import("./pages/client/ClientProjectHub"));

// Pitch Deck (Cinema Mode para Vendas)
const PitchDeckPresentation = lazy(() => import("./pages/admin/PitchDeckPresentation"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // IMPEDE PERDA DE DADOS EM FORMS AO TROCAR DE ABA
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <>
            <Toaster />
            <Sonner />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <ErrorBoundary>
                <Routes>
                  {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/p/:slug" element={<PublicDealRoom />} /> {/* Public Deal Room Route */}
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
              <Route path="/materiais/:slug" element={<MaterialLanding />} />
              <Route path="/comunidade" element={<Comunidade />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/agenda-diagnostico" element={<AgendaDiagnostico />} />
              <Route path="/supabase-diagnostic" element={<SupabaseDiagnostic />} />

              {/* Public Onboarding */}
              <Route path="/cadastro-cliente" element={<ClientOnboarding />} />
              <Route path="/onboarding/success" element={<OnboardingSuccess />} />
              <Route path="/upload-materiais/:projectId" element={<MaterialUpload />} />

              {/* Legal & Feedback */}
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/obrigado" element={<ThankYou />} />
              <Route path="/pesquisa-nps" element={<PesquisaNPS />} />
              <Route path="/obrigado-nps" element={<ObrigadoNPS />} />
              <Route path="/legal/certificado/:hash" element={<CertificateOfAuthenticity />} />
              
              {/* Epic 8: Magic Approval Route */}
              <Route path="/approve/:token" element={<MagicApproval />} />

              {/* Specialized Pages */}
              <Route path="/agenda/giulliano" element={<SecureBooking />} />
              <Route path="/agenda-giulliano" element={<AgendaGiulliano />} />
              <Route path="/agenda-luna" element={<AgendaLuna />} />
              <Route path="/agenda-linkedin" element={<AgendaLinkedin />} />
              <Route path="/agenda-kickoff" element={<AgendaKickoff />} />

              <Route path="/cadastro-parceiro" element={<CadastroParceiro />} />

              {/* REI System (Internal) - Unified */}
              <Route path="/rei" element={<Navigate to="/rei-hub" replace />} />
              <Route path="/rei/wizard" element={<ProtectedRoute><REIWizardPage /></ProtectedRoute>} />
              <Route path="/rei/resultado/:id" element={<REIResult />} />
              <Route path="/rei/success" element={<ProtectedRoute><SchedulingSuccess /></ProtectedRoute>} />

              {/* Legacy REI Routes - Redirect to new system */}
              <Route path="/rei-onboarding" element={<Navigate to="/rei-hub" replace />} />
              <Route path="/rei-dashboard" element={<Navigate to="/rei-hub" replace />} />

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
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/jornada/:id" element={<ProtectedRoute><OrchestratedOnboarding /></ProtectedRoute>} />
              <Route path="/admin/strategic-plan/:projectId" element={<ProtectedRoute><LiveStrategicPlan /></ProtectedRoute>} />

              <Route path="/admin/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Admin - Clients */}
              <Route path="/admin/clients" element={<ProtectedRoute><AdminClients /></ProtectedRoute>} />
              <Route path="/admin/clients/novo" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />
              <Route path="/admin/clients/edit/:id" element={<ProtectedRoute><ClientForm /></ProtectedRoute>} />

              {/* Admin - Posts */}
              {/* Admin - Posts (Rotas removidas) */}

              {/* Pitch Deck (Cinema Mode) */}
              <Route path="/admin/pitch/:id" element={<ProtectedRoute><PitchDeckPresentation /></ProtectedRoute>} />

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

              <Route path="/admin/sync" element={<ProtectedRoute><AdminSync /></ProtectedRoute>} />
              <Route path="/admin/estrategia" element={<ProtectedRoute><StrategyPlanning /></ProtectedRoute>} />
              <Route path="/admin/estrategia/:id" element={<ProtectedRoute><StrategyPlanning /></ProtectedRoute>} />
              <Route path="/admin/cronograma" element={<ProtectedRoute><GrowthCronograma /></ProtectedRoute>} />
              <Route path="/admin/cronograma/:id" element={<ProtectedRoute><GrowthCronograma /></ProtectedRoute>} />
              {/* Unified Project Workspace */}
              <Route path="/admin/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
              
              {/* Project Wiki / Document Editor */}
              <Route path="/admin/knowledge/:libraryId/doc/new" element={<ProtectedRoute><KnowledgeDocument /></ProtectedRoute>} />
              <Route path="/admin/knowledge/:libraryId/doc/:docId" element={<ProtectedRoute><KnowledgeDocument /></ProtectedRoute>} />
              
              {/* Meeting Recording Notion-Style Viewer */}
              <Route path="/admin/recording/:id" element={<ProtectedRoute><MeetingRecordingDoc /></ProtectedRoute>} />
              
              {/* Legacy Redirects */}
              <Route path="/admin/jornada" element={<Navigate to="/admin/rei" replace />} />
              <Route path="/admin/jornada/:id" element={<Navigate to="/admin/projects/:id" replace />} />

              {/* Admin - Diagnostic View (The Voice) */}
              <Route path="/admin/diagnostico/:id" element={<ProtectedRoute><DiagnosticView /></ProtectedRoute>} />

              {/* Admin - Strategic Plan Generator */}
              <Route path="/admin/planejamento/:reiProjectId" element={<ProtectedRoute><StrategicPlanGenerator /></ProtectedRoute>} />
              <Route path="/admin/integrations" element={<ProtectedRoute><AdminIntegrations /></ProtectedRoute>} />



              {/* Revenue Cockpit - substitui o Centro de Propostas */}
              <Route path="/admin/proposals" element={<ProtectedRoute><RevenueCockpit /></ProtectedRoute>} />
              <Route path="/admin/proposals/legacy" element={<ProtectedRoute><AdminProposals /></ProtectedRoute>} />
              <Route path="/admin/proposals/new" element={<ProtectedRoute><AdminProposalNew /></ProtectedRoute>} />
              <Route path="/admin/proposals/edit/:id" element={<ProtectedRoute><AdminProposalEdit /></ProtectedRoute>} />

              {/* Client - Strategic Plan Presentation (Public with token) */}
              <Route path="/plan/:token" element={<StrategicPlanPresentation />} />
              {/* Rota PlanSignPage removida */}
              <Route path="/hub/:id" element={<ClientProjectHub />} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
          </>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
