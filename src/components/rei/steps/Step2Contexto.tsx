import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Step2Props {
    form: UseFormReturn<any>;
}

export default function Step2Contexto({ form }: Step2Props) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-black mb-3 uppercase tracking-[0.15em]">
                    Contexto do Negócio
                </h2>
                <p className="text-zinc-500 text-sm">
                    Nos ajude a entender melhor sua operação
                </p>
            </div>

            <div className="space-y-6">
                {/* Segmento */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o principal segmento de atuação? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('segmento', value)}
                        value={form.watch('segmento')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="b2b-saas">B2B SaaS</SelectItem>
                            <SelectItem value="b2b-servicos">B2B Serviços</SelectItem>
                            <SelectItem value="b2c-ecommerce">B2C E-commerce</SelectItem>
                            <SelectItem value="b2c-servicos">B2C Serviços</SelectItem>
                            <SelectItem value="marketplace">Marketplace</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.segmento && (
                        <p className="text-red-500 text-xs">{form.formState.errors.segmento.message as string}</p>
                    )}
                </div>

                {/* Tamanho */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o tamanho atual da operação? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('tamanho', value)}
                        value={form.watch('tamanho')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pre-seed">Pre-seed (0-10 funcionários)</SelectItem>
                            <SelectItem value="seed">Seed (11-50 funcionários)</SelectItem>
                            <SelectItem value="series-ab">Series A/B (51-200 funcionários)</SelectItem>
                            <SelectItem value="growth">Growth (200+ funcionários)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.tamanho && (
                        <p className="text-red-500 text-xs">{form.formState.errors.tamanho.message as string}</p>
                    )}
                </div>

                {/* Ticket Médio */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o ticket médio do produto/serviço? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('ticketMedio', value)}
                        value={form.watch('ticketMedio')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ate-500">Até R$ 500</SelectItem>
                            <SelectItem value="500-2k">R$ 500 - R$ 2.000</SelectItem>
                            <SelectItem value="2k-10k">R$ 2.000 - R$ 10.000</SelectItem>
                            <SelectItem value="10k-50k">R$ 10.000 - R$ 50.000</SelectItem>
                            <SelectItem value="acima-50k">Acima de R$ 50.000</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.ticketMedio && (
                        <p className="text-red-500 text-xs">{form.formState.errors.ticketMedio.message as string}</p>
                    )}
                </div>

                {/* Ciclo de Vendas */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o ciclo de vendas médio? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('cicloVendas', value)}
                        value={form.watch('cicloVendas')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ate-7d">Até 7 dias</SelectItem>
                            <SelectItem value="7-30d">7-30 dias</SelectItem>
                            <SelectItem value="1-3m">1-3 meses</SelectItem>
                            <SelectItem value="3-6m">3-6 meses</SelectItem>
                            <SelectItem value="acima-6m">Acima de 6 meses</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.cicloVendas && (
                        <p className="text-red-500 text-xs">{form.formState.errors.cicloVendas.message as string}</p>
                    )}
                </div>

                {/* MRR */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual a receita recorrente mensal (MRR)? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('mrr', value)}
                        value={form.watch('mrr')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ate-50k">Até R$ 50k/mês</SelectItem>
                            <SelectItem value="50k-200k">R$ 50k - R$ 200k/mês</SelectItem>
                            <SelectItem value="200k-500k">R$ 200k - R$ 500k/mês</SelectItem>
                            <SelectItem value="500k-1m">R$ 500k - R$ 1M/mês</SelectItem>
                            <SelectItem value="acima-1m">Acima de R$ 1M/mês</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.mrr && (
                        <p className="text-red-500 text-xs">{form.formState.errors.mrr.message as string}</p>
                    )}
                </div>

                {/* Modelo de Precificação */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o modelo de precificação? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('modeloPrecificacao', value)}
                        value={form.watch('modeloPrecificacao')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assinatura-mensal">Assinatura mensal</SelectItem>
                            <SelectItem value="assinatura-anual">Assinatura anual</SelectItem>
                            <SelectItem value="one-time">One-time payment</SelectItem>
                            <SelectItem value="freemium">Freemium</SelectItem>
                            <SelectItem value="usage-based">Usage-based</SelectItem>
                            <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.modeloPrecificacao && (
                        <p className="text-red-500 text-xs">{form.formState.errors.modeloPrecificacao.message as string}</p>
                    )}
                </div>

                {/* Taxa de Churn */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual a taxa de churn mensal atual? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('taxaChurn', value)}
                        value={form.watch('taxaChurn')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nao-sei">Não sei/Não acompanho</SelectItem>
                            <SelectItem value="menor-2">{'< 2% (excelente)'}</SelectItem>
                            <SelectItem value="2-5">2-5% (bom)</SelectItem>
                            <SelectItem value="5-10">5-10% (atenção)</SelectItem>
                            <SelectItem value="maior-10">{'> 10% (crítico)'}</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.taxaChurn && (
                        <p className="text-red-500 text-xs">{form.formState.errors.taxaChurn.message as string}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
