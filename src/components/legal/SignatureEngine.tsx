import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ShieldCheck, FileCheck2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type ReferenceType = 'proposal' | 'strategic_plan' | 'agent_document';

interface SignatureEngineProps {
  projectId: string;
  referenceType: ReferenceType;
  referenceId: string;
  documentContentToHash: string; // The raw text to hash to ensure integrity
  onSuccess?: (signerData: { name: string; role: string; cpf: string; email: string; hash: string }) => void;
  isOpen?: boolean;
  checkboxText?: string;
}

export const SignatureEngine: React.FC<SignatureEngineProps> = ({
  projectId,
  referenceType,
  referenceId,
  documentContentToHash,
  onSuccess,
  checkboxText = 'Declaro o aceite para darmos início ao faturamento e processo de onboarding descrito nesta página.'
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>('Capturando IP...');

  useEffect(() => {
    // Fetch user IP for legal audit trail
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('IP Indisponível (Bloqueador de Anúncios)'));
  }, []);

  const generateHash = async (text: string) => {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleSign = async () => {
    if (!name || !email) {
      toast.error('Preencha seu nome e e-mail para prosseguir.');
      return;
    }
    if (!termsAccepted) {
      toast.error('Você deve declarar o aceite legal antes de prosseguir.');
      return;
    }

    setIsSigning(true);
    try {
      // 1. Generate the SHA-256 Document Hash based on content + timestamp
      const timestamp = new Date().toISOString();
      const stringToHash = `${documentContentToHash}|${timestamp}|${email}`;
      const documentHash = await generateHash(stringToHash);

      // 2. Persist to Legal Vault (document_signatures) - using defaults for unused fields
      const { error } = await supabase.from('document_signatures').insert({
        project_id: projectId,
        reference_type: referenceType,
        reference_id: referenceId,
        signer_name: name,
        signer_cpf_cnpj: '000.000.000-00', // Default placeholder passed to DB
        signer_email: email,
        signer_role: 'Contratante', // Default placeholder
        signer_ip: ipAddress,
        user_agent: navigator.userAgent,
        document_hash: documentHash
      });

      if (error) throw error;

      setIsSigned(true);
      toast.success('Assinatura Eletrônica Registrada com Sucesso!');
      if (onSuccess) onSuccess({ name, role: 'Contratante', cpf: '000.000.000-00', email, hash: documentHash });

    } catch (err: any) {
      toast.error('Erro ao firmar assinatura: ' + err.message);
    } finally {
      setIsSigning(false);
    }
  };

  if (isSigned) {
    return (
      <div className="bg-green-50/50 border border-green-200 p-8 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-green-100 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-green-900">Acordo Registrado</h3>
          <p className="text-green-700/80 text-sm mt-2">
            O certificado de auditoria (Registro SHA-256) foi gravado.
            <br />
            Prossiga para a etapa de liberação financeira.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 p-6 md:p-8 space-y-6">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <FileCheck2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading text-zinc-900 tracking-tight">Aceite Prévio do Acordo</h3>
          <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Confirme seu nome e e-mail para validar a proposta antes de prosseguirmos para o sistema de pagamento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">Nome Completo</Label>
          <Input placeholder="Ex: João da Silva" value={name} onChange={e => setName(e.target.value)} className="h-12 bg-zinc-50 border-zinc-200" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-zinc-700 uppercase tracking-widest">E-mail Corporativo</Label>
          <Input type="email" placeholder="joao@empresa.com" value={email} onChange={e => setEmail(e.target.value)} className="h-12 bg-zinc-50 border-zinc-200" />
        </div>
      </div>

      <div className="bg-zinc-50 border border-zinc-100 p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="legal-terms" 
            checked={termsAccepted} 
            onCheckedChange={(c) => setTermsAccepted(c as boolean)} 
            className="mt-1 border-zinc-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <Label htmlFor="legal-terms" className="text-xs text-zinc-500 leading-relaxed font-normal cursor-pointer select-none">
            {checkboxText}
          </Label>
        </div>
      </div>

      <Button 
        onClick={handleSign} 
        disabled={isSigning || !termsAccepted || !name || !email}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 text-sm uppercase tracking-widest transition-all shadow-sm shadow-emerald-200"
      >
        {isSigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
        {isSigning ? 'Registrando...' : 'Aceitar Acordo e Avançar'}
      </Button>
    </div>
  );
};
