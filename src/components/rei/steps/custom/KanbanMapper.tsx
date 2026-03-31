import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    form: UseFormReturn<any>;
    fieldName: string;
}

export default function KanbanMapper({ form, fieldName }: Props) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: fieldName,
    });

    return (
        <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-zinc-200 bg-white relative group">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="space-y-3 pr-8">
                        <div>
                            <Label className="text-zinc-700 text-xs font-bold uppercase tracking-wider">Nome do Pipeline *</Label>
                            <Input
                                {...form.register(`${fieldName}.${index}.name` as const)}
                                placeholder="Ex: Closer B2B ou Vendas Inbound"
                                className="mt-1 h-10 border-zinc-200 text-black"
                            />
                        </div>
                        <div>
                            <Label className="text-zinc-700 text-xs font-bold uppercase tracking-wider">Etapas (Uma por linha) *</Label>
                            <Textarea
                                placeholder="1 - Lead Novo&#10;2 - Contato Feito&#10;3 - Reunião Agendada..."
                                className="mt-1 border-zinc-200 min-h-[100px] text-black"
                                onChange={(e) => {
                                    const lines = e.target.value.split('\n').filter(l => l.trim() !== '');
                                    form.setValue(`${fieldName}.${index}.stages` as any, lines);
                                }}
                                defaultValue={form.getValues(`${fieldName}.${index}.stages` as any)?.join('\n') || ''}
                            />
                            <p className="text-xxs text-zinc-500 mt-1 uppercase tracking-wide">Apenas quebre a linha para criar uma nova etapa no Kanban.</p>
                        </div>
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', stages: [] })}
                className="w-full border-dashed border-2 border-zinc-300 text-zinc-600 hover:border-black hover:text-black transition-colors"
                title="Adicionar Novo Pipeline"
            >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Novo Pipeline
            </Button>
        </div>
    );
}
