import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
    form: UseFormReturn<any>;
}

export default function StepCrmOps2TechStack({ form }: Props) {
    return (
        <div className="space-y-8">
            <div className="border-b border-black pb-4">
                <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                    Sua Estrutura Tecnológica (Tech Stack)
                </h2>
                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                    Como as suas ferramentas operam em conjunto
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_hub_central" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Qual é a sua principal ferramenta de gestão comercial (CRM)? *</Label>
                <Input
                    {...form.register('revops_hub_central')}
                    id="revops_hub_central"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: HubSpot, RD Station CRM, Pipedrive..."
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Como é a integração entre as ferramentas que você utiliza? *</Label>
                <RadioGroup
                    value={form.watch('revops_integracoes')}
                    onValueChange={(value) => form.setValue('revops_integracoes', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="all-in-one" id="int-1" className="mt-1" />
                        <Label htmlFor="int-1" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Tudo em um só lugar:</strong> nossa operação roda principalmente em uma plataforma centralizada (E-mail, CRM, Telefonia).
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="hub_satelites" id="int-2" className="mt-1" />
                        <Label htmlFor="int-2" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Hub central + ferramentas satélites:</strong> temos uma plataforma principal (CRM/Funil) e ferramentas especializadas ao redor (prospecção, enriquecimento, telefonia), sem integração automática completa.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="frankenstein" id="int-3" className="mt-1" />
                        <Label htmlFor="int-3" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Ferramentas separadas:</strong> utilizamos várias ferramentas conectadas (ex: via Zapier/Make) ou de forma manual, sem um hub central definido.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_tech_debt_cost" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Investimento em Ferramentas (Próximos 12 meses) *</Label>
                <p className="text-xxs text-zinc-500 uppercase tracking-wide">Qual é a sua estimativa de orçamento mensal ou anual para manter ou evoluir sua base tecnológica de vendas?</p>
                <Input
                    {...form.register('revops_tech_debt_cost')}
                    id="revops_tech_debt_cost"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: R$ 2.000/mês ou R$ 25.000/ano"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="revops_data_hygiene_owner" className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Como é feita a qualificação e o enriquecimento de dados? *</Label>
                <Input
                    {...form.register('revops_data_hygiene_owner')}
                    id="revops_data_hygiene_owner"
                    className="bg-white border-zinc-200 text-black h-12"
                    placeholder="Ex: Usamos ferramentas automáticas ou preenchimento natural do vendedor"
                />
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Adoção do sistema pela equipe comercial *</Label>
                <p className="text-xxs text-zinc-500 uppercase tracking-wide">Como está a centralização das informações dos clientes no seu CRM?</p>
                <RadioGroup
                    value={form.watch('revops_shadow_it_index')}
                    onValueChange={(value) => form.setValue('revops_shadow_it_index', value)}
                    className="space-y-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim_muito" id="s-sim" />
                        <Label htmlFor="s-sim" className="text-zinc-700 font-normal cursor-pointer text-sm">Ainda há muitas informações descentralizadas (cadernos, WhatsApp pessoal não registrado no CRM).</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao_controlado" id="s-nao" />
                        <Label htmlFor="s-nao" className="text-zinc-700 font-normal cursor-pointer text-sm">A equipe registra praticamente tudo no sistema oficial (chamadas, e-mails, WhatsApp).</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-3">
                <Label className="text-zinc-700 text-sm font-bold uppercase tracking-wider">Nível de Automação (Marketing e Vendas) *</Label>
                <p className="text-xxs text-zinc-500 mb-2 uppercase tracking-wide">Como é a capacidade do sistema atual de engajar seus prospects e gerar alertas para os vendedores?</p>
                <RadioGroup
                    value={form.watch('revops_automacoes_core')}
                    onValueChange={(value) => form.setValue('revops_automacoes_core', value)}
                    className="space-y-3"
                >
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="manual" id="aut-1" className="mt-1" />
                        <Label htmlFor="aut-1" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Processo majoritariamente manual:</strong> dependemos 100% da lembrança e esforço humano em fazer contatos de nutrição e acompanhamento.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="basica" id="aut-2" className="mt-1" />
                        <Label htmlFor="aut-2" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Automação básica:</strong> alguns fluxos de e-mail padrões, porém com pouca comunicação ativa e estratégica com a equipe de vendas.
                        </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                        <RadioGroupItem value="avancada" id="aut-3" className="mt-1" />
                        <Label htmlFor="aut-3" className="text-zinc-500 font-normal leading-relaxed cursor-pointer text-sm">
                            <strong className="text-black block">Processo inteligente:</strong> alertas e tarefas criadas em tempo real com base no comportamento do prospect com materiais e canais de prospecção.
                        </Label>
                    </div>
                </RadioGroup>
            </div>

        </div>
    );
}
