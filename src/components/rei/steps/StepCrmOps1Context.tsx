import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props {
    form: UseFormReturn<any>;
}

export default function StepCrmOps1Context({ form }: Props) {
    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Go-to-Market & Unit Economics
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    Como está a eficiência da sua operação comercial hoje?
                </p>
            </div>

            {/* Objetivo Principal */}
            <div className="space-y-2">
                <Label htmlFor="revops_objetivo_principal" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Qual o principal objetivo desta implementação? *</Label>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">O que você precisa construir, migrar ou organizar? Seja direto.</p>
                <textarea
                    {...form.register('revops_objetivo_principal')}
                    id="revops_objetivo_principal"
                    className="w-full min-h-[90px] p-3 bg-white border border-zinc-200 focus:border-black transition-colors resize-none text-sm outline-none"
                    placeholder="Ex: Migrar do HubSpot para Funnels, padronizar o funil de pré-vendas e automatizar follow-ups. Time de 5 SDRs + 3 Closers hoje sem processo."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_segmento" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Qual o seu segmento de atuação principal? *</Label>
                <Input
                    {...form.register('revops_segmento')}
                    id="revops_segmento"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: SaaS, Logística, Indústria..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="revops_tamanho_time" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Tamanho do time comercial atual</Label>
                    <Input
                        {...form.register('revops_tamanho_time')}
                        id="revops_tamanho_time"
                        className="bg-white border-zinc-200 text-black h-12"
                        placeholder="Ex: 2 Pré-vendas (SDRs) e 3 Vendedores (Closers)"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="revops_ticket_medio" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Ticket Médio Mensal ou LTV estimado</Label>
                    <Input
                        {...form.register('revops_ticket_medio')}
                        id="revops_ticket_medio"
                        className="bg-white border-zinc-200 text-black h-12"
                        placeholder="R$ 0,00"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="revops_mrr_atual" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Faturamento Recorrente Mensal (MRR atual)</Label>
                    <Input
                        {...form.register('revops_mrr_atual')}
                        id="revops_mrr_atual"
                        className="bg-white border-zinc-200 text-black h-12"
                        placeholder="R$ 0,00"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="revops_cac_atual" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Custo de Aquisição de Clientes (CAC estimado)</Label>
                    <Input
                        {...form.register('revops_cac_atual')}
                        id="revops_cac_atual"
                        className="bg-white border-zinc-200 text-black h-12"
                        placeholder="R$ 0,00"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_sales_cycle_days" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Tempo médio do ciclo de vendas (em dias)</Label>
                <Input
                    {...form.register('revops_sales_cycle_days')}
                    id="revops_sales_cycle_days"
                    type="number"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: 45"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_win_rate" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Taxa de conversão de propostas (Win Rate)</Label>
                <Input
                    {...form.register('revops_win_rate')}
                    id="revops_win_rate"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: 20%"
                />
            </div>

            {/* Concorrentes */}
            <div className="space-y-3 pt-6 border-t border-zinc-100">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Principais Concorrentes</Label>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Informe até 3 concorrentes. Se souber o site, preencha também.</p>
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="grid grid-cols-2 gap-3">
                            <input
                                {...form.register(`revops_concorrente${n}_nome` as any)}
                                className="p-3 border border-zinc-200 focus:border-black transition-colors text-sm bg-white outline-none h-12"
                                placeholder={`Concorrente ${n} — Nome`}
                            />
                            <input
                                {...form.register(`revops_concorrente${n}_site` as any)}
                                className="p-3 border border-zinc-200 focus:border-black transition-colors text-sm font-mono bg-white outline-none h-12"
                                placeholder="www.exemplo.com.br"
                            />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
