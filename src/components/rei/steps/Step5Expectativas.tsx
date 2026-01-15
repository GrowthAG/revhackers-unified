import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Step5Props {
    form: UseFormReturn<any>;
}

const expectativasOptions = [
    { id: 'oportunidades', label: 'Identificar oportunidades de crescimento' },
    { id: 'validar', label: 'Validar estratégia atual' },
    { id: 'novos-canais', label: 'Descobrir novos canais' },
    { id: 'otimizar-funil', label: 'Otimizar funil de vendas' },
    { id: 'reduzir-custos', label: 'Reduzir custos de aquisição' },
    { id: 'previsibilidade', label: 'Aumentar previsibilidade' },
];

const areasOptions = [
    { id: 'geracao-demanda', label: 'Geração de demanda' },
    { id: 'conversao-leads', label: 'Conversão de leads' },
    { id: 'retencao', label: 'Retenção de clientes' },
    { id: 'expansao', label: 'Expansão (upsell/cross-sell)' },
    { id: 'otimizacao-cac', label: 'Otimização de CAC' },
    { id: 'automacao', label: 'Automação de processos' },
    { id: 'analise-dados', label: 'Análise de dados' },
];

export default function Step5Expectativas({ form }: Step5Props) {
    const expectativasSelecionadas = form.watch('expectativas') || [];
    const areasSelecionadas = form.watch('areasPrioridade') || [];

    const toggleExpectativa = (expectativaId: string) => {
        const current = expectativasSelecionadas;
        const updated = current.includes(expectativaId)
            ? current.filter((id: string) => id !== expectativaId)
            : [...current, expectativaId];
        form.setValue('expectativas', updated);
    };

    const toggleArea = (areaId: string) => {
        const current = areasSelecionadas;
        if (current.includes(areaId)) {
            form.setValue('areasPrioridade', current.filter((id: string) => id !== areaId));
        } else if (current.length < 3) {
            form.setValue('areasPrioridade', [...current, areaId]);
        }
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Expectativas
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    Etapa 05/05
                </p>
            </div>

            <div className="space-y-6">
                {/* Expectativas */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        O que você espera do diagnóstico? * (selecione pelo menos 1)
                    </Label>
                    <div className="space-y-2 border border-zinc-200 p-4 rounded-sm bg-white">
                        {expectativasOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`exp-${option.id}`}
                                    checked={expectativasSelecionadas.includes(option.id)}
                                    onCheckedChange={() => toggleExpectativa(option.id)}
                                />
                                <label
                                    htmlFor={`exp-${option.id}`}
                                    className="text-sm text-zinc-700 cursor-pointer"
                                >
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                    {form.formState.errors.expectativas && (
                        <p className="text-red-500 text-xs">{form.formState.errors.expectativas.message as string}</p>
                    )}
                </div>

                {/* Áreas Prioritárias */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Quais áreas você quer priorizar? * (escolha até 3)
                    </Label>
                    <div className="space-y-2 border border-zinc-200 p-4 rounded-sm bg-white">
                        {areasOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={option.id}
                                    checked={areasSelecionadas.includes(option.id)}
                                    onCheckedChange={() => toggleArea(option.id)}
                                    disabled={areasSelecionadas.length >= 3 && !areasSelecionadas.includes(option.id)}
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
                    <p className="text-xs text-zinc-500">
                        {areasSelecionadas.length}/3 áreas selecionadas
                    </p>
                    {form.formState.errors.areasPrioridade && (
                        <p className="text-red-500 text-xs">{form.formState.errors.areasPrioridade.message as string}</p>
                    )}
                </div>

                {/* Observações */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Observações ou contexto adicional (opcional)
                    </Label>
                    <Textarea
                        {...form.register('observacoes')}
                        placeholder="Compartilhe qualquer informação adicional que possa nos ajudar a entender melhor seu contexto..."
                        className="bg-white border-zinc-200 min-h-[120px] resize-none"
                    />
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-4 border-l-4 border-l-black space-y-2">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                        <span className="font-bold text-black">Status:</span> Pronto para processamento estratégico.
                    </p>
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide border-t border-zinc-200 pt-2">
                        O envio deste diagnóstico habilita o agendamento da Sessão Estratégica (Duração: 45min - 1h).
                    </p>
                </div>
            </div>
        </div>
    );
}
