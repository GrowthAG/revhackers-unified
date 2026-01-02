-- Migration: Create RPC for Public Diagnostic Submission
-- Purpose: Allow public (anon) and authenticated users to submit diagnostics securely bypassing RLS
-- Date: 2025-01-02

CREATE OR REPLACE FUNCTION create_diagnostic_entry(
    p_lead_name TEXT,
    p_lead_email TEXT,
    p_lead_company TEXT,
    p_responses JSONB,
    p_score INTEGER,
    p_maturity_level TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (super admin)
AS $$
DECLARE
    v_project_id UUID;
    v_response_id UUID;
    v_next_date TIMESTAMP WITH TIME ZONE;
    v_current_year INTEGER;
BEGIN
    v_next_date := NOW() + INTERVAL '1 year';
    v_current_year := EXTRACT(YEAR FROM NOW())::INTEGER;

    -- 1. Insert Project
    INSERT INTO public.rei_projects (
        client_name, 
        client_email, 
        client_company, 
        analyst_email, 
        next_rei_date, 
        quarter, 
        year, 
        status
    ) VALUES (
        p_lead_name, 
        p_lead_email, 
        p_lead_company,
        'giulliano@revhackers.com.br', 
        v_next_date, 
        'Q1', 
        v_current_year, 
        'active'
    ) RETURNING id INTO v_project_id;

    -- 2. Insert Response
    INSERT INTO public.rei_responses (
        project_id, 
        responses, 
        total_score, 
        maturity_level, 
        maturity_percentage, 
        context, 
        source, 
        score_version
    ) VALUES (
        v_project_id, 
        p_responses, 
        p_score, 
        p_maturity_level, 
        p_score, -- Using score as percentage for now
        'lead_gen', 
        'diagnostic', 
        'v1.0'
    ) RETURNING id INTO v_response_id;

    -- Return IDs
    RETURN jsonb_build_object('project_id', v_project_id, 'response_id', v_response_id);
END;
$$;

-- Grant execute permissions to everyone (public/anon)
GRANT EXECUTE ON FUNCTION create_diagnostic_entry TO anon, authenticated, service_role;
