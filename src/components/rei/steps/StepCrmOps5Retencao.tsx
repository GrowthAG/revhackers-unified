import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
    form: UseFormReturn<any>;
}

export default function StepCrmOps5Retencao({ form }: Props) {
    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Retenção, CS Ops & NRR
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    A transição do cliente e as oportunidades de crescimento
                </p>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Passagem de Bastão (Vendas para CS/Onboarding) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Como acontece a transferência de informações após o cliente fechar o contrato?</p>
                <RadioGroup
                    value={form.watch('revops_onboarding_handoff')}
                    onValueChange={(value) => form.setValue('revops_onboarding_handoff', value)}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mastigado_cs" id="hand-sim" />
                        <Label htmlFor="hand-sim" className="text-zinc-700 font-normal cursor-pointer text-sm">Transição estruturada: a equipe de CS recebe todo o histórico e necessidades mapeadas de forma automática.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual_repetitivo" id="hand-nao" />
                        <Label htmlFor="hand-nao" className="text-zinc-700 font-normal cursor-pointer text-sm">Transição manual: a equipe de CS geralmente precisa coletar boa parte das informações novamente com o cliente.</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-6">
                <div className="space-y-3 pt-6 border-t border-zinc-100">
                    <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Saúde do Cliente (Health Score) *</Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">O sistema sinaliza clientes com risco de cancelamento antes de eles pedirem o distrato?</p>
                    <RadioGroup
                        value={form.watch('revops_health_score_tracking')}
                        onValueChange={(value) => form.setValue('revops_health_score_tracking', value)}
                        className="space-y-3"
                    >
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="inexistente" id="hs-1" className="mt-1" />
                            <Label htmlFor="hs-1" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Reativo (Apaga Incêndio):</strong> Não medimos. O Cliente pede para cancelar do nada e tentamos contornar na reta final.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="basico" id="hs-2" className="mt-1" />
                            <Label htmlFor="hs-2" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Básico (NPS / Relacionamento):</strong> O CS tenta avaliar pelo termômetro da conversa (Verde/Amarelo/Vermelho) e se o cliente responde e-mails ou pesquisas.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="avancado" id="hs-3" className="mt-1" />
                            <Label htmlFor="hs-3" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Avançado (Engajamento em Produto/SLA):</strong> O sistema altera a cor do cliente automaticamente com base no (não) uso da ferramenta, atrasos em boletos ou chamados de suporte frequentes.
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3 pt-6 border-t border-zinc-100">
                    <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Retenção de Receita Líquida (NRR) *</Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">A expansão de clientes atuais cobre a perda financeira dos que cancelam (Churn)?</p>
                    <RadioGroup
                        value={form.watch('revops_nrr_percentage')}
                        onValueChange={(value) => form.setValue('revops_nrr_percentage', value)}
                        className="space-y-3"
                    >
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="nao_medido" id="nrr-1" className="mt-1" />
                            <Label htmlFor="nrr-1" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Não Mensurado:</strong> Sabemos que clientes cancelam, mas não temos o valor percentual de NRR (Net Revenue Retention) claro no painel.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="abaixo_100" id="nrr-2" className="mt-1" />
                            <Label htmlFor="nrr-2" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Abaixo de 100% (Base Desidratando):</strong> Os Up-Sells e Cross-sells não são o suficiente. O Churn "sangra" o crescimento e obriga vendas a fechar buracos.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="acima_100" id="nrr-3" className="mt-1" />
                            <Label htmlFor="nrr-3" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Acima de 100% (Crescimento Saudável):</strong> A base cresce sozinha! A expansão financeira dos clientes que ficam, gera mais lucro que o valor perdido em cancelamentos.
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Processo de Expansão e Up-Sell *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Existem rotinas ou gatilhos claros para oferecer novos produtos aos clientes ativos?</p>
                <RadioGroup
                    value={form.watch('revops_expansion_playbook')}
                    onValueChange={(value) => form.setValue('revops_expansion_playbook', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="sim_automatizado" id="cs-sim" className="mt-1" />
                        <Label htmlFor="cs-sim" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Processo Proativo:</strong> O sistema ou processo sinaliza o momento ideal operacional (ex: após gerar primeiros resultados) para novas ofertas.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="nao_passivo" id="cs-nao" className="mt-1" />
                        <Label htmlFor="cs-nao" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Processo Reativo:</strong> A equipe foca no suporte em apagar incêndios e as expansões acontecem só quando o cliente pede.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="space-y-3">
                    <Label htmlFor="revops_toxic_compensation" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Modelo de Comissionamento e Incentivos *</Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Como o modelo de comissionamento prioriza a atração de clientes aderentes e saudáveis no longo prazo?</p>
                    <RadioGroup
                        value={form.watch('revops_toxic_compensation')}
                        onValueChange={(value) => form.setValue('revops_toxic_compensation', value)}
                        className="space-y-3"
                    >
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="toxico_volume" id="comp-1" className="mt-1" />
                            <Label htmlFor="comp-1" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Tóxico (Focado em Volume):</strong> O vendedor ganha comissão total no ato da assinatura. Se o cliente der churn 1 mês depois (Bad Fit / Overpromising), o vendedor não perde nada (sem "clawback").
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="hibrido" id="comp-2" className="mt-1" />
                            <Label htmlFor="comp-2" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Híbrido (Trava de Segurança):</strong> Existem travas. Se o cliente cancelar nos primeiros 3 meses, o vendedor sofre desconto futuro (Clawback) ou a comissão é atrelada à entrega e onboarding.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="saudavel_pago_pelo_ltv" id="comp-3" className="mt-1" />
                            <Label htmlFor="comp-3" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Saudável (Atrelado ao Sucesso):</strong> Vendas dividem o risco da operação, recebendo em parcelas sobre a retenção, e o CS é verdadeiramente engajado e bonificado pelo NRR/Expansão.
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
}
