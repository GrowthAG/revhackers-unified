import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import KanbanMapper from './custom/KanbanMapper';
import LostReasonMapper from './custom/LostReasonMapper';

interface Props {
    form: UseFormReturn<any>;
}

export default function StepCrmOps4Execucao({ form }: Props) {
    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Eficiência de Vendas (Execution)
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    Estruturação de Funil, Motivos de Perda e Capacitação
                </p>
            </div>

            {/* Módulo Dinâmico 1: O Funil Perfeito */}
            <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200">
                <h3 className="text-base font-bold text-black uppercase tracking-wider mb-2">1. Estrutura do Funil de Vendas (Kanban)</h3>
                <p className="text-sm text-zinc-500 mb-6">Liste as etapas (colunas) atuais do seu principal funil de vendas.</p>
                <KanbanMapper form={form} fieldName="revops_custom_pipelines" />
            </div>

            {/* Módulo Dinâmico 2: Taxonomia de Loss */}
            <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200 mt-6 md:mt-8">
                <h3 className="text-base font-bold text-black uppercase tracking-wider mb-2">2. Mapeamento de Motivos de Perda (Lost Reasons)</h3>
                <p className="text-sm text-zinc-500 mb-6">Quais são os motivos de perda padronizados que a equipe utiliza ao descartar uma oportunidade?</p>
                <LostReasonMapper form={form} fieldName="revops_custom_lost_reasons" />
            </div>

            <div className="space-y-3 mt-8">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Cadência de Contatos (Sales Engagement) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Como é definida a rotina de follow-ups que o time de vendas executa com os leads?</p>
                <RadioGroup
                    value={form.watch('revops_flow_cadencia')}
                    onValueChange={(value) => form.setValue('revops_flow_cadencia', value)}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="estruturado" id="eng-sim" />
                        <Label htmlFor="eng-sim" className="text-zinc-700 font-normal cursor-pointer text-sm">Estruturado: processos definidos (ex: 8 tentativas em 14 dias, mesclando e-mail, telefone e WhatsApp).</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="caotico" id="eng-nao" />
                        <Label htmlFor="eng-nao" className="text-zinc-700 font-normal cursor-pointer text-sm">Flexível/Descentralizado: cada vendedor define sua própria rotina e volume de follow-ups.</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_pipeline_stagnation" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Tempo Limite por Etapa (SLA de Pipeline) *</Label>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">O sistema alerta quando uma oportunidade fica muito tempo parada na mesma etapa do funil?</p>
                <Input
                    {...form.register('revops_pipeline_stagnation')}
                    id="revops_pipeline_stagnation"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: Não temos controle automático de tempo por etapa."
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Mapeamento do Decisor Financeiro *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Como é garantido que a equipe está negociando com quem realmente decide a compra?</p>
                <RadioGroup
                    value={form.watch('revops_economic_buyer_mapped')}
                    onValueChange={(value) => form.setValue('revops_economic_buyer_mapped', value)}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim_bloqueio" id="eb-sim" />
                        <Label htmlFor="eb-sim" className="text-zinc-700 font-normal cursor-pointer text-sm">Processo rígido: o CRM só permite avançar a oportunidade se o decisor estiver mapeado e preenchido.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao_tempo_perdido" id="eb-nao" />
                        <Label htmlFor="eb-nao" className="text-zinc-700 font-normal cursor-pointer text-sm">Processo flexível: é possível avançar negociações mesmo sem o decisor principal identificado no sistema.</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Geração de Propostas Comerciais (CPQ) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Como a sua equipe cria e envia as propostas para os clientes?</p>
                <RadioGroup
                    value={form.watch('revops_cpq_friction')}
                    onValueChange={(value) => form.setValue('revops_cpq_friction', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="alta_friccao_manual" id="cpq-1" className="mt-1" />
                        <Label htmlFor="cpq-1" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Processo Manual:</strong> Documentos de Word/PDF criados separadamente do CRM, com risco de erros em valores e versões divergentes.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="media_friccao_template" id="cpq-2" className="mt-1" />
                        <Label htmlFor="cpq-2" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Templates Semi-Automáticos:</strong> Usamos modelos pré-estabelecidos, mas os vendedores ainda preenchem as condições comerciais na mão.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="baixa_friccao_auto" id="cpq-3" className="mt-1" />
                        <Label htmlFor="cpq-3" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Processo Sistematizado (CPQ):</strong> O próprio CRM gera a cotação exata com base nos produtos selecionados, pronta para assinatura digital.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-6">
                <div className="space-y-3 pt-6 border-t border-zinc-100">
                    <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Análise de Ganhos e Perdas (Win/Loss) *</Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Existe o costume de reavaliar oportunidades perdidas para entender os reais motivos?</p>
                    <RadioGroup
                        value={form.watch('revops_win_loss_analysis')}
                        onValueChange={(value) => form.setValue('revops_win_loss_analysis', value)}
                        className="space-y-3"
                    >
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="inexistente" id="wl-1" className="mt-1" />
                            <Label htmlFor="wl-1" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Inexistente:</strong> Vendedor apenas dá 'Perdido' no CRM sem detalhar ou padronizar o motivo.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="basico" id="wl-2" className="mt-1" />
                            <Label htmlFor="wl-2" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Basicamente Mapeado:</strong> Temos opções de motivos de perda obrigatórios, mas raramente fazemos auditoria/escuta da ligação.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="auditado" id="wl-3" className="mt-1" />
                            <Label htmlFor="wl-3" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Auditoria Ativa:</strong> Gestão ouvida ligações perdidas com frequência e consolida inteligência para Marketing e Produto.
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3 pt-6 border-t border-zinc-100">
                    <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Previsibilidade Comercial (Forecast) *</Label>
                    <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Qual o nível de precisão das previsões de fechamento para o final do mês?</p>
                    <RadioGroup
                        value={form.watch('revops_forecasting_accuracy')}
                        onValueChange={(value) => form.setValue('revops_forecasting_accuracy', value)}
                        className="space-y-3"
                    >
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="feeling" id="fc-1" className="mt-1" />
                            <Label htmlFor="fc-1" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Baseado em Feeling:</strong> Achismo do vendedor ("Essa tá quente, acho que fecha"). Erramos a previsão com frequência.
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="ponderado" id="fc-2" className="mt-1" />
                            <Label htmlFor="fc-2" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Probabilidade Ponderada:</strong> O Pipeline é limpo, mas a previsão vem multiplicando o valor pela probabilidade da etapa (ex: 50% de R$ 10k = R$ 5k previstos).
                            </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                            <RadioGroupItem value="data_driven" id="fc-3" className="mt-1" />
                            <Label htmlFor="fc-3" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                                <strong className="text-black block">Orientado a Dados/Compromisso:</strong> Previsão feita considerando o Ponto de Decisão, engajamento real e o "Commit" semanal dos vendedores.
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

        </div>
    );
}
