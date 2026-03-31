import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Props {
    form: UseFormReturn<any>;
    fieldName: string;
}

const REVHACKERS_LOST_CATEGORIES = [
    { value: 'timing', label: 'Timing Errado (Nutrição)' },
    { value: 'price', label: 'Preço/Budget (Produto)' },
    { value: 'competitor', label: 'Perdido p/ Concorrente' },
    { value: 'feature', label: 'Funcionalidade Faltante' },
    { value: 'ghosted', label: 'Sumiu (Ghosted/No Decision)' },
    { value: 'bad_fit', label: 'Bad Fit / Fora de Perfil ICP' },
    { value: 'unreachable', label: 'Número Inexistente / Inalcançável (Contato Inválido)' },
    { value: 'other', label: 'Motivo Vago / Indefinido' },
];

export default function LostReasonMapper({ form, fieldName }: Props) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: fieldName,
    });

    return (
        <div className="space-y-4">
            {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-3 items-end p-4 border border-zinc-200 bg-white relative group">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="absolute -top-3 -right-3 rounded-full bg-white border border-zinc-200 text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>

                    <div className="flex-1 w-full space-y-1">
                        <Label className="text-zinc-700 text-xs font-bold uppercase tracking-wider">Motivo usado no Cliente *</Label>
                        <Input
                            {...form.register(`${fieldName}.${index}.reason` as const)}
                            placeholder="Ex: Acharam muito caro"
                            className="h-10 border-zinc-200 text-black"
                        />
                    </div>

                    <div className="flex-1 w-full space-y-1">
                        <Label className="text-zinc-700 text-xs font-bold uppercase tracking-wider">Match RevHackers (Taxonomia) *</Label>
                        <Select
                            onValueChange={(val) => form.setValue(`${fieldName}.${index}.category` as any, val)}
                            defaultValue={form.getValues(`${fieldName}.${index}.category` as any)}
                        >
                            <SelectTrigger className="h-10 border-zinc-200 bg-zinc-50 text-black">
                                <SelectValue placeholder="Selecione o melhor motivo" />
                            </SelectTrigger>
                            <SelectContent>
                                {REVHACKERS_LOST_CATEGORIES.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                onClick={() => append({ reason: '', category: '' })}
                className="w-full border-dashed border-2 border-zinc-300 text-zinc-600 hover:border-black hover:text-black hover:bg-zinc-50 transition-colors bg-white"
            >
                <Plus className="h-4 w-4 mr-2" />
                Mapear novo Motivo de Perda
            </Button>
        </div>
    );
}
