import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Step4Props {
    form: UseFormReturn<any>;
}

const canaisOptions = [
    { id: 'google-ads', label: 'Google Ads' },
    { id: 'meta-ads', label: 'Meta Ads (Facebook/Instagram)' },
    { id: 'linkedin-ads', label: 'LinkedIn Ads' },
    { id: 'seo', label: 'SEO/Conteúdo' },
    { id: 'outbound', label: 'Outbound (Cold email/LinkedIn)' },
    { id: 'indicacoes', label: 'Indicações/Referral' },
    { id: 'parcerias', label: 'Parcerias' },
    { id: 'eventos', label: 'Eventos' },
];

const metricasOptions = [
    { id: 'cac', label: 'CAC (Custo de Aquisição)' },
    { id: 'ltv', label: 'LTV (Lifetime Value)' },
    { id: 'churn', label: 'Churn Rate' },
    { id: 'mrr', label: 'MRR/ARR' },
    { id: 'conversao', label: 'Taxa de conversão por etapa do funil' },
    { id: 'payback', label: 'Payback period' },
];

export default function Step4Estrategia({ form }: Step4Props) {
    const canaisSelecionados = form.watch('canaisAquisicao') || [];
    const metricasSelecionadas = form.watch('metricas') || [];

    const toggleCanal = (canalId: string) => {
        const current = canaisSelecionados;
        const updated = current.includes(canalId)
            ? current.filter((id: string) => id !== canalId)
            : [...current, canalId];
        form.setValue('canaisAquisicao', updated);
    };

    const toggleMetrica = (metricaId: string) => {
        const current = metricasSelecionadas;
        const updated = current.includes(metricaId)
            ? current.filter((id: string) => id !== metricaId)
            : [...current, metricaId];
        form.setValue('metricas', updated);
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Estratégia Atual
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    Etapa 04/05
                </p>
            </div>

            <div className="space-y-6">
                {/* Canais de Aquisição */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Quais canais de aquisição você usa hoje? * (múltipla escolha)
                    </Label>
                    <div className="space-y-2 border border-zinc-200 p-4 rounded-sm bg-white max-h-64 overflow-y-auto">
                        {canaisOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={option.id}
                                    checked={canaisSelecionados.includes(option.id)}
                                    onCheckedChange={() => toggleCanal(option.id)}
                                />
                                <label
                                    htmlFor={option.id}
                                    className="text-sm text-zinc-700 cursor-pointer"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                    {form.formState.errors.canaisAquisicao && (
                        <p className="text-red-500 text-xs">{form.formState.errors.canaisAquisicao.message as string}</p>
                    )}
                </div>

                {/* CRM */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual ferramenta de CRM/Automação você utiliza? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('crm', value)}
                        value={form.watch('crm')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="hubspot">HubSpot</SelectItem>
                            <SelectItem value="funnels">Funnels</SelectItem>
                            <SelectItem value="rd-station">RD Station</SelectItem>
                            <SelectItem value="salesforce">Salesforce</SelectItem>
                            <SelectItem value="pipedrive">Pipedrive</SelectItem>
                            <SelectItem value="activecampaign">ActiveCampaign</SelectItem>
                            <SelectItem value="nao-utilizo">Não utilizo CRM</SelectItem>
                            <SelectItem value="outro">Outro (Qual?)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.watch('crm') === 'outro' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <input
                                {...form.register('crm_outro')}
                                placeholder="Qual CRM você utiliza?"
                                className="w-full h-12 p-3 bg-white border border-zinc-200 focus:border-black outline-none transition-colors rounded-none placeholder:text-zinc-400 text-sm"
                            />
                        </div>
                    )}
                    {form.formState.errors.crm && (
                        <p className="text-red-500 text-xs">{form.formState.errors.crm.message as string}</p>
                    )}
                </div>

                {/* Time de Growth */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Como está estruturado seu time de Growth? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('timeGrowth', value)}
                        value={form.watch('timeGrowth')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nao-tenho">Não tenho time dedicado</SelectItem>
                            <SelectItem value="1-2">1-2 pessoas</SelectItem>
                            <SelectItem value="3-5">3-5 pessoas</SelectItem>
                            <SelectItem value="6-10">6-10 pessoas</SelectItem>
                            <SelectItem value="10-plus">10+ pessoas</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.timeGrowth && (
                        <p className="text-red-500 text-xs">{form.formState.errors.timeGrowth.message as string}</p>
                    )}
                </div>

                {/* Métricas */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Você acompanha essas métricas regularmente? (múltipla escolha)
                    </Label>
                    <div className="space-y-2 border border-zinc-200 p-4 rounded-sm bg-white">
                        {metricasOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={option.id}
                                    checked={metricasSelecionadas.includes(option.id)}
                                    onCheckedChange={() => toggleMetrica(option.id)}
                                />
                                <label
                                    htmlFor={option.id}
                                    className="text-sm text-zinc-700 cursor-pointer"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="nao-acompanho"
                                checked={metricasSelecionadas.includes('nao-acompanho')}
                                onCheckedChange={() => toggleMetrica('nao-acompanho')}
                            />
                            <label
                                htmlFor="nao-acompanho"
                                className="text-sm text-zinc-700 cursor-pointer"
                            >
                                Não acompanho métricas estruturadas
                            </label>
                        </div>
                    </div>
                </div>

                {/* CAC Atual */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o CAC (Custo de Aquisição) atual? *
                    </Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">
                        <span className="font-bold text-black">DEF:</span> Custo total de Mkt e Vendas dividido pelo nº de novos clientes.
                    </p>
                    <Select
                        onValueChange={(value) => form.setValue('cacAtual', value)}
                        value={form.watch('cacAtual')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nao-sei">Não sei/Não acompanho</SelectItem>
                            <SelectItem value="menor-500">{'< R$ 500'}</SelectItem>
                            <SelectItem value="500-2k">R$ 500 - R$ 2.000</SelectItem>
                            <SelectItem value="2k-5k">R$ 2.000 - R$ 5.000</SelectItem>
                            <SelectItem value="maior-5k">{'> R$ 5.000'}</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.cacAtual && (
                        <p className="text-red-500 text-xs">{form.formState.errors.cacAtual.message as string}</p>
                    )}
                </div>

                {/* LTV Atual */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o LTV (Lifetime Value) atual? *
                    </Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">
                        <span className="font-bold text-black">DEF:</span> Receita média total que um cliente gera enquanto ativo.
                    </p>
                    <Select
                        onValueChange={(value) => form.setValue('ltvAtual', value)}
                        value={form.watch('ltvAtual')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nao-sei">Não sei/Não acompanho</SelectItem>
                            <SelectItem value="menor-5k">{'< R$ 5.000'}</SelectItem>
                            <SelectItem value="5k-20k">R$ 5.000 - R$ 20.000</SelectItem>
                            <SelectItem value="20k-50k">R$ 20.000 - R$ 50.000</SelectItem>
                            <SelectItem value="maior-50k">{'> R$ 50.000'}</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.ltvAtual && (
                        <p className="text-red-500 text-xs">{form.formState.errors.ltvAtual.message as string}</p>
                    )}
                </div>
                {/* Materiais de Marketing */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o status dos seus materiais de marketing? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('marketingMaterials', value)}
                        value={form.watch('marketingMaterials')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="completos">Sim, temos materiais completos (Deck, Cases, etc)</SelectItem>
                            <SelectItem value="basicos">Sim, mas são básicos</SelectItem>
                            <SelectItem value="alguns">Temos alguns materiais dispersos</SelectItem>
                            <SelectItem value="nao-temos">Não temos materiais estruturados</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
