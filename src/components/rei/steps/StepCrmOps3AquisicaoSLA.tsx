import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
    form: UseFormReturn<any>;
}

export default function StepCrmOps3AquisicaoSLA({ form }: Props) {
    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Aquisição e Alinhamento de Vendas (SLA)
                </h2>
                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                    Como acontece a passagem de oportunidades do Marketing para Vendas
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_icp_framework" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Como os leads são qualificados hoje? *</Label>
                <Input
                    {...form.register('revops_icp_framework')}
                    id="revops_icp_framework"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: BANT, SPIN Selling, ou análise padrão da equipe."
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Sistema de pontuação de leads (Lead Scoring) *</Label>
                <p className="text-xxs text-zinc-500 mb-2 uppercase tracking-wide">Os contatos recebem alguma pontuação automática de prioridade antes da abordagem de vendas?</p>
                <RadioGroup
                    value={form.watch('revops_lead_scoring')}
                    onValueChange={(value) => form.setValue('revops_lead_scoring', value)}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim_ativo" id="ls-sim" />
                        <Label htmlFor="ls-sim" className="text-zinc-700 font-normal cursor-pointer text-sm">Sim, automatizado: o sistema classifica com base no perfil (ex: cargo) e comportamento de engajamento.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual_framework" id="ls-manual" />
                        <Label htmlFor="ls-manual" className="text-zinc-700 font-normal cursor-pointer text-sm">Sim, mas manualmente: aplicamos um framework de qualificação (ex: BANT) na abordagem, sem pontuação automática configurada no sistema.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao_existe" id="ls-nao" />
                        <Label htmlFor="ls-nao" className="text-zinc-700 font-normal cursor-pointer text-sm">Não, recebemos as oportunidades e todas entram na mesma fila, de acordo com a chegada.</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_sla_marketing_vendas" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Alinhamento entre Marketing e Vendas (SLA) *</Label>
                <p className="text-xxs text-zinc-500 uppercase tracking-wide">Existe um acordo claro sobre a quantidade e qualidade das oportunidades geradas vs. o tempo de resposta?</p>
                <Input
                    {...form.register('revops_sla_marketing_vendas')}
                    id="revops_sla_marketing_vendas"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: Não temos um acordo formalizado ou metas conjuntas mapeadas."
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Distribuição de oportunidades (Routing) *</Label>
                <p className="text-xxs text-zinc-500 mb-2 uppercase tracking-wide">Como o sistema decide qual vendedor vai atender um cliente com alto potencial x baixo potencial?</p>
                <RadioGroup
                    value={form.watch('revops_routing_vip')}
                    onValueChange={(value) => form.setValue('revops_routing_vip', value)}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="owner_direto" id="rt-owner" />
                        <Label htmlFor="rt-owner" className="text-zinc-700 font-normal cursor-pointer text-sm">Direto ao responsável: o inbound chega para uma pessoa específica (sócio/owner), sem sistema de fila ou distribuição automática.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="direcionamento_inteligente" id="rt-sim" />
                        <Label htmlFor="rt-sim" className="text-zinc-700 font-normal cursor-pointer text-sm">Distribuição inteligente: perfis mais decisivos são direcionados para os vendedores mais experientes.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="round_robin_cego" id="rt-nao" />
                        <Label htmlFor="rt-nao" className="text-zinc-700 font-normal cursor-pointer text-sm">Distribuição em fila (Round Robin): cai para o próximo vendedor da vez, sem filtro prévio.</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Tempo de resposta a novas oportunidades (Speed to Lead) *</Label>
                <p className="text-xxs text-zinc-500 mb-2 uppercase tracking-wide">Quanto tempo a sua equipe leva, em média, para realizar o primeiro contato?</p>
                <RadioGroup
                    value={form.watch('revops_speed_to_lead_sla')}
                    onValueChange={(value) => form.setValue('revops_speed_to_lead_sla', value)}
                    className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sub_5" id="s5m" />
                        <Label htmlFor="s5m" className="text-zinc-700 font-normal cursor-pointer text-sm">Menos de 5 minutos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sub_60" id="s1h" />
                        <Label htmlFor="s1h" className="text-zinc-700 font-normal cursor-pointer text-sm">Até 1 hora</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="over_1" id="s24h" />
                        <Label htmlFor="s24h" className="text-zinc-700 font-normal cursor-pointer text-sm">Até 24 horas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unknown" id="s-nao-sei" />
                        <Label htmlFor="s-nao-sei" className="text-zinc-700 font-normal cursor-pointer text-sm">Não medimos formalmente - respondemos assim que o lead chega, mas sem SLA definido.</Label>
                    </div>
                </RadioGroup>
            </div>

        </div>
    );
}
