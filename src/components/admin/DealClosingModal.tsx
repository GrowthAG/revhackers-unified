import { useState, useEffect } from "react";
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
import { advanceStage } from "@/services/PipelineService";

interface DealClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSuccess: () => void;
}

export function DealClosingModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: DealClosingModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    if (project && isOpen) {
      setFormData((prev) => ({
        ...prev,
        legal_company_name: project.client_company || "",
        representative_name: project.client_name || "",
      }));
    }
  }, [project, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get current opportunity data
      const { data: projData, error: projError } = await supabase
        .from("rei_projects")
        .select("opportunity_data")
        .eq("id", project.id)
        .single();

      if (projError) throw projError;

      const existingData = (projData?.opportunity_data as Record<string, any>) || {};
      
      // Armazenando no JSONB exatamente as variáveis para o Dynamic Legal Engine
      const newOpportunityData = {
        ...existingData,
        contract_data: formData,
      };

      // 2. Patch do Banco de Dados
      const { error: updateError } = await supabase
        .from("rei_projects")
        .update({ opportunity_data: newOpportunityData })
        .eq("id", project.id);

      if (updateError) throw updateError;

      // 3. Força o avanço para a coluna Won do Pipeline
      const result = await advanceStage(project.id, "won");
      if (!result.success) throw new Error(result.error);

      toast({
        title: "Deal Closed! 🏆",
        description: "Contrato gerado dinamicamente no Kickoff. Cliente ativado.",
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Erro ao fechar negócio",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white border-zinc-200 p-0 overflow-hidden shadow-2xl block">
        
        {/* Header Elegante Minalista */}
        <div className="p-6 sm:p-8 flex items-start justify-between border-b border-zinc-100">
            <div>
                <DialogTitle className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-zinc-400" />
                    Gerar Contrato (Deal Won)
                </DialogTitle>
                <DialogDescription className="text-zinc-500 mt-2 font-medium max-w-lg leading-relaxed text-sm">
                    Você está movendo <strong className="text-zinc-900 font-semibold">{project.display_name}</strong> para Execução. 
                    Preencha as variáveis abaixo para gerar o Master Services Agreement dinâmico no Kickoff.
                </DialogDescription>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bloco Jurídico Legal */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">Entidade Legal</h3>
              
              <div className="space-y-2">
                <Label htmlFor="legal_company_name" className="text-xs font-bold text-zinc-600">Razão Social</Label>
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

            {/* Bloco Comercial & Financeiro */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2">Condições Comerciais</h3>

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
              className="bg-black hover:bg-zinc-800 text-white rounded-md font-semibold text-sm h-10 px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gerar Contrato & Ativar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
