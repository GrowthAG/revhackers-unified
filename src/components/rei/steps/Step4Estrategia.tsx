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
            <div>
                <h2 className="text-3xl font-black text-black mb-3 uppercase tracking-[0.15em]">
                    Estratégia Atual
                </h2>
                <p className="text-zinc-500 text-sm">
                    Vamos mapear sua operação atual
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
                            <SelectItem value="rd-station">RD Station</SelectItem>
                            <SelectItem value="salesforce">Salesforce</SelectItem>
                            <SelectItem value="pipedrive">Pipedrive</SelectItem>
                            <SelectItem value="activecampaign">ActiveCampaign</SelectItem>
                            <SelectItem value="nao-utilizo">Não utilizo CRM</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
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

                {/* Gargalo */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o principal gargalo na sua operação? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('gargalo', value)}
                        value={form.watch('gargalo')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="falta-leads">Falta de leads</SelectItem>
                            <SelectItem value="leads-nao-qualificados">Leads não qualificados</SelectItem>
                            <SelectItem value="baixa-conversao">Baixa conversão de vendas</SelectItem>
                            <SelectItem value="processo-lento">Processo de vendas lento</SelectItem>
                            <SelectItem value="falta-previsibilidade">Falta de previsibilidade</SelectItem>
                            <SelectItem value="churn-alto">Churn alto</SelectItem>
                            <SelectItem value="falta-dados">Falta de dados/métricas</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.gargalo && (
                        <p className="text-red-500 text-xs">{form.formState.errors.gargalo.message as string}</p>
                    )}
                </div>

                {/* CAC Atual */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o CAC (Custo de Aquisição) atual? *
                    </Label>
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
            </div>
        </div>
    );
}
