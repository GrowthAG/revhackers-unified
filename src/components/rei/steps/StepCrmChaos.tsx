import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StepCrmChaosProps {
    form: UseFormReturn<any>;
}

export default function StepCrmChaos({ form }: StepCrmChaosProps) {
    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    O Caos Atual (Mapeamento)
                </h2>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                    Diagnóstico Operacional
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="currentCrm" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Qual CRM/Ferramenta de Vendas você utiliza atualmente? *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Ex: HubSpot, Pipedrive, Salesforce, Kommo, RD Station CRM, Planilhas Excel.</p>
                <Input
                    {...form.register('currentCrm')}
                    id="currentCrm"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Digite o CRM utilizado"
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Como você avalia a satisfação e a adoção do seu time em relação ao CRM? *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">A ferramenta ajuda a vender ou é vista como um fardo burocrático?</p>
                <RadioGroup
                    value={form.watch('crmSatisfaction')}
                    onValueChange={(value) => form.setValue('crmSatisfaction', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="alta" id="sat-alta" className="mt-1" />
                        <Label htmlFor="sat-alta" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Alta Adoção:</strong> A equipe ama, tudo está documentado e usamos automações avançadas.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="media" id="sat-media" className="mt-1" />
                        <Label htmlFor="sat-media" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Média Adoção:</strong> Usamos para cobrar resultados, mas os dados frequentemente estão desatualizados.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="baixa" id="sat-baixa" className="mt-1" />
                        <Label htmlFor="sat-baixa" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Adoção Pobre:</strong> O time odeia preencher. É visto como obrigação e gerência não confia nos números.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Qual o tempo médio de primeira resposta (Speed to Lead) da sua equipe? *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Quanto tempo demora para o lead ser contatado após levantar a mão?</p>
                <RadioGroup
                    value={form.watch('speedToLead')}
                    onValueChange={(value) => form.setValue('speedToLead', value)}
                    className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="menos-5m" id="menos-5m" />
                        <Label htmlFor="menos-5m" className="text-zinc-700 font-normal cursor-pointer text-sm">Menos de 5 minutos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ate-1h" id="ate-1h" />
                        <Label htmlFor="ate-1h" className="text-zinc-700 font-normal cursor-pointer text-sm">Até 1 hora</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ate-24h" id="ate-24h" />
                        <Label htmlFor="ate-24h" className="text-zinc-700 font-normal cursor-pointer text-sm">Até 24 horas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao-sei" id="nao-sei" />
                        <Label htmlFor="nao-sei" className="text-zinc-700 font-normal cursor-pointer text-sm">Não tenho esse dado medido hoje</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="followUpCount" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Quantos follow-ups a equipe faz antes de dar um lead como "Perdido"? *</Label>
                <Input
                    {...form.register('followUpCount')}
                    id="followUpCount"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: Fazemos 2 ligações e desistimos..."
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Dívida Tecnológica Oculta (Shadow IT) *</Label>
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wide">Equipe usa bloqueios, cadernos ou WhatsApp pessoal para vendas?</p>
                <RadioGroup
                    value={form.watch('shadowIt')}
                    onValueChange={(value) => form.setValue('shadowIt', value)}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim_muitas" id="shadow-sim" />
                        <Label htmlFor="shadow-sim" className="text-zinc-700 font-normal cursor-pointer text-sm">Sim, usamos muitas planilhas por fora e cadernos.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao_centralizado" id="shadow-nao" />
                        <Label htmlFor="shadow-nao" className="text-zinc-700 font-normal cursor-pointer text-sm">Não, 100% da operação e conversas rodam de forma centralizada pelo CRM.</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    );
}
