-- Criação da Tabela de Auditoria de Assinaturas (O Cofre Legal)
CREATE TABLE public.document_signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.rei_projects(id) ON DELETE CASCADE,
    reference_type TEXT NOT NULL, -- Opções: 'proposal', 'strategic_plan', 'agent_document'
    reference_id UUID NOT NULL,
    signer_name TEXT NOT NULL,
    signer_cpf_cnpj TEXT NOT NULL,
    signer_email TEXT NOT NULL,
    signer_role TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    signer_ip TEXT,
    user_agent TEXT,
    document_hash TEXT NOT NULL,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Segurança RLS
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" 
ON public.document_signatures FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for anonymous users" 
ON public.document_signatures FOR INSERT WITH CHECK (true);
