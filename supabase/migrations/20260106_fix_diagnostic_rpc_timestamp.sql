-- Migration: Fix Diagnostic RPC to explicitly set completed_at
-- Purpose: Ensure alignment with Internal Wizard by explicitly setting timestamp, avoiding reliance on DEFAULT values that might be missing in prod.

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
SECURITY DEFINER
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

    -- 2. Insert Response (Explicitly setting completed_at)
    INSERT INTO public.rei_responses (
        project_id, 
        responses, 
        total_score, 
        maturity_level, 
        maturity_percentage, 
        context, 
        source, 
        score_version,
        completed_at  -- <--- FIXED: Added explicit column
    ) VALUES (
        v_project_id, 
        p_responses, 
        p_score, 
        p_maturity_level, 
        p_score, 
        'lead_gen', 
        'diagnostic', 
        'v1.0',
        NOW()  -- <--- FIXED: Explicit timestamp
    ) RETURNING id INTO v_response_id;

    -- Return IDs
    RETURN jsonb_build_object('project_id', v_project_id, 'response_id', v_response_id);
END;
$$;
