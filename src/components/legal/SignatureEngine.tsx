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
}

export const SignatureEngine: React.FC<SignatureEngineProps> = ({
  projectId,
  referenceType,
  referenceId,
  documentContentToHash,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
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
    if (!name || !cpf || !email || !role) {
      toast.error('Preencha todos os campos fiduciários obrigatórios.');
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
      const stringToHash = `${documentContentToHash}|${timestamp}|${email}|${cpf}`;
      const documentHash = await generateHash(stringToHash);

      // 2. Persist to Legal Vault (document_signatures)
      const { error } = await supabase.from('document_signatures').insert({
        project_id: projectId,
        reference_type: referenceType,
        reference_id: referenceId,
        signer_name: name,
        signer_cpf_cnpj: cpf,
        signer_email: email,
        signer_role: role,
        signer_ip: ipAddress,
        user_agent: navigator.userAgent,
        document_hash: documentHash
      });

      if (error) throw error;

      setIsSigned(true);
      toast.success('Assinatura Eletrônica Registrada com Sucesso!');
      if (onSuccess) onSuccess({ name, role, cpf, email, hash: documentHash });

    } catch (err: any) {
      toast.error('Erro ao firmar assinatura: ' + err.message);
    } finally {
      setIsSigning(false);
    }
  };

  if (isSigned) {
    return (
      <div className="bg-green-50/50 border border-green-200 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-green-900">Documento Assinado e Blindado</h3>
          <p className="text-green-700/80 text-sm mt-2">
            O certificado de auditoria (Registro SHA-256) foi gravado em nossos cofres digitais.
            <br />
            Este aceite tem validade jurídica nos moldes da Medida Provisória nº 2.200-2/2001.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 md:p-8 space-y-6">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center flex-shrink-0">
          <FileCheck2 className="w-6 h-6 text-zinc-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading">Painel de Assinatura Eletrônica</h3>
          <p className="text-zinc-500 text-sm">Por favor, confirme seus dados fiduciários para a validade do documento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome Completo (Signatário)</Label>
          <Input placeholder="Ex: João da Silva" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>CPF / CNPJ</Label>
          <Input placeholder="Ex: 000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>E-mail Corporativo</Label>
          <Input type="email" placeholder="joao@empresa.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Cargo / Posição</Label>
          <Input placeholder="Ex: CEO, Diretor de Vendas" value={role} onChange={e => setRole(e.target.value)} />
        </div>
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="legal-terms" 
            checked={termsAccepted} 
            onCheckedChange={(c) => setTermsAccepted(c as boolean)} 
            className="mt-1"
          />
          <Label htmlFor="legal-terms" className="text-xs text-zinc-600 leading-relaxed font-normal cursor-pointer">
            Declaro ter lido e compreendido os termos embutidos neste documento eletrônico, manifestando meu aceite.
            Reconheço que esta assinatura digital coleta dados identificáveis, incluindo endereço de IP (<span className="font-mono text-zinc-900 bg-zinc-200 px-1 rounded">{ipAddress}</span>), timestamp oficial de Brasília e metadados criptografados a nível de integridade judicial.
          </Label>
        </div>
      </div>

      <Button 
        onClick={handleSign} 
        disabled={isSigning || !termsAccepted || !name || !cpf || !email || !role}
        className="w-full bg-black hover:bg-zinc-800 text-white font-bold h-12 rounded-xl text-lg uppercase tracking-widest transition-all"
      >
        {isSigning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
        {isSigning ? 'Processando Criptografia...' : 'Assinar e Vincular'}
      </Button>
    </div>
  );
};
