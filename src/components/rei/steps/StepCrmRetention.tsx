import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface StepCrmRetentionProps {
    form: UseFormReturn<any>;
}

export default function StepCrmRetention({ form }: StepCrmRetentionProps) {
    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Retenção e Governança
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    CS Ops & LTV
                </p>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Saúde da Base (Churn Tracking) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">É possível prever/antecipar o cancelamento de um cliente antes que ele ocorra?</p>
                <RadioGroup
                    value={form.watch('churnTracking')}
                    onValueChange={(value) => form.setValue('churnTracking', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="inexistente" id="churn-inexistente" className="mt-1" />
                        <Label htmlFor="churn-inexistente" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Reativo (Apaga Incêndio):</strong> Não consigo rastrear "Saúde". Só descubro que o cliente vai sair quando ele formaliza o cancelamento.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="basico" id="churn-basico" className="mt-1" />
                        <Label htmlFor="churn-basico" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Acompanhamento Básico via NPS/Relacionamento:</strong> CS faz touchpoints manuais esporádicos. Não temos triggers automatizados no CRM ou Produto.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="avancado" id="churn-avancado" className="mt-1" />
                        <Label htmlFor="churn-avancado" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Preditivo e Automatizado (Health Score):</strong> CRM integrado ao Produto/Serviço disparando Playbooks de retenção antes de rachar.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Processo Handoff (Vendas ➔ Pós-Venda) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Qualidade do repasse do Closer à equipe de Produção/CS?</p>
                <RadioGroup
                    value={form.watch('ltvExpansion')}
                    onValueChange={(value) => form.setValue('ltvExpansion', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="caotico" id="handoff-caotico" className="mt-1" />
                        <Label htmlFor="handoff-caotico" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Repetição de História:</strong> Cliente precisa repetir suas dores para os novos atendentes logo depois do fechamento, gerando atrito no dia 1. Contexto se perde fora do CRM.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="organizado" id="handoff-organizado" className="mt-1" />
                        <Label htmlFor="handoff-organizado" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Sistematizado/Automatizado:</strong> Venda é confirmada no CRM, que auto-cria projeto com notas e histórico anexados. Transição silenciosa e eficiente.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Onboarding Orquestrado & Expansão (LTV) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Seu processo de onboarding atual planta sementes estratégicas para vender novos módulos (Cross-sell/Up-sell) nos primeiros 90 dias?</p>
                <RadioGroup
                    value={form.watch('orchestratedOnboarding')}
                    onValueChange={(value) => form.setValue('orchestratedOnboarding', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="basico" id="onb-basico" className="mt-1" />
                        <Label htmlFor="onb-basico" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Apenas Treinamento:</strong> Nosso foco hoje é só garantir que eles não cancelem no primeiro mês. Não temos uma trilha clara de expansão automatizada.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="orquestrado" id="onb-orquestrado" className="mt-1" />
                        <Label htmlFor="onb-orquestrado" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Onboarding Orquestrado:</strong> Já temos automações avançadas. O cliente é nutrido para comprar novos tickets no momento exato.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="executiveVisibility" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Visibilidade Executiva (Dashboards) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">O quão fácil é extrair um Forecast preciso ou analisar o funil?</p>
                <Textarea
                    {...form.register('executiveVisibility')}
                    id="executiveVisibility"
                    className="bg-white border-zinc-200 text-black min-h-[100px]"
                    placeholder="Ex: É um inferno. Todo mês preciso puxar 3 planilhas diferentes..."
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Higiene Analítica ("Limpeza de Base") *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Como você descreveria seu banco de dados hoje?</p>
                <RadioGroup
                    value={form.watch('dataHygiene')}
                    onValueChange={(value) => form.setValue('dataHygiene', value)}
                    className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="muito-sujo" id="hyg-muito-sujo" />
                        <Label htmlFor="hyg-muito-sujo" className="text-zinc-700 font-normal cursor-pointer text-sm">Sujo e Duplicado ("Desastre")</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="desatualizado" id="hyg-desatualizado" />
                        <Label htmlFor="hyg-desatualizado" className="text-zinc-700 font-normal cursor-pointer text-sm">Limpo, mas desatualizado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auditoria" id="hyg-auditoria" />
                        <Label htmlFor="hyg-auditoria" className="text-zinc-700 font-normal cursor-pointer text-sm">Limpo, com governança de dados</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
}
