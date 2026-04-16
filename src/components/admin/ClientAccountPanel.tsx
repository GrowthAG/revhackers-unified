import React, { useState } from 'react';
import { useClientAccount, useUpsertClientAccount } from '@/hooks/useClientAccount';
import {
  ExternalLink,
  Loader2,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Link2,
} from 'lucide-react';

interface Props {
  /** Email do cliente extraido do rei_project */
  clientEmail: string | null | undefined;
  projectName?: string;
}

function StatusPill({ status, type }: { status: string; type: 'consulting' | 'software' }) {
  const colorMap: Record<string, string> = {
    active:    'text-[#00CC6A] bg-[#00CC6A]/10',
    onboarding:'text-yellow-600 bg-yellow-50',
    completed: 'text-zinc-400 bg-zinc-100',
    churn:     'text-red-500 bg-red-50',
    pending:   'text-zinc-400 bg-zinc-50',
  };
  const labelMap: Record<string, string> = {
    pending:    'Pendente',
    active:     'Ativo',
    completed:  'Concluido',
    churn:      'Churn',
    onboarding: 'Onboarding',
  };
  return (
    <span
      className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${colorMap[status] ?? 'text-zinc-400 bg-zinc-50'}`}
    >
      {labelMap[status] ?? status}
    </span>
  );
}

function GHLLink({ label, contactId, locationId }: { label: string; contactId: string | null; locationId?: string }) {
  if (!contactId) {
    return (
      <span className="text-[11px] text-zinc-300 italic">Nao vinculado</span>
    );
  }
  // URL padrao do GHL para contato (sem location, abre a busca global)
  const url = locationId
    ? `https://app.gohighlevel.com/location/${locationId}/contacts/detail/${contactId}`
    : `https://app.gohighlevel.com/contacts/detail/${contactId}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors"
    >
      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
      {label}
    </a>
  );
}

export function ClientAccountPanel({ clientEmail, projectName }: Props) {
  const { data: account, isLoading, isError, refetch } = useClientAccount(clientEmail);
  const { mutate: upsert, isPending: upserting } = useUpsertClientAccount();
  const [linking, setLinking] = useState(false);
  const [linkInput, setLinkInput] = useState({ revhackers: '', funnels: '' });

  if (!clientEmail) {
    return (
      <div className="mt-4 border-t border-zinc-200 pt-4">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-2">Conta do Cliente</p>
        <p className="text-[11px] text-zinc-400">Projeto sem email - nao e possivel vincular conta.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-4 border-t border-zinc-200 pt-4">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-2">Conta do Cliente</p>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 border-t border-zinc-200 pt-4">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-2">Conta do Cliente</p>
        <p className="text-[11px] text-red-500">Erro ao carregar conta.</p>
      </div>
    );
  }

  function handleSaveLinks() {
    if (!clientEmail) return;
    upsert({
      email: clientEmail,
      patch: {
        client_name: projectName ?? undefined,
        revhackers_contact_id: linkInput.revhackers || undefined,
        funnels_contact_id: linkInput.funnels || undefined,
      },
    }, {
      onSuccess: () => {
        setLinking(false);
        setLinkInput({ revhackers: '', funnels: '' });
      },
    });
  }

  // Conta ainda nao existe
  if (!account) {
    return (
      <div className="mt-4 border-t border-zinc-200 pt-4">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-2">Conta do Cliente</p>
        <p className="text-[11px] text-zinc-400 mb-3">Sem conta unificada criada.</p>

        {!linking ? (
          <button
            onClick={() => setLinking(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-all"
          >
            <Link2 className="w-3 h-3" /> Vincular Contatos CRM
          </button>
        ) : (
          <div className="space-y-2">
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Contact ID RevHackers</p>
              <input
                type="text"
                value={linkInput.revhackers}
                onChange={e => setLinkInput(v => ({ ...v, revhackers: e.target.value }))}
                placeholder="ex: abc123..."
                className="w-full border border-zinc-200 px-2 py-1.5 text-[11px] text-zinc-900 outline-none focus:border-zinc-900 transition-colors bg-white"
              />
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Contact ID Funnels</p>
              <input
                type="text"
                value={linkInput.funnels}
                onChange={e => setLinkInput(v => ({ ...v, funnels: e.target.value }))}
                placeholder="ex: xyz456..."
                className="w-full border border-zinc-200 px-2 py-1.5 text-[11px] text-zinc-900 outline-none focus:border-zinc-900 transition-colors bg-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveLinks}
                disabled={upserting}
                className="flex-1 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-3 py-1.5 hover:bg-black transition-colors disabled:opacity-50"
              >
                {upserting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salvar'}
              </button>
              <button
                onClick={() => setLinking(false)}
                className="text-[10px] font-black uppercase tracking-widest border border-zinc-200 text-zinc-500 px-3 py-1.5 hover:border-zinc-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Conta existe: exibir status
  return (
    <div className="mt-4 border-t border-zinc-200 pt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em]">Conta do Cliente</p>
        <button onClick={() => refetch()} className="text-zinc-300 hover:text-zinc-600 transition-colors" title="Atualizar">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Consulting */}
        {account.has_consulting && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">Consultoria</span>
            <StatusPill status={account.consulting_status} type="consulting" />
          </div>
        )}

        {/* Software */}
        {account.has_software && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">Software</span>
            <StatusPill status={account.software_status} type="software" />
          </div>
        )}

        {/* GHL Links */}
        <div className="pt-1 space-y-1">
          <GHLLink label="Contato RevHackers" contactId={account.revhackers_contact_id} />
          <GHLLink label="Contato Funnels" contactId={account.funnels_contact_id} />
        </div>

        {/* Valores */}
        {(account.consulting_value > 0 || account.software_value > 0) && (
          <div className="pt-1 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
              LTV
            </span>
            <span className="text-[11px] font-black text-zinc-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
                .format(account.consulting_value + account.software_value)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
