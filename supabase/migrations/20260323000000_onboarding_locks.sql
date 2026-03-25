-- Migration: Onboarding Dependencies & Golden Key Checkout

ALTER TABLE public.rei_projects 
ADD COLUMN IF NOT EXISTS materials_status varchar(50) DEFAULT 'delivered'::character varying,
ADD COLUMN IF NOT EXISTS materials_delay_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS final_expectations text;

COMMENT ON COLUMN public.rei_projects.materials_status IS 'delivered, pending';
COMMENT ON COLUMN public.rei_projects.materials_delay_accepted IS 'True se o cliente assinou a ciencia do atraso do projeto por falta de material';
COMMENT ON COLUMN public.rei_projects.final_expectations IS 'Pergunta chave de ouro: Omissoes ou expectativas mapeadas no final do kickoff';
