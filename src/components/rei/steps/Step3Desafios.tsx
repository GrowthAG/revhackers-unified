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

interface Step3Props {
    form: UseFormReturn<any>;
}

const desafiosOptions = [
    { id: 'leads', label: 'Gerar mais leads qualificados' },
    { id: 'conversao', label: 'Melhorar taxa de conversão' },
    { id: 'cac', label: 'Reduzir CAC (Custo de Aquisição)' },
    { id: 'ltv', label: 'Aumentar LTV (Lifetime Value)' },
    { id: 'escalar', label: 'Escalar operação de vendas' },
    { id: 'churn', label: 'Reduzir churn' },
    { id: 'previsibilidade', label: 'Previsibilidade de receita' },
];

export default function Step3Desafios({ form }: Step3Props) {
    const desafiosSelecionados = form.watch('desafios') || [];

    const toggleDesafio = (desafioId: string) => {
        const current = desafiosSelecionados;
        const updated = current.includes(desafioId)
            ? current.filter((id: string) => id !== desafioId)
            : [...current, desafioId];
        form.setValue('desafios', updated);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-black mb-3 uppercase tracking-[0.15em]">
                    Desafios & Objetivos
                </h2>
                <p className="text-zinc-500 text-sm">
                    Vamos entender suas metas e prioridades
                </p>
            </div>

            <div className="space-y-6">
                {/* Desafios */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o MAIOR desafio de crescimento hoje? * (escolha até 2)
                    </Label>
                    <div className="space-y-2 border border-zinc-200 p-4 rounded-sm bg-white">
                        {desafiosOptions.map((option) => (
                            <div key={option.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={option.id}
                                    checked={desafiosSelecionados.includes(option.id)}
                                    onCheckedChange={() => toggleDesafio(option.id)}
                                    disabled={desafiosSelecionados.length >= 2 && !desafiosSelecionados.includes(option.id)}
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
                    {form.formState.errors.desafios && (
                        <p className="text-red-500 text-xs">{form.formState.errors.desafios.message as string}</p>
                    )}
                </div>

                {/* Meta de Crescimento */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual a meta de crescimento para os próximos 12 meses? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('metaCrescimento', value)}
                        value={form.watch('metaCrescimento')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2x">2x (dobrar receita)</SelectItem>
                            <SelectItem value="3x">3x (triplicar receita)</SelectItem>
                            <SelectItem value="5x">5x ou mais</SelectItem>
                            <SelectItem value="manter">Manter e otimizar</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.metaCrescimento && (
                        <p className="text-red-500 text-xs">{form.formState.errors.metaCrescimento.message as string}</p>
                    )}
                </div>

                {/* Orçamento */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o orçamento disponível para crescimento? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('orcamento', value)}
                        value={form.watch('orcamento')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ate-10k">Até R$ 10k/mês</SelectItem>
                            <SelectItem value="10k-30k">R$ 10k - R$ 30k/mês</SelectItem>
                            <SelectItem value="30k-100k">R$ 30k - R$ 100k/mês</SelectItem>
                            <SelectItem value="100k-300k">R$ 100k - R$ 300k/mês</SelectItem>
                            <SelectItem value="acima-300k">Acima de R$ 300k/mês</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.orcamento && (
                        <p className="text-red-500 text-xs">{form.formState.errors.orcamento.message as string}</p>
                    )}
                </div>

                {/* Prazo */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o prazo esperado para ver resultados? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('prazo', value)}
                        value={form.watch('prazo')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="imediato">Imediato (1-3 meses)</SelectItem>
                            <SelectItem value="curto">Curto prazo (3-6 meses)</SelectItem>
                            <SelectItem value="medio">Médio prazo (6-12 meses)</SelectItem>
                            <SelectItem value="longo">Longo prazo (12+ meses)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.prazo && (
                        <p className="text-red-500 text-xs">{form.formState.errors.prazo.message as string}</p>
                    )}
                </div>

                {/* Métrica Principal */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual métrica é mais importante para você? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('metricaPrincipal', value)}
                        value={form.watch('metricaPrincipal')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="leads">Número de leads</SelectItem>
                            <SelectItem value="conversao">Taxa de conversão</SelectItem>
                            <SelectItem value="cac">CAC (Custo de Aquisição)</SelectItem>
                            <SelectItem value="ltv">LTV (Lifetime Value)</SelectItem>
                            <SelectItem value="mrr">Receita recorrente (MRR/ARR)</SelectItem>
                            <SelectItem value="roi">ROI geral</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.metricaPrincipal && (
                        <p className="text-red-500 text-xs">{form.formState.errors.metricaPrincipal.message as string}</p>
                    )}
                </div>

                {/* Gargalo no Funil */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
                        Qual o principal gargalo no funil? *
                    </Label>
                    <Select
                        onValueChange={(value) => form.setValue('gargaloFunil', value)}
                        value={form.watch('gargaloFunil')}
                    >
                        <SelectTrigger className="bg-white border-zinc-200 h-12">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="topo">Topo (geração de leads)</SelectItem>
                            <SelectItem value="meio">Meio (qualificação/nutrição)</SelectItem>
                            <SelectItem value="fundo">Fundo (conversão/fechamento)</SelectItem>
                            <SelectItem value="pos-venda">Pós-venda (onboarding/ativação)</SelectItem>
                            <SelectItem value="retencao">Retenção (churn)</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.gargaloFunil && (
                        <p className="text-red-500 text-xs">{form.formState.errors.gargaloFunil.message as string}</p>
                    )}
                </div>

                {/* PERGUNTAS ABERTAS ESTRATÉGICAS */}
                <div className="pt-8 border-t border-zinc-200">
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-700 mb-6">
                        🔧 Contexto Estratégico
                    </h3>

                    {/* Gap de Processo */}
                    <div className="space-y-3 mb-6">
                        <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                            Qual PROCESSO está quebrado no seu crescimento? *
                        </Label>
                        <p className="text-xs text-zinc-500">
                            Não queremos saber "preciso crescer mais". Queremos saber: qual processo operacional, de vendas, marketing ou produto está te impedindo de escalar?
                        </p>
                        <textarea
                            {...form.register('processGap')}
                            className="w-full min-h-[120px] p-4 border border-zinc-300 focus:border-black transition-colors resize-none text-sm font-mono bg-white"
                            placeholder="Ex: Não temos processo estruturado de vendas. Cada vendedor faz do seu jeito, não temos playbook, não sabemos por que alguns fecham e outros não..."
                            maxLength={300}
                        />
                        <div className="text-xs text-zinc-400 text-right">
                            {form.watch('processGap')?.length || 0}/300 caracteres
                        </div>
                        {form.formState.errors.processGap && (
                            <p className="text-red-500 text-xs">{form.formState.errors.processGap.message as string}</p>
                        )}
                    </div>

                    {/* Tentativas de Implementação */}
                    <div className="space-y-3 mb-6">
                        <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                            O que você já tentou IMPLEMENTAR e travou? *
                        </Label>
                        <p className="text-xs text-zinc-500">
                            Liste 2-3 iniciativas que você começou mas não conseguiu implementar completamente. O que travou?
                        </p>
                        <textarea
                            {...form.register('implementationAttempts')}
                            className="w-full min-h-[140px] p-4 border border-zinc-300 focus:border-black transition-colors resize-none text-sm font-mono bg-white"
                            placeholder="Ex: 1. CRM → Compramos mas ninguém usa, dados bagunçados&#10;2. Email nurturing → Criamos 2 emails e paramos, sem processo&#10;3. Onboarding → Sabemos que precisa mas não sabemos por onde começar..."
                            maxLength={400}
                        />
                        <div className="text-xs text-zinc-400 text-right">
                            {form.watch('implementationAttempts')?.length || 0}/400 caracteres
                        </div>
                        {form.formState.errors.implementationAttempts && (
                            <p className="text-red-500 text-xs">{form.formState.errors.implementationAttempts.message as string}</p>
                        )}
                    </div>

                    {/* Restrição de Execução */}
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                            O que IMPEDE você de executar o que sabe que precisa fazer? *
                        </Label>
                        <p className="text-xs text-zinc-500">
                            Não queremos "falta de tempo". Queremos saber: É falta de conhecimento técnico? Falta de mão de obra? Falta de processo?
                        </p>
                        <textarea
                            {...form.register('executionConstraint')}
                            className="w-full min-h-[120px] p-4 border border-zinc-300 focus:border-black transition-colors resize-none text-sm font-mono bg-white"
                            placeholder="Ex: Sabemos que precisamos estruturar RevOps mas não temos ninguém no time com esse conhecimento. Precisamos de alguém para FAZER com a gente..."
                            maxLength={300}
                        />
                        <div className="text-xs text-zinc-400 text-right">
                            {form.watch('executionConstraint')?.length || 0}/300 caracteres
                        </div>
                        {form.formState.errors.executionConstraint && (
                            <p className="text-red-500 text-xs">{form.formState.errors.executionConstraint.message as string}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
