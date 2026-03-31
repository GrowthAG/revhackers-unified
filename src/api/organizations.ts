import { supabase } from "@/integrations/supabase/client";

export interface GHLWebhooks {
    rei?: string;
    contact?: string;
}

export interface OrganizationSettings {
    ghl_location_id?: string;
    ghl_webhooks?: GHLWebhooks;
    access_token?: string;
    refresh_token?: string;
    auth_updated_at?: string;
    [key: string]: any;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    is_master: boolean;
    status: string;
    plan: string;
    settings: OrganizationSettings | null;
    parent_id: string | null;
    created_at?: string;
    updated_at?: string;
}

export const getAllOrganizations = async (): Promise<Organization[]> => {
    const { data, error } = await supabase
        .from('organizations' as any)
        .select('*')
        .order('is_master', { ascending: false }) // Mater primeiro (RevHackers)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching organizations:', error);
        return [];
    }
    return (data as any) || [];
};

export const updateOrganizationSettings = async (id: string, settings: OrganizationSettings): Promise<Organization | null> => {
    // Primeiro, buscamos as settings atuais para fazer um merge
    const { data: org, error: fetchError } = await supabase
        .from('organizations' as any)
        .select('settings')
        .eq('id', id)
        .single();

    if (fetchError) {
        console.error('Error fetching org settings before update:', fetchError);
        throw fetchError;
    }

    const currentSettings = (org as any).settings || {};
    const updatedSettings = { ...currentSettings, ...settings };

    const { data, error } = await supabase
        .from('organizations' as any)
        .update({ settings: updatedSettings as any })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating organization settings:', error);
        throw error;
    }
    return data as any;
};
