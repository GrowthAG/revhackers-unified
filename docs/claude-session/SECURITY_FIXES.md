# 🔒 Correções de Segurança - Implementação

**Data:** 2026-04-03  
**Prioridade:** CRÍTICA  
**Tempo:** 2-3 horas

---

## 🔴 FIX #1: Service Key Exposure (CRÍTICO)

### Problema
Service role key exposta em logs do trigger

### Solução
Usar variável de ambiente configurada no Supabase, não passar explicitamente

### Implementação

**Arquivo:** `supabase/migrations/20260403000000_auto_handoff_trigger.sql`

```sql
-- ADICIONAR antes do trigger function

-- Função auxiliar para pegar URL sem expor key
CREATE OR REPLACE FUNCTION public.get_edge_function_url()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  RETURN current_setting('app.supabase_url', true) || '/functions/v1/auto-handoff';
END;
$;

-- MODIFICAR o trigger function

CREATE OR REPLACE FUNCTION public.auto_handoff_on_won()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
    v_function_url TEXT;
    v_service_key TEXT;
BEGIN
    IF NEW.pipeline_stage = 'won' AND (OLD.pipeline_stage IS NULL OR OLD.pipeline_stage != 'won') THEN
        
        IF NEW.won_at IS NULL THEN
            NEW.won_at := now();
        END IF;

        -- Get URL from secure function
        v_function_url := get_edge_function_url();
        
        -- Get service key (não loga)
        v_service_key := current_setting('app.supabase_service_role_key', true);

        -- Call Edge Function
        PERFORM net.http_post(
            url := v_function_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || v_service_key
            ),
            body := jsonb_build_object(
                'opportunity_id', NEW.id,
                'analyst_email', NEW.analyst_email,
                'won_at', NEW.won_at
            )
        );

        -- Log SEM dados sensíveis
        RAISE NOTICE 'Auto handoff triggered for opportunity (ID hidden for security)';
    END IF;

    RETURN NEW;
END;
$;
```

---

## 🔴 FIX #2: Input Validation (CRÍTICO)

### Problema
Edge Function não valida inputs

### Solução
Adicionar validação rigorosa de UUID e email

### Implementação

**Arquivo:** `supabase/functions/auto-handoff/index.ts`

```typescript
// ADICIONAR no início do arquivo, após imports

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface ValidationError {
  field: string;
  message: string;
}

const validatePayload = (payload: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate opportunity_id
  if (!payload.opportunity_id) {
    errors.push({ field: "opportunity_id", message: "Required field" });
  } else if (typeof payload.opportunity_id !== "string") {
    errors.push({ field: "opportunity_id", message: "Must be a string" });
  } else if (!UUID_REGEX.test(payload.opportunity_id)) {
    errors.push({ field: "opportunity_id", message: "Invalid UUID format" });
  }

  // Validate analyst_email (optional but must be valid if provided)
  if (payload.analyst_email) {
    if (typeof payload.analyst_email !== "string") {
      errors.push({ field: "analyst_email", message: "Must be a string" });
    } else if (!EMAIL_REGEX.test(payload.analyst_email)) {
      errors.push({ field: "analyst_email", message: "Invalid email format" });
    } else if (payload.analyst_email.length > 255) {
      errors.push({ field: "analyst_email", message: "Email too long (max 255 chars)" });
    }
  }

  // Validate won_at (optional but must be valid if provided)
  if (payload.won_at) {
    if (typeof payload.won_at !== "string") {
      errors.push({ field: "won_at", message: "Must be a string" });
    } else {
      const date = new Date(payload.won_at);
      if (isNaN(date.getTime())) {
        errors.push({ field: "won_at", message: "Invalid date format" });
      }
    }
  }

  return errors;
};

const escapeHTML = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ============================================================================
// MODIFICAR serve() function
// ============================================================================

serve(async (req: Request) => {
  try {
    // CORS headers
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    let payload: any;
    try {
      payload = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON payload",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate payload
    const validationErrors = validatePayload(payload);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Validation failed",
          details: validationErrors,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { opportunity_id, analyst_email } = payload as HandoffPayload;

    // Log sem dados sensíveis
    console.log(`[auto-handoff] Processing opportunity (ID hidden)`);

    // ... resto do código continua igual
    
  } catch (error) {
    console.error("[auto-handoff] Fatal error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
```

---

## ⚠️ FIX #3: XSS em Emails (ALTA)

### Problema
Dados não sanitizados nos email templates

### Solução
Usar `escapeHTML()` em todos os outputs

### Implementação

**Arquivo:** `supabase/functions/auto-handoff/index.ts`

