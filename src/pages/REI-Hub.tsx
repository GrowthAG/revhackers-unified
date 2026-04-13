import { Target, Code, Crown, ArrowRight, ArrowLeft, Database, Globe, ChevronDown, Loader2, Calendar, Check, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import type { REIType } from '@/types/rei';
import { createReiProject, getReiProjectsByClientEmail, ReiProject } from '@/api/reiProjects';
import { Button } from '@/components/ui/button';
import SEO from '@/components/shared/SEO';

// ── Type definitions ────────────────────────────────────────────────────
const REI_TYPES: { value: REIType; label: string; subtitle: string; icon: JSX.Element }[] = [
    { value: 'consulting', label: 'Consultoria 360°', subtitle: 'Diagnóstico completo de receita, operação comercial e Growth.', icon: <Target className="w-4 h-4" /> },
    { value: 'crm_ops', label: 'CRM & RevOps', subtitle: 'Estruturação de CRM, SLA de Vendas e Retenção.', icon: <Database className="w-4 h-4" /> },
    { value: 'founder', label: 'Founder Led Sales', subtitle: 'Posicionamento pessoal do fundador como motor de vendas.', icon: <Crown className="w-4 h-4" /> },
    { value: 'site', label: 'Site & Landing Pages', subtitle: 'Presença digital: site institucional, LP de alta conversão.', icon: <Globe className="w-4 h-4" /> },
];

// ── My Projects Section ─────────────────────────────────────────────────
function MyProjectsSection({ userEmail }: { userEmail?: string }) {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ReiProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!userEmail) { setLoading(false); return; }
            try {
                const data = await getReiProjectsByClientEmail(userEmail);
                setProjects(data);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [userEmail]);

    if (loading || projects.length === 0) return null;

    return (
        <div className="mb-16">
            <h2 className="text-xxs font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <Database className="w-3.5 h-3.5" /> Meus Diagnósticos
            </h2>
            <div className="space-y-2">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => project.status === 'active' ? navigate(`/hub/${project.id}`) : navigate(`/rei/wizard?projectId=${project.id}`)}
                        className="flex items-center justify-between p-5 bg-white border border-zinc-100 hover:border-black transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-revgreen' : 'bg-zinc-400'}`} />
                            <div>
                                <span className="text-xxs font-bold uppercase tracking-widest text-zinc-400">
                                    {project.type?.toUpperCase() || 'CONSULTING'}
                                </span>
                                <p className="text-sm font-bold text-black">
                                    {new Date(project.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xxs font-bold uppercase tracking-widest text-zinc-400">
                                {project.status === 'active' ? 'Concluído' : 'Pendente'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-black transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────
const ReiHubPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, userProfile, userRole, signOut } = useAuth();
    const [creatingProject, setCreatingProject] = useState(false);
    const [selectedType, setSelectedType] = useState<REIType | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [firstName, setFirstName] = useState<string>('');

    // ── Project redirect shield ─────────────────────────────────────────
    // Verifica se o cliente tem projeto ativo ANTES de renderizar a página,
    // evitando o flash da tela de seleção de protocolo antes do redirect.
    const [projectCheckDone, setProjectCheckDone] = useState(!user?.email);

    useEffect(() => {
        if (!user?.email) {
            setProjectCheckDone(true);
            return;
        }
        getReiProjectsByClientEmail(user.email)
            .then((data) => {
                if (data.length === 1 && data[0].status === 'active') {
                    navigate(`/hub/${data[0].id}`, { replace: true });
                } else {
                    setProjectCheckDone(true);
                }
            })
            .catch(() => setProjectCheckDone(true));
    }, [user?.email]);

    useEffect(() => {
        if (userProfile?.full_name) setFirstName(userProfile.full_name.split(' ')[0]);
        else if (user?.email) setFirstName(user.email.split('@')[0]);
    }, [user, userProfile]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Enquanto verifica projetos, nao exibe nada (evita flash)
    if (!projectCheckDone) {
        return <div className="min-h-screen bg-white" />;
    }

    const handleStart = async () => {
        if (!selectedType) {
            toast({ title: 'Selecione um protocolo', description: 'Escolha o tipo de diagnóstico antes de iniciar.', variant: 'destructive' });
            return;
        }

        setCreatingProject(true);
        try {
            const now = new Date();
            const quarter = (['Q1', 'Q2', 'Q3', 'Q4'] as const)[Math.floor(now.getMonth() / 3)];
            const result = await createReiProject({
                type: selectedType,
                client_email: user?.email || '',
                client_name: userProfile?.full_name || '',
                analyst_email: '',
                status: 'pending',
                quarter,
                year: now.getFullYear(),
                next_rei_date: new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0).toISOString(),
            });
            toast({ title: 'Projeto criado!', description: 'Redirecionando para o diagnóstico...', className: 'bg-revgreen border-none text-black' });
            navigate(`/rei/wizard?projectId=${result.project.id}`);
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            toast({ title: 'Erro', description: 'Não foi possível criar o projeto. Tente novamente.', variant: 'destructive' });
        } finally {
            setCreatingProject(false);
        }
    };

    const selected = REI_TYPES.find(t => t.value === selectedType);

    return (
        <PageLayout>
            <SEO title="REI Hub" description="Revenue Engine Intelligence - Diagnósticos estratégicos de receita para sua operação B2B." canonical="https://revhackers.com.br/rei-hub" />
            <div className="min-h-screen bg-white pt-40 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

                <div className="container-custom max-w-3xl mx-auto relative z-10">

                    {/* Header */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            {userRole === 'user' ? (
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-2 group cursor-pointer transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center group-hover:border-zinc-900 group-hover:bg-zinc-900 transition-all">
                                        <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-xxs uppercase tracking-widest font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">Sair da Conta</span>
                                </button>
                            ) : (
                                <Link to="/admin" className="flex items-center gap-2 group cursor-pointer transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center group-hover:border-black group-hover:bg-black transition-all">
                                        <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-xxs uppercase tracking-widest font-bold text-zinc-400 group-hover:text-black transition-colors">Voltar ao Hub Interno</span>
                                </Link>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase leading-none mb-2">
                            REI <span className="text-zinc-300">Hub</span>
                        </h1>
                        <p className="text-zinc-400 text-sm font-medium tracking-wide uppercase">
                            Revenue Engine Intelligence - {firstName && `Olá, ${firstName}`}
                        </p>
                    </div>

                    {/* My Projects */}
                    <MyProjectsSection userEmail={user?.email} />

                    {/* New Diagnostic Section */}
                    <div className="border-t border-zinc-100 pt-12">
                        <h2 className="text-xxs font-black text-zinc-400 uppercase tracking-[0.3em] mb-8">
                            Novo Diagnóstico
                        </h2>

                        <div className="bg-white border border-zinc-200 p-8 md:p-12">
                            {/* Protocol Dropdown */}
                            <div className="mb-8">
                                <label className="text-xxs font-black text-zinc-400 uppercase tracking-[0.2em] block mb-3">
                                    Protocolo
                                </label>
                                <div ref={dropdownRef} className="relative">
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className={`w-full flex items-center justify-between p-4 border text-left transition-all ${dropdownOpen ? 'border-black' : 'border-zinc-200 hover:border-zinc-400'
                                            } ${selected ? 'bg-white' : 'bg-zinc-50'}`}
                                    >
                                        {selected ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-black text-white flex items-center justify-center">
                                                    {selected.icon}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-black uppercase tracking-tight">{selected.label}</p>
                                                    <p className="text-xs text-zinc-400">{selected.subtitle}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-zinc-400">Selecione o protocolo de análise...</span>
                                        )}
                                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-zinc-200 border-t-0 z-50 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
                                            {REI_TYPES.map((type) => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => { setSelectedType(type.value); setDropdownOpen(false); }}
                                                    className={`w-full flex items-center gap-4 p-4 text-left transition-all hover:bg-zinc-50 border-b border-zinc-50 last:border-b-0 ${selectedType === type.value ? 'bg-zinc-50' : ''
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 flex items-center justify-center transition-colors ${selectedType === type.value ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'
                                                        }`}>
                                                        {type.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-black uppercase tracking-tight">{type.label}</p>
                                                        <p className="text-xs text-zinc-400 truncate">{type.subtitle}</p>
                                                    </div>
                                                    {selectedType === type.value && (
                                                        <Check className="w-4 h-4 text-black shrink-0" />
                                                    )}
                                                    {type.value === 'consulting' && selectedType !== type.value && (
                                                        <span className="text-2xs font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 shrink-0">Recomendado</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Start Button */}
                            <Button
                                onClick={handleStart}
                                disabled={!selectedType || creatingProject}
                                className="w-full bg-black text-white hover:bg-zinc-800 rounded-none h-14 uppercase text-xs font-black tracking-[0.3em] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {creatingProject ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</>
                                ) : (
                                    <><ArrowRight className="w-4 h-4 mr-2" /> Iniciar Diagnóstico</>
                                )}
                            </Button>
                        </div>

                        {/* Helper text */}
                        <p className="text-xxs text-zinc-300 uppercase tracking-widest mt-4 text-center">
                            Selecione o protocolo e clique em Iniciar para começar a análise
                        </p>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ReiHubPage;
