import { supabase } from "@/integrations/supabase/client";

export interface Client {
    id: string;
    name: string;
    email: string;
    company?: string;
    cnpj?: string;
    cep?: string;
    address?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    logo_url?: string;
    website?: string;
    status: 'active' | 'onboarding' | 'churned';
    created_at?: string;
}

export type ClientInsert = Omit<Client, 'id' | 'created_at'>;
export type ClientUpdate = Partial<ClientInsert>;

export const getAllClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
        .from('clients' as any)
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.warn('Clients table might not exist yet:', error.message);
        return [];
    }
    return (data as any) || [];
};

export const getClientById = async (id: string): Promise<Client | null> => {
    const { data, error } = await supabase
        .from('clients' as any)
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching client:', error);
        return null;
    }
    return data as any;
};

export const createClient = async (client: ClientInsert): Promise<Client | null> => {
    const { data, error } = await supabase
        .from('clients' as any)
        .insert(client as any)
        .select()
        .single();

    if (error) {
        console.error('Error creating client:', error);
        throw error;
    }
    return data as any;
};

export const updateClient = async (id: string, updates: ClientUpdate): Promise<Client | null> => {
    const { data, error } = await supabase
        .from('clients' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating client:', error);
        throw error;
    }
    return data as any;
};

export const deleteClient = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('clients' as any)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting client:', error);
        throw error;
    }
};
