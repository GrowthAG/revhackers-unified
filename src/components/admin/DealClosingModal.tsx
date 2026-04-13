import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileSignature } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  advanceOpportunityStage,
  convertOpportunityToProject,
  updateOpportunity,
} from "@/api/opportunities";
import { getOrCreateProjectChannel, postSystemEvent } from "@/api/hubMessaging";

interface DealClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Opportunity row (from opportunities table) */
  opportunity: any;
  onSuccess: () => void;
}

export function DealClosingModal({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}: DealClosingModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    legal_company_name: "",
    cnpj: "",
    representative_name: "",
    representative_cpf: "",
    contract_duration_months: "6",
    setup_fee: "0",
    retainer_fee: "0",
    payment_day: "5",
  });

  useEffect(() => {
    if (opportunity && isOpen) {
      setFormData((prev) => ({
        ...prev,
        legal_company_name: opportunity.client_company || opportunity.trade_name || "",
        representative_name: opportunity.client_name || "",
        // Pre-fill CNPJ from enrichment if available
        cnpj: opportunity.enrichment_data?.cnpj?.cnpj || opportunity.opportunity_data?.cnpj || "",
      }));
    }
  }, [opportunity, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const existingData = (opportunity?.opportunity_data as Record<string, any>) || {};

      // 1. Salva dados contratuais na oportunidade
      const newOpportunityData = {
        ...existingData,
        contract_data: formData,
      };

      await updateOpportunity(opportunity.id, {
        opportunity_data: newOpportunityData,
      } as any);

      // 2. Avanca para won
      const stageResult = await advanceOpportunityStage(opportunity.id, "won", "Deal fechado via DealClosingModal");
      if (!stageResult.success) throw new Error(stageResult.error);

      // 3. Converte oportunidade em projeto (RPC atomico)
      const { projectId, error: convertErr } = await convertOpportunityToProject(opportunity.id);
      if (convertErr) {
        console.error("[DealClosing] Projeto nao criado:", convertErr);
        // Nao bloqueia - oportunidade ja esta como won
        toast({
          title: "Deal Fechado",
          description: "Oportunidade marcada como ganha. Projeto sera criado manualmente.",
        });
      } else {
        toast({
          title: "Deal Closed!",
          description: `Projeto criado. Iniciando jornada de onboarding.`,
        });
      }

      // Cria canal do projeto no hub e posta evento de abertura
      if (projectId) {
        const channelName = displayName || 'Projeto';
        getOrCreateProjectChannel(projectId, channelName)
          .then(ch => {
            if (ch) {
              postSystemEvent(ch.id, `Deal fechado - Projeto ${channelName} criado. Onboarding iniciado.`).catch(() => {});
            }
          })
          .catch(() => {});
      }

      onSuccess();
      onClose();
      if (projectId) {
        navigate(`/admin/projects/${projectId}/jornada`);
      }
    } catch (err: any) {
      toast({
        title: "Erro ao fechar negocio",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!opportunity) return null;

  const displayName = opportunity.display_name || opportunity.trade_name || opportunity.client_company || opportunity.client_name;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white border-zinc-200 p-0 overflow-hidden shadow-2xl block">

        <div className="p-6 sm:p-8 flex items-start justify-between border-b border-zinc-100">
            <div>
                <DialogTitle className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-zinc-400" />
                    Fechar Negocio (Deal Won)
                </DialogTitle>
                <DialogDescription className="text-zinc-500 mt-2 font-medium max-w-lg leading-relaxed text-sm">
                    Voce esta convertendo <strong className="text-zinc-900 font-semibold">{displayName}</strong> em projeto de execucao.
                    Preencha as variaveis para gerar o contrato dinamico no Kickoff.
                </DialogDescription>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">Entidade Legal</h3>

              <div className="space-y-2">
                <Label htmlFor="legal_company_name" className="text-xs font-bold text-zinc-600">Razao Social</Label>
                <Input
                  id="legal_company_name"
                  name="legal_company_name"
                  required
                  value={formData.legal_company_name}
                  onChange={handleChange}
                  className="rounded-sm border-zinc-200 focus-visible:ring-revgreen h-10 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-xs font-bold text-zinc-600">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  required
                  placeholder="00.000.000/0001-00"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className="rounded-sm border-zinc-200 focus-visible:ring-revgreen h-10 font-bold tracking-wider"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative_name" className="text-xs font-bold text-zinc-600">Representante Legal (Nome)</Label>
                <Input
                  id="representative_name"
                  name="representative_name"
                  required
                  value={formData.representative_name}
                  onChange={handleChange}
                  className="rounded-sm border-zinc-200 focus-visible:ring-revgreen h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative_cpf" className="text-xs font-bold text-zinc-600">CPF do Representante</Label>
                <Input
                  id="representative_cpf"
                  name="representative_cpf"
                  required
                  placeholder="000.000.000-00"
                  value={formData.representative_cpf}
                  onChange={handleChange}
                  className="rounded-sm border-zinc-200 focus-visible:ring-revgreen h-10 font-bold tracking-wider"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">Condicoes Comerciais</h3>

              <div className="space-y-2">
                <Label htmlFor="setup_fee" className="text-xs font-bold text-zinc-600">Valor de Setup (BRL)</Label>
                <Input
                  id="setup_fee"
                  name="setup_fee"
                  type="number"
                  min="0"
                  value={formData.setup_fee}
                  onChange={handleChange}
                  className="rounded-sm border-zinc-200 focus-visible:ring-revgreen h-10 font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retainer_fee" className="text-xs font-bold text-zinc-600">Retainer Mensal (Mensalidade)</Label>
                <Input
                  id="retainer_fee"
                  name="retainer_fee"
                  type="number"
                  min="0"
                  value={formData.retainer_fee}
                  onChange={handleChange}
                  className="rounded-sm border-zinc-200 focus-visible:ring-revgreen h-10 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contract_duration_months" className="text-xs font-bold text-zinc-600">Prazo (Meses)</Label>
                    <select
                        id="contract_duration_months"
                        name="contract_duration_months"
                        value={formData.contract_duration_months}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-revgreen font-medium"
                    >
                        <option value="1">Avulso (1m)</option>
                        <option value="3">Trimestre (3m)</option>
                        <option value="6">Semestre (6m)</option>
                        <option value="12">Anual (12m)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="payment_day" className="text-xs font-bold text-zinc-600">Dia Vencimento</Label>
                    <select
                        id="payment_day"
                        name="payment_day"
                        value={formData.payment_day}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-sm border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-revgreen font-medium"
                    >
                        <option value="5">Dia 05</option>
                        <option value="10">Dia 10</option>
                        <option value="15">Dia 15</option>
                        <option value="20">Dia 20</option>
                        <option value="25">Dia 25</option>
                    </select>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-sm font-bold text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-zinc-800 text-white font-semibold text-sm h-10 px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fechar Negocio & Criar Projeto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
