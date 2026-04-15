import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientAccount {
  id: string;
  client_email: string;
  client_name: string | null;
  client_company: string | null;

  // GHL IDs
  revhackers_contact_id: string | null;
  revhackers_opportunity_id: string | null;
  funnels_contact_id: string | null;
  funnels_opportunity_id: string | null;

  // Flags de produto
  has_consulting: boolean;
  has_software: boolean;

  // Valores
  consulting_value: number;
  software_value: number;

  // Datas
  consulting_start_date: string | null;
  consulting_end_date: string | null;
  software_activation_date: string | null;
  software_renewal_date: string | null;

  // Status
  consulting_status: 'pending' | 'active' | 'completed';
  software_status: 'pending' | 'onboarding' | 'active' | 'churn';

  created_at: string;
  updated_at: string;
}

export type ClientAccountPatch = Partial<Omit<ClientAccount, 'id' | 'created_at' | 'updated_at'>>;

/** Busca o client_account pelo email do cliente (join via projeto). */
export function useClientAccount(clientEmail: string | null | undefined) {
  return useQuery<ClientAccount | null>({
    queryKey: ['client-account', clientEmail],
    enabled: !!clientEmail,
    staleTime: 1000 * 60 * 2, // 2 min
    queryFn: async () => {
      if (!clientEmail) return null;
      const { data, error } = await supabase
        .from('client_accounts')
        .select('*')
        .eq('client_email', clientEmail.toLowerCase())
        .maybeSingle();

      if (error) throw error;
      return data as ClientAccount | null;
    },
  });
}

/** Cria ou atualiza (upsert) o client_account pelo email. */
export function useUpsertClientAccount() {
  const queryClient = useQueryClient();

  return useMutation<ClientAccount, Error, { email: string; patch: ClientAccountPatch }>({
    mutationFn: async ({ email, patch }) => {
      const { data, error } = await supabase
        .from('client_accounts')
        .upsert(
          { client_email: email.toLowerCase(), ...patch },
          { onConflict: 'client_email' }
        )
        .select('*')
        .single();

      if (error) throw error;
      return data as ClientAccount;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-account', data.client_email] });
    },
  });
}
