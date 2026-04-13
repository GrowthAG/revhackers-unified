import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LeadCaptureModal = ({ isOpen, onClose }: LeadCaptureModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Using the same API/Logic as SiteScore, but just capturing the lead
            await submitPublicDiagnostic(
                { name, email, phone, company, role },
                { source: 'header_booking_request', type: 'lead_capture' },
                0,
                { level: "Lead", description: "Solicitação de Agendamento", action: "Agendar", color: "blue" },
                'lead_capture'
            );

            toast({
                title: "Sucesso!",
                description: "Redirecionando para a agenda...",
                className: "bg-zinc-900 border-zinc-800 text-white"
            });

            // Delay for UX
            setTimeout(() => {
                onClose();
                navigate('/agenda');
            }, 1000);

        } catch (error) {
            console.error("Lead submission error:", error);
            toast({
                variant: 'destructive',
                title: "Erro",
                description: "Não foi possível enviar seus dados. Tente novamente."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-white border-zinc-100 p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-zinc-50 bg-zinc-950">
                    <DialogTitle className="text-xl font-bold text-white leading-tight flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-revgreen" />
                        Auditoria de Funil B2B
                    </DialogTitle>
                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                        Operamos com vagas restritas (Max 3/mês). Avaliaremos seu negócio e montaremos um mapa de IA e Automação para o seu CRM se houver fit.
                    </p>
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-sm">
                        <span className="text-revgreen font-bold text-xs uppercase tracking-widest">+12 Reuniões semanais</span>
                        <span className="text-zinc-500 text-xs">geradas em média pelos nossos clientes.</span>
                    </div>
                </DialogHeader>

                <div className="p-6 pt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xxs font-bold uppercase tracking-widest text-zinc-500">Nome Completo</label>
                            <Input
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-zinc-50 border-zinc-200 h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xxs font-bold uppercase tracking-widest text-zinc-500">Email Corporativo</label>
                            <Input
                                type="email"
                                placeholder="voce@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-zinc-50 border-zinc-200 h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xxs font-bold uppercase tracking-widest text-zinc-500">Telefone / WhatsApp</label>
                            <Input
                                placeholder="(11) 99999-9999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="bg-zinc-50 border-zinc-200 h-10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xxs font-bold uppercase tracking-widest text-zinc-500">Empresa</label>
                                <Input
                                    placeholder="Nome da empresa"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    required
                                    className="bg-zinc-50 border-zinc-200 h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xxs font-bold uppercase tracking-widest text-zinc-500">Cargo</label>
                                <Input
                                    placeholder="Ex: CEO, CMO"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    className="bg-zinc-50 border-zinc-200 h-10"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-revgreen text-black hover:bg-revgreen/90 font-black tracking-widest mt-2 h-14 text-sm uppercase transition-all"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verificar Disponibilidade Agora"}
                        </Button>

                        <p className="text-2xs text-center text-zinc-400 mt-6 leading-relaxed px-2 font-mono uppercase tracking-wider">
                            Análise Estrutural 100% gratuita. Confidencialidade absoluta dos dados de CRM.
                        </p>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LeadCaptureModal;
