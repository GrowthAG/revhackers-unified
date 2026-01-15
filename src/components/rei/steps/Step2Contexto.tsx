import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Contexto do Negócio
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    Etapa 02/05
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
                            <SelectItem value="cybersecurity">Cybersegurança / InfoSec</SelectItem>
                            <SelectItem value="software-house">Software House / Outsourcing</SelectItem>
                            <SelectItem value="b2b-saas">B2B SaaS (Enterprise & SMB)</SelectItem>
                            <SelectItem value="b2b-servicos">Serviços B2B High-Ticket</SelectItem>
                            <SelectItem value="b2b2c">B2B2C / Educação Corporativa</SelectItem>
                            <SelectItem value="fintech">Fintech / Serviços Financeiros</SelectItem>
                            <SelectItem value="healthtech">Healthtech / Saúde</SelectItem>
                            <SelectItem value="agritech">Agritech / Indústria 4.0</SelectItem>
                            <SelectItem value="startup">Startup / Scale-up Growth</SelectItem>
                            <SelectItem value="outro">Outro (Especifique)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.watch('segmento') === 'outro' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <input
                                {...form.register('segmento_outro')}
                                placeholder="Qual seu segmento?"
                                className="w-full h-12 p-3 bg-white border border-zinc-200 focus:border-black outline-none transition-colors rounded-none placeholder:text-zinc-400 text-sm"
                            />
                        </div>
                    )}
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
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">
                        <span className="font-bold text-black">IMPORTANTE:</span> Informe o valor exato para cálculo de ROI.
                    </p>
                    <Input
                        value={form.watch('ticketMedio') || ''}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value === '') {
                                form.setValue('ticketMedio', '');
                                return;
                            }
                            const formatted = new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            }).format(Number(value) / 100);
                            form.setValue('ticketMedio', formatted);
                        }}
                        placeholder="R$ 0,00"
                        className="bg-white border-zinc-200 h-12 placeholder:text-zinc-400 font-mono text-sm"
                    />
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
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">
                        <span className="font-bold text-black">DEF:</span> Receita Mensal Recorrente (Soma de Assinaturas).
                    </p>
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
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">
                        <span className="font-bold text-black">DEF:</span> Percentual de clientes ou receita perdida por cancelamento/mês.
                    </p>
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

                {/* --- NOVOS CAMPOS ESTRATÉGICOS (FEEDBACK) --- */}

                {/* Concorrentes */}
                <div className="space-y-3 pt-6 border-t border-zinc-100">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Principais Concorrentes
                    </Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">
                        Liste os 3-5 principais players que você enfrenta nas negociações.
                    </p>
                    <textarea
                        {...form.register('concorrentes')}
                        className="w-full min-h-[100px] p-4 border border-zinc-200 focus:border-black transition-colors resize-none text-sm font-mono bg-white"
                        placeholder="Ex: Concorrente A (Preço baixo), Concorrente B (Líder de mercado)..."
                    />
                </div>

                {/* ICP */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Descrição do Perfil de Cliente Ideal (ICP)
                    </Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">
                        Quem é o cliente dos sonhos? (Cargo, Setor, Tamanho, Momento)
                    </p>
                    <textarea
                        {...form.register('icpDescription')}
                        className="w-full min-h-[120px] p-4 border border-zinc-200 focus:border-black transition-colors resize-none text-sm font-mono bg-white"
                        placeholder="Ex: Diretores de Marketing em empresas SaaS Series B, que estão sofrendo com CAC alto e buscam eficiência..."
                    />
                </div>
            </div>
        </div>
    );
}
