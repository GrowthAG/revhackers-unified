import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StepCrmProcessProps {
    form: UseFormReturn<any>;
}

export default function StepCrmProcess({ form }: StepCrmProcessProps) {
    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Processos e Sales Ops
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    Eficiência do Funil
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="pipelineStages" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Descreva rapidamente as etapas (Pipeline) do funil atual *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Refletem o processo interno ou a verdadeira jornada de compra do cliente?</p>
                <Textarea
                    {...form.register('pipelineStages')}
                    id="pipelineStages"
                    className="bg-white border-zinc-200 text-black min-h-[100px]"
                    placeholder="Ex: Discovery, Qualificação, Apresentação, Proposta..."
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Como é o processo de qualificação e passagem de bastão? (Handoff) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Como garantem que o MKT/SDR só entregue reuniões qualificadas?</p>
                <RadioGroup
                    value={form.watch('handoffProcess')}
                    onValueChange={(value) => form.setValue('handoffProcess', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="ausente" id="hand-ausente" className="mt-1" />
                        <Label htmlFor="hand-ausente" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Ausente / Fragmentado:</strong> Muitas reuniões frias passam adiante, gerando atrito entre marketing e Vendas.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="planilhas" id="hand-planilhas" className="mt-1" />
                        <Label htmlFor="hand-planilhas" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Manual via Grupo ou Planilha:</strong> O SDR avisa o Closer por fora do CRM. Funciona, mas não é escalável.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="automatizado" id="hand-automatizado" className="mt-1" />
                        <Label htmlFor="hand-automatizado" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Acordo Rígido (SLA) e Automatizado:</strong> Pipeline configurado, regras de conversão claras, Lead Scoring operante.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="lostReasonsMapped" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">O quão disciplinada é a equipe para justificar as Perdas (Lost Reasons)? *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Quando o Lead diz 'não', isso vira inteligência de negócio ou apenas some?</p>
                <Textarea
                    {...form.register('lostReasonsMapped')}
                    id="lostReasonsMapped"
                    className="bg-white border-zinc-200 text-black min-h-[80px]"
                    placeholder="Ex: Quase sempre marcam 'preço' pra tudo..."
                />
            </div>
        </div>
    );
}