```typescript
// MODIFICAR getWelcomeEmailHTML

const getWelcomeEmailHTML = (clientName: string, analystEmail: string, projectType: string): string => {
  // Sanitizar todos os inputs
  const safeName = escapeHTML(clientName);
  const safeEmail = escapeHTML(analystEmail);
  const safeType = escapeHTML(projectType);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #18181b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { background: #18181b; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { background: white; padding: 40px; border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 12px 12px; }
    .accent { color: #00CC6A; font-weight: 900; }
    .button { display: inline-block; background: #00CC6A; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { text-align: center; margin-top: 40px; color: #71717a; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px; font-weight: 900;">BEM-VINDO À REVHACKERS</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${safeName}</strong>,</p>
      
      <p>É com grande satisfação que damos as boas-vindas à <span class="accent">RevHackers Growth Hub</span>!</p>
      
      <p>Seu projeto de <strong>${safeType}</strong> foi oficialmente iniciado e já está em nossa plataforma de gestão.</p>
      
      <h3 style="color: #18181b; font-weight: 900;">PRÓXIMOS PASSOS</h3>
      <ul>
        <li><strong>Analista Responsável:</strong> ${safeEmail}</li>
        <li><strong>Kickoff:</strong> Agendado para os próximos 7 dias</li>
        <li><strong>Portal do Cliente:</strong> Acesse para acompanhar tudo em tempo real</li>
      </ul>
      
      <a href="https://revhackers.com.br/client/hub" class="button">ACESSAR MEU HUB</a>
      
      <p>Estamos animados para trabalhar com você e entregar resultados excepcionais!</p>
      
      <p style="margin-top: 30px;">
        <strong>Time RevHackers</strong><br>
        <span style="color: #71717a;">Revenue Operations & Growth</span>
      </p>
    </div>
    <div class="footer">
      <p>RevHackers Growth Hub | revhackers.com.br</p>
    </div>
  </div>
</body>
</html>
  `;
};

// MODIFICAR getAnalystNotificationHTML da mesma forma
const getAnalystNotificationHTML = (
  clientName: string,
  clientEmail: string,
  projectType: string,
  projectId: string
): string => {
  // Sanitizar todos os inputs
  const safeName = escapeHTML(clientName);
  const safeEmail = escapeHTML(clientEmail);
  const safeType = escapeHTML(projectType);
  const safeId = escapeHTML(projectId);
  
  // ... resto do template com variáveis sanitizadas
};
```

---

## ⚠️ FIX #4: SQL Injection (ALTA)

### Problema
Concatenação de string em INTERVAL

### Solução
Usar `make_interval()` function

### Implementação

**Arquivo:** `supabase/migrations/20260403000000_auto_handoff_trigger.sql`

```sql
-- MODIFICAR a seção de criação de sprints

-- ANTES (Vulnerável)
INSERT INTO public.orqflow_sprints (
    project_id,
    name,
    start_date,
    end_date,
    status
) VALUES (
    v_project_id,
    'Sprint ' || LPAD(i::TEXT, 2, '0'),
    v_sprint_start_date,
    v_sprint_start_date + (v_sprint_duration || ' days')::INTERVAL,  -- VULNERÁVEL
    CASE WHEN i = 1 THEN 'planned' ELSE 'planned' END
);

-- DEPOIS (Seguro)
INSERT INTO public.orqflow_sprints (
    project_id,
    name,
    start_date,
    end_date,
    status
) VALUES (
    v_project_id,
    'Sprint ' || LPAD(i::TEXT, 2, '0'),
    v_sprint_start_date,
    v_sprint_start_date + make_interval(days => v_sprint_duration),  -- SEGURO
    CASE WHEN i = 1 THEN 'planned' ELSE 'planned' END
);

-- E também modificar a linha de incremento
-- ANTES
v_sprint_start_date := v_sprint_start_date + (v_sprint_duration || ' days')::INTERVAL;

-- DEPOIS
v_sprint_start_date := v_sprint_start_date + make_interval(days => v_sprint_duration);
```

---

## 📋 CHECKLIST DE APLICAÇÃO

### Passo 1: Aplicar Fixes SQL

- [ ] Abrir `supabase/migrations/20260403000000_auto_handoff_trigger.sql`
- [ ] Aplicar Fix #1 (Service Key)
- [ ] Aplicar Fix #4 (SQL Injection)
- [ ] Salvar arquivo

### Passo 2: Aplicar Fixes TypeScript

- [ ] Abrir `supabase/functions/auto-handoff/index.ts`
- [ ] Aplicar Fix #2 (Input Validation)
- [ ] Aplicar Fix #3 (XSS)
- [ ] Salvar arquivo

### Passo 3: Testar

- [ ] Executar `test_handoff.sql`
- [ ] Verificar logs (não deve ter service key)
- [ ] Testar com UUID inválido (deve retornar 400)
- [ ] Testar com email inválido (deve retornar 400)
- [ ] Verificar emails (HTML deve estar escapado)

### Passo 4: Deploy

- [ ] `supabase db push`
- [ ] `supabase functions deploy auto-handoff`
- [ ] Validar em produção

---

## ⏱️ TEMPO ESTIMADO

- Fix #1: 30 minutos
- Fix #2: 1 hora
- Fix #3: 30 minutos
- Fix #4: 15 minutos
- Testes: 45 minutos

**Total:** 3 horas

---

**Criado por:** Kiro (AI)  
**Data:** 2026-04-03  
**Status:** Pronto para aplicar
