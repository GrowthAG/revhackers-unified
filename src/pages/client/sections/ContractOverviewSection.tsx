import React, { useState, useEffect } from 'react';
import { FileSignature, ShieldCheck, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ContractOverviewSectionProps {
  plan: any;
  project: any;
  contractAccepted: boolean;
  setContractAccepted: (v: boolean) => void;
}

export default function ContractOverviewSection({
  plan,
  project,
  contractAccepted,
  setContractAccepted
}: ContractOverviewSectionProps) {
  
  const [chk1, setChk1] = useState(false);
  const [chk2, setChk2] = useState(false);
  const [chk3, setChk3] = useState(false);

  useEffect(() => {
    if (chk1 && chk2 && chk3) {
      setContractAccepted(true);
    } else {
      setContractAccepted(false);
    }
  }, [chk1, chk2, chk3, setContractAccepted]);

  // Se já estava aceito (re-visita ao slide), forçar tudo como checked
  useEffect(() => {
    if (contractAccepted) {
      setChk1(true);
      setChk2(true);
      setChk3(true);
    }
  }, []);

  const contractData = project?.opportunity_data?.contract_data || {};
  const projectType = project?.type || 'full';

  // Dynamic Scopes
  const scopeItems = projectType === 'crm_ops' 
    ? [
        "Mapeamento de Processo Comercial (Blueprint)",
        "Configuração de Pipelines e Estágios Customizados",
        "Automações de Follow-up (Workflows GHL)",
        "Integrações Nativas (Calendários, Email, Meta Ads)",
        "Treinamento da Equipe Comercial (Handover)"
      ] 
    : projectType === 'funnels_impl' 
    ? [
        "Copywriting Estratégico para VSL/Landing Page",
        "Design B2B Premium & Desenvolvimento Web",
        "Configuração técnica de Domínio e DNS",
        "Automações de Email Marketing associadas ao Funil",
        "Rastreamento Primário (Pixel/Analytics)"
      ]
    : [
        "Planejamento Estratégico Go-To-Market",
        "Estruturação de Operação de Vendas (CRM)",
        "Desenvolvimento de Funis de Aquisição",
        "Acompanhamento e Consultoria Especializada"
      ];

  const outOfScopeItems = projectType === 'crm_ops'
    ? [
        "Gestão Diária de Tráfego Pago (Ads)",
        "Criação de Conteúdo para Redes Sociais",
        "SDR/BDR as a Service (Prospecção Feita por Nós)",
        "Treinamento de Técnicas de Fechamento de Vendas"
      ]
    : projectType === 'funnels_impl'
    ? [
        "Edição de Vídeos Longos / Gravação Física",
        "Gestão Mensal de Anúncios Constante",
        "Sistemas de Software Complexos Sob-medida"
      ]
    : [
        "Tarefas operacionais fora do Framework REI",
        "Marketing de Conteúdo ou Press Release"
      ];

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 lg:px-12 pb-24 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* HEADER */}
      <div className="mb-14 border-b border-zinc-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight">
            Acordo Definitivo & Escopo
          </h2>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            Entidade Vinculada
          </p>
          <p className="text-base font-semibold text-zinc-900 mt-1">{contractData?.legal_company_name || project?.client_company}</p>
          <p className="text-sm font-medium text-zinc-500">CNPJ: {contractData?.cnpj || 'Não informado'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* IN SCOPE / OUT OF SCOPE */}
        <div className="space-y-10 pr-0 lg:pr-8">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-6 tracking-tight">
              O Que Vamos Entregar (In-Scope)
            </h3>
            <ul className="space-y-2">
              {scopeItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 bg-zinc-50/50 p-3.5 border border-zinc-200/60">
                  <CheckCircle2 className="w-4 h-4 text-[#00CC6A] mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-zinc-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-6 tracking-tight">
              O Que NÃO Está Incluso (Out-of-Scope)
            </h3>
            <ul className="space-y-2">
              {outOfScopeItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 bg-red-50/30 p-3.5 border border-red-100/30">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-zinc-500 leading-relaxed line-through">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs font-medium text-zinc-500 mt-4 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Demandas fora do escopo exigirão aditivos contratuais.
            </p>
          </div>
        </div>

        {/* FINANCIALS & TERMS */}
        <div className="bg-zinc-50 p-8 lg:p-10 shadow-sm border border-zinc-200/80 h-fit">
          <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-8 tracking-tight">
            Condições Comerciais Acordadas
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-5 border border-zinc-200/60 shadow-sm">
              <p className="text-xxs uppercase tracking-widest text-zinc-400 font-semibold mb-1">Setup / Implantação</p>
              <p className="text-xl font-semibold text-zinc-900">{formatCurrency(contractData?.setup_fee || 0)}</p>
            </div>
            <div className="bg-white p-5 border border-zinc-200/60 shadow-sm">
              <p className="text-xxs uppercase tracking-widest text-zinc-400 font-semibold mb-1">Retainer (Mensal)</p>
              <p className="text-xl font-semibold text-zinc-900">{formatCurrency(contractData?.retainer_fee || 0)}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4 mb-4">
            <span className="text-sm text-zinc-500">Prazo de Vigência:</span>
            <span className="font-semibold text-zinc-900">{contractData?.contract_duration_months || '6'} meses</span>
          </div>
          <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4 mb-10">
            <span className="text-sm text-zinc-500">Data de Vencimento:</span>
            <span className="font-semibold text-zinc-900">Dia {contractData?.payment_day || '05'}</span>
          </div>

          {/* CHECKBOXES INTERATIVOS */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-zinc-900 mb-4">Protocolo de Aceite</p>
            
            <label className={`flex items-start gap-4 p-4 border transition-all cursor-pointer ${chk1 ? 'bg-[#00CC6A]/5 border-[#00CC6A]/30' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
              <div className="mt-0.5">
                <input type="checkbox" className="w-4 h-4 accent-[#00CC6A] shrink-0" checked={chk1} onChange={(e) => setChk1(e.target.checked)} />
              </div>
              <span className={`text-sm leading-relaxed ${chk1 ? 'text-zinc-900 font-medium' : 'text-zinc-600'}`}>
                1. Confirmo a entrega In-Scope e entendo que solicitações fora dessa matriz exigirão aditivos contratuais.
              </span>
            </label>

            <label className={`flex items-start gap-4 p-4 border transition-all cursor-pointer ${chk2 ? 'bg-[#00CC6A]/5 border-[#00CC6A]/30' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
              <div className="mt-0.5">
                <input type="checkbox" className="w-4 h-4 accent-[#00CC6A] shrink-0" checked={chk2} onChange={(e) => setChk2(e.target.checked)} />
              </div>
              <span className={`text-sm leading-relaxed ${chk2 ? 'text-zinc-900 font-medium' : 'text-zinc-600'}`}>
                2. Concordo com as condições comerciais acordadas (Valores, Vigência e Vencimentos).
              </span>
            </label>

            <label className={`flex items-start gap-4 p-4 border transition-all cursor-pointer ${chk3 ? 'bg-[#00CC6A]/5 border-[#00CC6A]/30' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
              <div className="mt-0.5">
                <input type="checkbox" className="w-4 h-4 accent-[#00CC6A] shrink-0" checked={chk3} onChange={(e) => setChk3(e.target.checked)} />
              </div>
              <span className={`text-sm leading-relaxed ${chk3 ? 'text-zinc-900 font-medium' : 'text-zinc-600'}`}>
                3. Ratifico que eu, {contractData?.representative_name || project?.client_name}, respondo legalmente por esta Entidade.
              </span>
            </label>
            
            {/* Status Visual de Travamento */}
            <div className="mt-6 flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${contractAccepted ? 'text-[#00CC6A]' : 'text-zinc-400'}`} />
              <span className={`text-xs font-semibold ${contractAccepted ? 'text-[#00CC6A]' : 'text-zinc-500'}`}>
                {contractAccepted ? 'Ratificação Concluída. Pode Avançar.' : 'Aguardando aceite dos termos.'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
