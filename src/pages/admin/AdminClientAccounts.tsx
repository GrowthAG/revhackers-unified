import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Search, ExternalLink, RefreshCw, Loader2,
  Building2, Users, TrendingUp, AlertTriangle,
  Check, X, Link2Off,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientAccount {
  id: string;
  client_email: string;
  client_name: string | null;
  client_company: string | null;
  revhackers_contact_id: string | null;
  funnels_contact_id: string | null;
  revhackers_opportunity_id: string | null;
  funnels_opportunity_id: string | null;
  has_consulting: boolean;
  has_software: boolean;
  consulting_value: number;
  software_value: number;
  consulting_status: string;
  software_status: string;
  consulting_start_date: string | null;
  software_activation_date: string | null;
  software_renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CONSULTING_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  completed: 'Concluido',
};

const SOFTWARE_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  onboarding: 'Onboarding',
  active: 'Ativo',
  churn: 'Churn',
};

type FilterKey = 'todos' | 'consulting' | 'software' | 'dual' | 'sem_vinculo';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function GHLBadge({ contactId, label, locationKey }: {
  contactId: string | null;
  label: string;
  locationKey?: string;
}) {
  if (!contactId) {
    return (
      <span className="flex items-center gap-1 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
        <Link2Off className="w-2.5 h-2.5" /> {label}
      </span>
    );
  }
  return (
    <a
      href={`https://app.gohighlevel.com/contacts/detail/${contactId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-900 font-bold uppercase tracking-widest transition-colors"
    >
      <ExternalLink className="w-2.5 h-2.5" /> {label}
    </a>
  );
}

function StatusDot({ status, type }: { status: string; type: 'consulting' | 'software' }) {
  const colorMap: Record<string, string> = {
    active: 'bg-[#00CC6A]',
    onboarding: 'bg-yellow-400',
    completed: 'bg-zinc-300',
    churn: 'bg-red-500',
    pending: 'bg-zinc-200',
  };
  const labelMap = type === 'consulting' ? CONSULTING_STATUS_LABEL : SOFTWARE_STATUS_LABEL;
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('w-1.5 h-1.5 rounded-none', colorMap[status] ?? 'bg-zinc-200')} />
      <span className="text-[11px] font-bold text-zinc-600">{labelMap[status] ?? status}</span>
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminClientAccounts: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [orgFilter, setOrgFilter] = useState<'all' | 'revhackers' | 'funnels'>('all');

  const { data: accounts = [], isLoading, refetch, isFetching } = useQuery<ClientAccount[]>({
    queryKey: ['admin-client-accounts'],
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_accounts')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as ClientAccount[];
    },
  });

  // ── Filtering & Derived Stats ──────────────────────────────────────────────────────────────

  const filteredByOrg = accounts.filter(a => {
      if (orgFilter === 'revhackers') return !!a.revhackers_contact_id;
      if (orgFilter === 'funnels') return !!a.funnels_contact_id;
      return true;
  });

  const totalLTV = filteredByOrg.reduce((s, a) => {
    if (orgFilter === 'revhackers') return s + (a.consulting_value || 0);
    if (orgFilter === 'funnels') return s + (a.software_value || 0);
    return s + (a.consulting_value || 0) + (a.software_value || 0);
  }, 0);

  const dualCount = filteredByOrg.filter(a => a.has_consulting && a.has_software).length;
  const semVinculo = filteredByOrg.filter(a => !a.revhackers_contact_id && !a.funnels_contact_id).length;

  const filtered = filteredByOrg
    .filter(a => {
      if (filter === 'consulting') return a.has_consulting;
      if (filter === 'software') return a.has_software;
      if (filter === 'dual') return a.has_consulting && a.has_software;
      if (filter === 'sem_vinculo') return !a.revhackers_contact_id && !a.funnels_contact_id;
      return true;
    })
    .filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (a.client_email || '').toLowerCase().includes(q) ||
        (a.client_name || '').toLowerCase().includes(q) ||
        (a.client_company || '').toLowerCase().includes(q)
      );
    });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white">

        {/* Header */}
        <div className="border-b border-zinc-100 px-8 md:px-12 pt-10 pb-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-6 mb-8">
              <div>
                <p className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">Hub - Contas</p>
                <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-[1.05]">
                  Contas Unificadas
                </h1>
                <p className="text-sm font-medium text-zinc-400 mt-2">
                  Visao GHL RevHackers + GHL Funnels por cliente
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={orgFilter}
                  onChange={(e) => setOrgFilter(e.target.value as any)}
                  className="bg-transparent border border-zinc-200 text-zinc-600 hover:border-zinc-900 focus:outline-none focus:border-zinc-900 font-black uppercase tracking-widest text-xxs h-10 px-4 transition-colors cursor-pointer"
                >
                  <option value="all">Todas as Contas</option>
                  <option value="revhackers">Org: RevHackers</option>
                  <option value="funnels">Org: Funnels</option>
                </select>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="shrink-0 inline-flex items-center gap-2 border border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 font-black uppercase tracking-widest text-xxs h-10 px-5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', isFetching && 'animate-spin')} />
                  Atualizar
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-t border-zinc-100 divide-x divide-zinc-100 mb-0">
              {[
                { label: 'Total', value: filteredByOrg.length, icon: Users },
                { label: 'Dual (Cons. + Soft.)', value: dualCount, icon: TrendingUp },
                { label: 'LTV Total', value: formatBRL(totalLTV), icon: TrendingUp },
                { label: 'Sem Vinculo GHL', value: semVinculo, icon: AlertTriangle },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="px-6 py-5 first:pl-0">
                  <p className="text-xxs font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
                  <p className="text-2xl font-black text-zinc-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-6 border-t border-zinc-100">
              {([
                { key: 'todos', label: 'Todos' },
                { key: 'consulting', label: 'Consultoria' },
                { key: 'software', label: 'Software' },
                { key: 'dual', label: 'Dual' },
                { key: 'sem_vinculo', label: 'Sem Vinculo' },
              ] as { key: FilterKey; label: string }[]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'py-4 text-xxs font-black uppercase tracking-widest border-b-2 transition-colors',
                    filter === f.key
                      ? 'border-zinc-900 text-zinc-900'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">
          {/* Search */}
          <div className="flex items-center gap-2 border border-zinc-200 bg-white mb-6">
            <Search className="w-4 h-4 text-zinc-400 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por email, nome ou empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 py-3 pr-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-300 bg-transparent outline-none"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 border-2 animate-spin text-zinc-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 mt-4 text-center">
              <Building2 className="w-10 h-10 text-zinc-200 mb-4" />
              <p className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-1">Nenhuma conta encontrada</p>
              <p className="text-xs text-zinc-400 font-medium">
                Contas sao criadas automaticamente quando um deal e ganho no GHL.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0 border border-zinc-200 divide-y divide-zinc-100">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-50">
                <div className="col-span-3">
                  <p className="text-xxs font-black uppercase tracking-widest text-zinc-400">Cliente</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xxs font-black uppercase tracking-widest text-zinc-400">Consultoria</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xxs font-black uppercase tracking-widest text-zinc-400">Software</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xxs font-black uppercase tracking-widest text-zinc-400">LTV</p>
                </div>
                <div className="col-span-3">
                  <p className="text-xxs font-black uppercase tracking-widest text-zinc-400">Vinculos GHL</p>
                </div>
              </div>

              {filtered.map(account => {
                let ltv = 0;
                if (orgFilter === 'revhackers') ltv = account.consulting_value || 0;
                else if (orgFilter === 'funnels') ltv = account.software_value || 0;
                else ltv = (account.consulting_value || 0) + (account.software_value || 0);

                return (
                  <div
                    key={account.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-50/50 transition-colors group"
                  >
                    {/* Cliente */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm font-black text-zinc-900 truncate">
                        {account.client_name || '-'}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-medium truncate">
                        {account.client_company || account.client_email}
                      </p>
                      <p className="text-[10px] text-zinc-300 truncate">{account.client_email}</p>
                    </div>

                    {/* Consultoria */}
                    <div className="col-span-2">
                      {account.has_consulting ? (
                        <StatusDot status={account.consulting_status} type="consulting" />
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
                          <X className="w-2.5 h-2.5" /> Nao
                        </span>
                      )}
                    </div>

                    {/* Software */}
                    <div className="col-span-2">
                      {account.has_software ? (
                        <StatusDot status={account.software_status} type="software" />
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
                          <X className="w-2.5 h-2.5" /> Nao
                        </span>
                      )}
                    </div>

                    {/* LTV */}
                    <div className="col-span-2">
                      {ltv > 0 ? (
                        <span className="text-sm font-black text-zinc-900">{formatBRL(ltv)}</span>
                      ) : (
                        <span className="text-[11px] text-zinc-300">-</span>
                      )}
                    </div>

                    {/* Vinculos GHL */}
                    <div className="col-span-3 space-y-1">
                      <GHLBadge contactId={account.revhackers_contact_id} label="RevHackers" />
                      <GHLBadge contactId={account.funnels_contact_id} label="Funnels" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminClientAccounts;
