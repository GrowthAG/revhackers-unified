-- Migration: Seed GHL sub-account location IDs into organizations
-- Purpose: Enable multi-tenant webhook routing between GHL and RevHackers Hub
-- Each organization.settings.ghl_location_id maps to a GHL sub-account

-- ============================================================================
-- 1. REVHACKERS (agency's own sub-account)
-- ============================================================================

INSERT INTO public.organizations (name, slug, is_master, status, plan, settings)
VALUES (
    'RevHackers',
    'revhackers',
    true,
    'active',
    'scale',
    jsonb_build_object(
        'ghl_location_id', 'oFTw9DcsKRUj6xCiq4mb',
        'ghl_webhooks', '{}'::jsonb
    )
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'oFTw9DcsKRUj6xCiq4mb');

-- ============================================================================
-- 2. ACTIVE CLIENT SUB-ACCOUNTS
-- ============================================================================

-- Tunad (active consulting project)
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'Tunad',
    'tunad',
    'active',
    'starter',
    jsonb_build_object('ghl_location_id', 'Xdt5yiC9wXJ7A1WmlVbr', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'Xdt5yiC9wXJ7A1WmlVbr');

-- Arquiter (active consulting project)
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'Arquiter',
    'arquiter',
    'active',
    'starter',
    jsonb_build_object('ghl_location_id', 'MmKg4PFIbHzg1S6lBXIl', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'MmKg4PFIbHzg1S6lBXIl');

-- aTip's Account
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'aTip', 'atip', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'MOciOxNQNHXDDjRhb1x9', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'MOciOxNQNHXDDjRhb1x9');

-- Atomic Mentoring
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'Atomic Mentoring', 'atomic-mentoring', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'a4RMWYveBfsBhxSJTtcd', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'a4RMWYveBfsBhxSJTtcd');

-- Blue Forecast
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'Blue Forecast', 'blue-forecast', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'VJyLFjPJ2kcsyZLWmq0F', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'VJyLFjPJ2kcsyZLWmq0F');

-- Caravelas Editora
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'Caravelas Editora', 'caravelas-editora', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'ak1gDrP455wy1qAJzTfD', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'ak1gDrP455wy1qAJzTfD');

-- CRM HUB
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'CRM HUB', 'crm-hub', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'TlRX3meDdDBHMY4fJNpw', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'TlRX3meDdDBHMY4fJNpw');

-- FM Escritorio
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'FM Escritorio', 'fm-escritorio', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'H3mhRBo4efdb4JPoelIk', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'H3mhRBo4efdb4JPoelIk');

-- Growth Team
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'Growth Team', 'growth-team', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'PEGllUuZPdrrxDU3HV2D', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'PEGllUuZPdrrxDU3HV2D');

-- ImunizaPro
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'ImunizaPro', 'imunizapro', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'RrZBVqHGDqhowGRZYQXN', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'RrZBVqHGDqhowGRZYQXN');

-- Italinea R&M Planejados
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'Italinea R&M Planejados', 'italinea', 'active', 'starter',
    jsonb_build_object('ghl_location_id', '876eDfokoiXJgXDvUPW9', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', '876eDfokoiXJgXDvUPW9');

-- RevTECH
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'RevTECH', 'revtech', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'm9h2mhns9tzxRSwBCohZ', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'm9h2mhns9tzxRSwBCohZ');

-- RevueAcademy
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'RevueAcademy', 'revue-academy', 'active', 'starter',
    jsonb_build_object('ghl_location_id', '876Ucnr8qm6lnMFORzxG', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', '876Ucnr8qm6lnMFORzxG');

-- Veridiana Lopes
INSERT INTO public.organizations (name, slug, status, plan, settings)
VALUES (
    'Veridiana Lopes', 'veridiana-lopes', 'active', 'starter',
    jsonb_build_object('ghl_location_id', 'kIBHPyc3tG8MnXFL9x6c', 'ghl_webhooks', '{}'::jsonb)
)
ON CONFLICT (slug) DO UPDATE SET
    settings = COALESCE(organizations.settings, '{}'::jsonb)
        || jsonb_build_object('ghl_location_id', 'kIBHPyc3tG8MnXFL9x6c');

-- ============================================================================
-- 3. SET parent_id FOR ALL CLIENT ORGS (RevHackers as parent agency)
-- ============================================================================

UPDATE public.organizations
SET parent_id = (SELECT id FROM public.organizations WHERE slug = 'revhackers' LIMIT 1)
WHERE slug != 'revhackers'
  AND settings->>'ghl_location_id' IS NOT NULL
  AND parent_id IS NULL;

-- ============================================================================
-- 4. INDEX FOR FAST LOCATION LOOKUP
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_organizations_ghl_location_id
    ON public.organizations ((settings->>'ghl_location_id'));
