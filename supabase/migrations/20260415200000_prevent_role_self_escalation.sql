-- Seguranca: impede que usuarios nao-super_admin modifiquem a coluna role em profiles.
-- Trigger BEFORE UPDATE que bloqueia mudancas de role a menos que:
--   (a) o chamador seja super_admin (via JWT autenticado), OU
--   (b) a chamada venha de service_role (backend/edge functions com SERVICE_ROLE_KEY).
--
-- Camada defensiva em profundidade: mesmo que uma edge function seja comprometida
-- ou exposta sem validacao, o update direto via PostgREST API continua bloqueado.

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Nada a validar se role nao esta mudando.
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- service_role (backend Supabase) bypassa intencionalmente.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Chamador autenticado: precisa ser super_admin em profiles.
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF caller_role IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Apenas super_admin pode modificar a coluna role. Caller role: %',
      COALESCE(caller_role, 'anon')
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_prevent_role_self_escalation ON public.profiles;

CREATE TRIGGER tr_prevent_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

COMMENT ON FUNCTION public.prevent_role_self_escalation() IS
  'Bloqueia mutacao de role em profiles por nao-super_admin. service_role bypassa para fluxos administrativos.';
