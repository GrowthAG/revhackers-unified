import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Play, X, Loader2, RefreshCw } from 'lucide-react';
import FrameworkCard from '@/components/growthmap/FrameworkCard';
import REIBridge from '@/components/growthmap/REIBridge';
import {
  generateFramework,
  getGrowthMap,
  saveFrameworkResult,
  buildInitialState,
  FRAMEWORK_CATALOG,
} from '@/api/growthmap';
import type { FrameworkResult, GrowthMapState } from '@/types/growthmap';

// ─── Types ────────────────────────────────────────────────────────────────────
type PillarKey = 'inteligencia_estrategica' | 'concepcao_valor' | 'mvp_validacao' | 'escalabilidade';

const PILLAR_META: Record<PillarKey, { label: string; description: string }> = {
  inteligencia_estrategica: { label: 'Inteligência Estratégica', description: 'Mercado, concorrência e posicionamento' },
  concepcao_valor:          { label: 'Concepção de Valor',       description: 'ICP, jornada, proposta e diferenciais' },
  mvp_validacao:            { label: 'MVP & Validação',           description: 'Modelo de negócio enxuto e priorização' },
  escalabilidade:           { label: 'Escalabilidade',           description: 'Crescimento, canais e métricas de tração' },
};

// ─── Framework data renderers ─────────────────────────────────────────────────
function FrameworkDataView({ fw }: { fw: FrameworkResult }) {
  const d = fw.data;

  if (fw.id === 'aarrr' && d) {
    const stages = ['aquisicao', 'ativacao', 'retencao', 'receita', 'referencia', 'reativacao'] as const;
    const colors = [
      { bg: 'bg-violet-400/5', border: 'border-violet-400/20', text: 'text-violet-400' },
      { bg: 'bg-blue-400/5',   border: 'border-blue-400/20',   text: 'text-blue-400'   },
      { bg: 'bg-teal-400/5',   border: 'border-teal-400/20',   text: 'text-teal-400'   },
      { bg: 'bg-emerald-400/5',border: 'border-emerald-400/20',text: 'text-emerald-400' },
      { bg: 'bg-lime-400/5',   border: 'border-lime-400/20',   text: 'text-lime-400'   },
      { bg: 'bg-orange-400/5', border: 'border-orange-400/20', text: 'text-orange-400' },
    ];
    const statusBadge: Record<string, string> = {
      critico: 'bg-red-400/20 text-red-400',
      alerta:  'bg-yellow-400/20 text-yellow-400',
      ok:      'bg-emerald-400/20 text-emerald-400',
      meta:    'bg-zinc-700 text-zinc-400',
    };
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {stages.map((stage, i) => {
          const s = d[stage];
          if (!s) return null;
          const c = colors[i];
          return (
            <div key={stage} className={`shrink-0 w-44 rounded-xl p-4 border ${c.border} ${c.bg}`}>
              <div className={`text-3xl font-black mb-1 ${c.text}`}>{stage.charAt(0).toUpperCase()}</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-2">{stage}</div>
              <div className="mb-2">
                <div className="text-[10px] text-zinc-500 uppercase">Métrica</div>
                <div className="text-xs text-zinc-300 line-clamp-2">{s.metric}</div>
              </div>
              <div className="mb-2">
                <div className="text-[10px] text-zinc-500 uppercase">Atual / Meta</div>
                <div className="text-sm font-semibold text-white">{s.current_value ?? '—'} / {s.meta}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${statusBadge[s.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                {s.status}
              </span>
              <div className="mt-3 space-y-1">
                {(s.tactics ?? []).slice(0, 3).map((t: string, j: number) => (
                  <div key={j} className="text-[10px] text-zinc-400 leading-tight">• {t}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (fw.id === 'swot' && d) {
    const quads = [
      { key: 'forcas',      label: 'Forças',       cls: 'bg-emerald-400/5 border-emerald-400/20' },
      { key: 'fraquezas',   label: 'Fraquezas',    cls: 'bg-red-400/5 border-red-400/20' },
      { key: 'oportunidades',label:'Oportunidades', cls: 'bg-blue-400/5 border-blue-400/20' },
      { key: 'ameacas',     label: 'Ameaças',      cls: 'bg-yellow-400/5 border-yellow-400/20' },
    ];
    return (
      <div className="grid grid-cols-2 gap-4">
        {quads.map(({ key, label, cls }) => (
          <div key={key} className={`p-4 rounded-xl border ${cls}`}>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">{label}</h4>
            <ul className="space-y-2">
              {(d[key] ?? []).map((item: any, i: number) => (
                <li key={i} className="text-sm text-zinc-300 flex gap-2">
                  <span className="opacity-40 shrink-0">•</span> {item.text ?? item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (fw.id === 'north_star' && d) {
    return (
      <div className="text-center">
        <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-2">North Star Metric</div>
        <div className="text-5xl font-black text-lime-400 mb-4 leading-tight">{d.metric_name}</div>
        {d.current_value && d.target_value && (
          <div className="flex items-center justify-center gap-4 mb-4">
            <div><div className="text-xs text-zinc-500">Atual</div><div className="text-xl font-bold text-zinc-300">{d.current_value}</div></div>
            <div className="text-zinc-600">→</div>
            <div><div className="text-xs text-zinc-500">Meta</div><div className="text-xl font-bold text-lime-400">{d.target_value}</div></div>
          </div>
        )}
        <p className="text-zinc-400 max-w-xl mx-auto text-sm mb-8 leading-relaxed">{d.description}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          {(d.leading_indicators ?? []).map((ind: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-left max-w-52">
              <div className="text-sm font-bold text-white mb-1">{ind.label}</div>
              <div className="text-xs text-zinc-400 leading-relaxed">{ind.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fw.id === 'tam_sam_som' && d) {
    return (
      <div className="flex gap-4">
        {(['tam', 'sam', 'som'] as const).map(k => {
          const item = d[k];
          if (!item) return null;
          return (
            <div key={k} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{k}</div>
              <div className={`text-3xl font-black mb-2 ${k === 'tam' ? 'text-zinc-300' : 'text-lime-400'}`}>{item.label}</div>
              <div className="text-xs text-zinc-400 leading-relaxed">{item.description}</div>
            </div>
          );
        })}
      </div>
    );
  }

  if (fw.id === 'pestel' && d) {
    const factors = ['politico','economico','social','tecnologico','ambiental','legal'] as const;
    const colors = ['text-blue-400','text-emerald-400','text-yellow-400','text-violet-400','text-teal-400','text-orange-400'];
    return (
      <div className="grid grid-cols-2 gap-4">
        {factors.map((f, i) => (
          <div key={f} className="bg-white/5 border border-white/7 rounded-xl p-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${colors[i]}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</h4>
            <ul className="space-y-1">
              {(d[f]?.bullets ?? []).map((b: string, j: number) => (
                <li key={j} className="text-xs text-zinc-400 flex gap-2"><span className="opacity-40 shrink-0">•</span>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (fw.id === 'porter_5_forces' && d) {
    const forces = [
      { key: 'rivalidade', label: 'Rivalidade' },
      { key: 'novos_entrantes', label: 'Novos Entrantes' },
      { key: 'substitutos', label: 'Substitutos' },
      { key: 'fornecedores', label: 'Fornecedores' },
      { key: 'compradores', label: 'Compradores' },
    ];
    const levelColor: Record<string, string> = { baixo: 'text-emerald-400', medio: 'text-yellow-400', alto: 'text-red-400' };
    return (
      <div className="space-y-3">
        {forces.map(({ key, label }) => {
          const f = d[key];
          if (!f) return null;
          return (
            <div key={key} className="flex items-start gap-4 bg-white/5 border border-white/7 rounded-xl p-4">
              <div className="shrink-0 w-24 text-right">
                <div className="text-xs text-zinc-500">{label}</div>
                <div className={`text-sm font-bold uppercase ${levelColor[f.level] ?? 'text-zinc-400'}`}>{f.level}</div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
            </div>
          );
        })}
      </div>
    );
  }

  if (fw.id === 'usp' && d) {
    return (
      <div className="space-y-6">
        <blockquote className="bg-lime-400/5 border border-lime-400/20 rounded-xl p-6 text-lg font-semibold text-white leading-relaxed italic">
          "{d.statement}"
        </blockquote>
        <div className="grid grid-cols-2 gap-4">
          {(d.pillars ?? []).map((p: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/7 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
              <p className="text-xs text-zinc-400 mb-2">{p.description}</p>
              <ul className="space-y-1">
                {(p.bullets ?? []).map((b: string, j: number) => (
                  <li key={j} className="text-xs text-zinc-400">• {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fw.id === 'ice_score' && d) {
    const priorityColor: Record<string, string> = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-zinc-400' };
    return (
      <div className="space-y-3">
        {(d.initiatives ?? []).map((init: any, i: number) => (
          <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/7 rounded-xl p-4">
            <div className="shrink-0 text-center w-14">
              <div className="text-2xl font-black text-lime-400">{init.score?.toFixed(1)}</div>
              <div className="text-[10px] text-zinc-500">ICE</div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{init.name}</div>
              <div className="flex gap-3 mt-1">
                <span className="text-[10px] text-zinc-500">I:{init.impact}</span>
                <span className="text-[10px] text-zinc-500">C:{init.confidence}</span>
                <span className="text-[10px] text-zinc-500">E:{init.ease}</span>
              </div>
            </div>
            <span className={`text-xs font-bold uppercase ${priorityColor[init.priority] ?? 'text-zinc-400'}`}>{init.priority}</span>
          </div>
        ))}
      </div>
    );
  }

  // Default: formatted JSON
  return (
    <pre className="text-xs bg-black/40 p-4 rounded-xl overflow-x-auto text-zinc-300 border border-white/7 leading-relaxed">
      {JSON.stringify(d, null, 2)}
    </pre>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GrowthMap() {
  const { projectId } = useParams<{ projectId: string }>();
  const [gState, setGState] = useState<GrowthMapState>(
    buildInitialState(projectId ?? 'demo', 'Carregando...', '')
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ── Load existing data ──────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (!projectId) { setLoaded(true); return; }
      const data = await getGrowthMap(projectId);
      if (data) {
        setGState(data);
      } else {
        setGState(buildInitialState(projectId, 'Empresa', ''));
      }
      setLoaded(true);
    }
    load();
  }, [projectId]);

  // ── Generate single framework ───────────────────────────────────────────────
  const handleGenerate = useCallback(async (id: string) => {
    setGState(prev => ({
      ...prev,
      frameworks: { ...prev.frameworks, [id]: { ...prev.frameworks[id], status: 'generating' } },
    }));

    try {
      const result = await generateFramework({
        project_id: gState.project_id,
        framework_id: id,
        rei_responses: {},
        company_name: gState.company_name,
        company_description: gState.company_description,
      });

      setGState(prev => ({
        ...prev,
        frameworks: { ...prev.frameworks, [id]: result },
      }));

      await saveFrameworkResult(gState.project_id, result);
    } catch (err) {
      console.error('[GrowthMap] generateFramework error:', err);
      setGState(prev => ({
        ...prev,
        frameworks: { ...prev.frameworks, [id]: { ...prev.frameworks[id], status: 'error' } },
      }));
    }
  }, [gState]);

  // ── Generate all (sequential, throttled) ────────────────────────────────────
  const handleGenerateAll = useCallback(async () => {
    setIsGeneratingAll(true);
    for (const f of FRAMEWORK_CATALOG) {
      if (gState.frameworks[f.id]?.status !== 'done') {
        await handleGenerate(f.id);
        await new Promise(r => setTimeout(r, 800)); // throttle between calls
      }
    }
    setIsGeneratingAll(false);
  }, [gState, handleGenerate]);

  const selectedFw = selectedId
    ? (gState.frameworks[selectedId] ?? FRAMEWORK_CATALOG.find(f => f.id === selectedId) as unknown as FrameworkResult)
    : null;

  const tamData = gState.frameworks['tam_sam_som'];
  const showStats = tamData?.status === 'done' && tamData?.data;

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080810]">
        <Loader2 size={32} className="animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#080810] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 bg-[#111118] border-r border-white/5 flex flex-col z-20">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <span className="text-xl font-bold tracking-tighter">
            Rev<span className="text-lime-400">Hackers</span>
          </span>
        </div>

        {/* Company pill */}
        <div className="px-4 mb-6">
          <div className="bg-lime-400/10 border border-lime-400/30 rounded-lg px-3 py-2 text-lime-400 text-sm font-medium truncate text-center">
            {gState.company_name}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {/* REI Score */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
            <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
            <span className="text-sm font-medium">REI Score</span>
          </div>

          {/* GrowthMap — active */}
          <div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-lime-400/10 text-lime-400">
              <div className="w-2 h-2 rounded-full bg-lime-400 shrink-0" />
              <span className="text-sm font-semibold">GrowthMap</span>
            </div>
            <div className="pl-8 mt-1 space-y-0.5">
              {(Object.entries(PILLAR_META) as [PillarKey, { label: string; description: string }][]).map(([key, meta]) => (
                <div key={key} className="text-sm text-zinc-400 hover:text-white py-1 cursor-pointer transition-colors px-2 rounded">
                  {meta.label}
                </div>
              ))}
            </div>
          </div>

          {/* Execution Engine */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
            <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
            <span className="text-sm font-medium">Execution Engine</span>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3 mt-auto">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 shrink-0" />
          <div className="text-sm font-medium text-zinc-300 truncate">Usuário</div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-start sticky top-0 bg-[#080810]/90 backdrop-blur-sm z-10">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-lime-400 uppercase mb-1">GrowthMap</div>
            <h1 className="text-3xl font-bold text-white leading-tight">{gState.company_name}</h1>
            <p className="text-sm text-zinc-400 mt-1">Análise estratégica gerada por IA · {FRAMEWORK_CATALOG.length} frameworks disponíveis</p>
          </div>
          <button
            onClick={handleGenerateAll}
            disabled={isGeneratingAll}
            className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0 mt-1"
          >
            {isGeneratingAll
              ? <><Loader2 size={16} className="animate-spin" /> Gerando...</>
              : <><Play size={16} /> Gerar análise completa</>
            }
          </button>
        </div>

        {/* Quick stats — TAM/SAM/SOM */}
        {showStats && (
          <div className="px-8 py-5 bg-[#0d0d14] border-b border-white/5">
            <div className="flex gap-10">
              {(['tam', 'sam', 'som'] as const).map((k, i) => {
                const item = tamData.data?.[k];
                if (!item) return null;
                return (
                  <div key={k} className={i > 0 ? 'border-l border-white/5 pl-10' : ''}>
                    <div className="text-2xl font-black text-lime-400">{item.label}</div>
                    <div className="text-xs text-zinc-400 mt-1">{k.toUpperCase()} · {item.description?.split(' ').slice(0, 5).join(' ')}...</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pillar sections */}
        <div className="px-8 py-8 space-y-12">
          {(Object.entries(PILLAR_META) as [PillarKey, { label: string; description: string }][]).map(([pillarKey, meta]) => {
            const pillarFws = FRAMEWORK_CATALOG.filter(f => f.pillar === pillarKey);
            return (
              <section key={pillarKey}>
                {/* Pillar header */}
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-sm font-bold text-zinc-200 tracking-widest uppercase">{meta.label}</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">{meta.description}</p>
                  </div>
                  <div className="flex-1 h-px bg-white/5" />
                  <div className="text-xs text-zinc-600">{pillarFws.length} frameworks</div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  {pillarFws.map(fw => {
                    const fwState: FrameworkResult = gState.frameworks[fw.id] ?? {
                      id: fw.id, pillar: fw.pillar, title: fw.title, subtitle: fw.subtitle, status: 'pending',
                    };
                    return (
                      <FrameworkCard
                        key={fw.id}
                        framework={fwState}
                        onRegenerate={() => handleGenerate(fw.id)}
                        onClick={() => setSelectedId(fw.id)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* ── Drawer overlay ───────────────────────────────────────────────────── */}
      {selectedId && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSelectedId(null)}
        />
      )}

      {/* ── Drawer ───────────────────────────────────────────────────────────── */}
      <div className={[
        'fixed right-0 top-0 h-full w-[48%] bg-[#0e0e18] border-l border-white/7 z-50 flex flex-col shadow-2xl',
        'transform transition-transform duration-300',
        selectedId ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}>
        {selectedFw && (
          <>
            {/* Drawer header */}
            <div className="p-6 border-b border-white/7 flex justify-between items-start shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] uppercase font-bold text-lime-400 border border-lime-400/30 px-2 py-0.5 rounded-full bg-lime-400/5 inline-block mb-3">
                  {PILLAR_META[(selectedFw.pillar as PillarKey)]?.label ?? selectedFw.pillar}
                </span>
                <h2 className="text-2xl font-bold text-white leading-tight">{selectedFw.title}</h2>
                <p className="text-sm text-zinc-400 mt-1">{selectedFw.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleGenerate(selectedFw.id)}
                  disabled={selectedFw.status === 'generating'}
                  className="px-3 py-1.5 border border-lime-400/30 text-lime-400 text-sm font-medium rounded-lg hover:bg-lime-400/10 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw size={13} /> Regenerar
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Breadcrumb */}
              <div className="text-xs text-zinc-600">
                GrowthMap <span className="text-zinc-700">›</span>{' '}
                {PILLAR_META[(selectedFw.pillar as PillarKey)]?.label ?? selectedFw.pillar}{' '}
                <span className="text-zinc-700">›</span>{' '}
                <span className="text-zinc-400">{selectedFw.title}</span>
              </div>

              {/* Content */}
              {selectedFw.status === 'generating' ? (
                <div className="h-64 flex flex-col items-center justify-center bg-[#13131e] rounded-xl border border-white/7 text-zinc-500">
                  <Loader2 size={32} className="animate-spin text-lime-400 mb-4" />
                  <p className="text-sm">A IA está analisando os dados...</p>
                </div>
              ) : selectedFw.status === 'done' && selectedFw.data ? (
                <div className="bg-[#13131e] border border-white/7 rounded-xl p-6">
                  <FrameworkDataView fw={selectedFw} />
                </div>
              ) : selectedFw.status === 'error' ? (
                <div className="h-48 flex flex-col items-center justify-center bg-red-400/5 border border-red-400/20 rounded-xl text-red-400">
                  <p className="text-sm font-medium mb-3">Erro ao gerar esta análise.</p>
                  <button
                    onClick={() => handleGenerate(selectedFw.id)}
                    className="px-4 py-2 bg-red-400/10 border border-red-400/30 text-red-400 text-sm rounded-lg hover:bg-red-400/20 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center bg-[#13131e] border border-dashed border-white/10 rounded-xl text-zinc-500">
                  <p className="text-sm mb-4">Nenhuma análise gerada ainda.</p>
                  <button
                    onClick={() => handleGenerate(selectedFw.id)}
                    className="px-4 py-2 bg-lime-400/10 border border-lime-400/30 text-lime-400 text-sm font-medium rounded-lg hover:bg-lime-400/20 transition-colors"
                  >
                    Gerar análise
                  </button>
                </div>
              )}

              {/* REI Bridge */}
              <REIBridge
                connections={selectedFw.rei_connections ?? []}
                actions={selectedFw.generated_actions}
                onAddToSprint={() => {
                  // TODO: integrate with sprint/execution engine
                  alert('Ações adicionadas ao Sprint! (integração com Execution Engine em breve)');
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
