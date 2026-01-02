
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StepFounderDeepDiveProps {
    form: UseFormReturn<any>;
}

// Constants from legacy file
const TONES = [
    "Totalmente Profissional/Corporativo",
    "Profissional mas Acessível",
    "Líder de Pensamento (Polêmico)",
    "Mentor/Educador",
    "Vida Real (Misto Pessoal/Profissional)"
];

const FORMATS = [
    "Apenas Texto",
    "Foto + Texto",
    "Vídeos Curtos (Reels/TikTok)",
    "Vídeos Longos",
    "Artigos Longos"
];

const FREQUENCY = [
    "1x por semana",
    "2-3x por semana",
    "Diariamente",
    "Quando der na telha"
];

export default function StepFounderDeepDive({ form }: StepFounderDeepDiveProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Estratégia & Conteúdo
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    Etapa 03: Posicionamento
                </p>
            </div>

            <div className="space-y-8">
                {/* Authority Pillars */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-l-4 border-revgreen pl-3 uppercase tracking-tight">Pilares de Autoridade</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Tópicos de Domínio *</Label>
                            <Textarea
                                {...form.register('authority_topics')}
                                placeholder="Sobre o que você quer ser referência? Ex: Vendas B2B, Liderança..."
                                className="h-24 bg-white border-zinc-200 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Mitos do Mercado (Hot Takes)</Label>
                            <Textarea
                                {...form.register('industry_myths')}
                                placeholder="Do que você discorda no mercado? Que crenças você quer quebrar?"
                                className="h-24 bg-white border-zinc-200 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Audience & Tone */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-l-4 border-revgreen pl-3 uppercase tracking-tight">Audiência & Tom</h3>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Público-Alvo Principal *</Label>
                        <Input
                            {...form.register('target_audience')}
                            placeholder="Quem você quer atrair? (Ex: Investidores, Talentos, Clientes Enterprise)"
                            className="bg-white border-zinc-200"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Tom de Voz *</Label>
                            <Select onValueChange={(val) => form.setValue('tone_voice', val)} defaultValue={form.watch('tone_voice')}>
                                <SelectTrigger className="bg-white border-zinc-200">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Referências (Opcional)</Label>
                            <Input
                                {...form.register('references')}
                                placeholder="Nomes ou links de quem você admira"
                                className="bg-white border-zinc-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-l-4 border-revgreen pl-3 uppercase tracking-tight">Logística</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Disponibilidade Real *</Label>
                            <Select onValueChange={(val) => form.setValue('content_frequency', val)} defaultValue={form.watch('content_frequency')}>
                                <SelectTrigger className="bg-white border-zinc-200">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {FREQUENCY.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Formatos Preferidos *</Label>
                            <Select onValueChange={(val) => form.setValue('preferred_formats', val)} defaultValue={form.watch('preferred_formats')}>
                                <SelectTrigger className="bg-white border-zinc-200">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {FORMATS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Vision */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-l-4 border-revgreen pl-3 uppercase tracking-tight">Visão de Sucesso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Anti-Metas (O que NÃO ser) *</Label>
                            <Textarea
                                {...form.register('anti_goals')}
                                placeholder="O que seria um fracasso de imagem para você?"
                                className="h-24 bg-white border-zinc-200 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wide text-zinc-500">Visão de 1 Ano *</Label>
                            <Textarea
                                {...form.register('success_vision')}
                                placeholder="Como você quer ser reconhecido daqui a 12 meses?"
                                className="h-24 bg-white border-zinc-200 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
