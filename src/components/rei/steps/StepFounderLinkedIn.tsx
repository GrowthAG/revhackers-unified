import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, CheckCircle2, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StepFounderProps {
    form: UseFormReturn<any>;
}

interface ScrapedProfile {
    name: string;
    headline: string;
    about: string;
    skills: string[];
}

export default function StepFounderLinkedIn({ form }: StepFounderProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [scrapedData, setScrapedData] = useState<ScrapedProfile | null>(null);
    const linkedInUrl = form.watch('linkedin_url');

    const handleScrape = async () => {
        if (!linkedInUrl) {
            toast({
                title: "URL Necessária",
                description: "Por favor, insira o link do perfil do LinkedIn.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            // Chamada Real para a Inteligência Artificial (Edge Function)
            const { data, error } = await supabase.functions.invoke('scrape-profile', {
                body: { url: linkedInUrl }
            });

            if (error) {
                console.error("Supabase EF Error:", error);
                throw new Error("Falha na chamada da automação DLT");
            }

            if (!data || !data.name) {
                throw new Error("Perfil não encontrado ou privado demais");
            }

            const profileData: ScrapedProfile = {
                name: data.name,
                headline: data.headline,
                about: data.about || data.summary || "",
                skills: data.skills || data.softSkills || []
            };

            setScrapedData(profileData);

            form.setValue('founder_name', profileData.name);
            form.setValue('founder_role', profileData.headline);
            form.setValue('founder_bio', profileData.about);
            if (data.actionableInsight || data.superpowers) {
                 form.setValue('founder_superpowers', data.actionableInsight || data.superpowers || "Mapeado via Automação de Perfil.");
            }

            toast({
                title: "Inteligência Estratégica Extraída",
                description: "Dados capturados da Web e enriquecidos via IA. Revise os campos.",
                className: "bg-black text-white border-zinc-700"
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro na Busca",
                description: "Não foi possível extrair dados automaticamente. Por favor preencha manualmente.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Founder Intelligence
                </h2>
                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                    Etapa 02: Identidade & Histórico
                </p>
            </div>

            {/* Scraping Section */}
            <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-sm">
                <Label className="text-sm font-bold text-black uppercase tracking-wider mb-2 block">
                    Link do Perfil LinkedIn (Founder/CEO)
                </Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            <span className="font-bold text-xs">in/</span>
                        </div>
                        <Input
                            {...form.register('linkedin_url')}
                            placeholder="joaosilva-ceo"
                            className="pl-10 h-12 bg-white border-zinc-300 focus:border-black transition-all"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleScrape}
                        disabled={loading || !linkedInUrl}
                        className="h-12 px-6 bg-black hover:bg-zinc-800 text-white font-bold uppercase tracking-widest text-xs"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
                        {loading ? 'Analisando...' : 'Auto-Preencher'}
                    </Button>
                </div>
                <p className="text-xxs text-zinc-500 mt-2">
                    Nossa IA pode preencher 80% dos campos abaixo automaticamente.
                </p>
            </div>

            {/* Fields Section (Identity & History) */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Seu Nome *</Label>
                        <Input
                            {...form.register('founder_name')}
                            placeholder="Nome completo"
                            className="h-12 bg-white border-zinc-200 focus:border-black transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Cargo / Headline *</Label>
                        <Input
                            {...form.register('founder_role')}
                            placeholder="Ex: CEO & Founder"
                            className="h-12 bg-white border-zinc-200 focus:border-black transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Mini-Bio / Histórico *</Label>
                    <Textarea
                        {...form.register('founder_bio')}
                        placeholder="Resuma sua jornada empreendedora..."
                        className="min-h-[120px] bg-white border-zinc-200 focus:border-black transition-all resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" /> Seus Diferenciais Estratégicos (Superpowers) *
                    </Label>
                    <Textarea
                        {...form.register('founder_superpowers')}
                        placeholder="O que você faz melhor que 90% do mercado? Ex: Visão de Produto, Vendas, Networking..."
                        className="min-h-[100px] bg-white border-zinc-200 focus:border-black transition-all resize-none"
                    />
                </div>

                {scrapedData && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-sm flex items-start gap-4">
                        <CheckCircle2 className="text-green-600 h-5 w-5 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-green-800">Skills Detectadas via LinkedIn</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {scrapedData.skills.map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="bg-white border border-green-200 text-green-700 text-2xs uppercase tracking-wider">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
