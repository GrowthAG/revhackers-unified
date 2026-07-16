import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook reutilizável para soft delete em qualquer tabela
 * 
 * @param table - Nome da tabela Supabase
 * @returns Função async que faz soft delete e retorna boolean
 * 
 * @example
 * const softDelete = useSoftDelete('materials');
 * const success = await softDelete(id);
 * if (success) {
 *   // Atualizar estado local
 * }
 */
export function useSoftDelete(table: string) {
    const { toast } = useToast();

    return async (id: string): Promise<boolean> => {
        // Confirmação do usuário
        if (!confirm('Tem certeza que deseja excluir?')) {
            return false;
        }

        // Soft delete: marcar published: false
        const { error } = await supabase
            .from(table)
            .update({ published: false })
            .eq('id', id);

        // Tratamento de erro
        if (error) {
            console.error(`Erro ao excluir de ${table}:`, error);
            toast({
                title: 'Erro ao excluir',
                description: error.message,
                variant: 'destructive'
            });
            return false;
        }

        // Sucesso
        toast({ title: 'Excluído com sucesso' });
        return true;
    };
}
