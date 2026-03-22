#!/bin/bash
# =============================================================================
# validate.sh - Testa fill-rei-from-transcript em staging/producao
#
# Uso:
#   chmod +x validate.sh
#   SUPABASE_URL=https://xxx.supabase.co \
#   SERVICE_KEY=eyJhbGc... \
#   RECORDING_ID=uuid-da-gravacao \
#   PROJECT_ID=uuid-do-projeto \
#   ./validate.sh
#
# O que este script valida:
#   1. A funcao responde (200 ou erro com mensagem clara)
#   2. O numero de campos extraidos (fieldsPopulated)
#   3. Quais campos foram preenchidos (fieldsExtracted)
#   4. O rei_response foi atualizado no banco
# =============================================================================

set -e

SUPABASE_URL="${SUPABASE_URL:-}"
SERVICE_KEY="${SERVICE_KEY:-}"
RECORDING_ID="${RECORDING_ID:-}"
PROJECT_ID="${PROJECT_ID:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ] || [ -z "$RECORDING_ID" ]; then
  echo "ERRO: Defina SUPABASE_URL, SERVICE_KEY e RECORDING_ID"
  exit 1
fi

FUNCTION_URL="${SUPABASE_URL}/functions/v1/fill-rei-from-transcript"

echo ""
echo "=== VALIDANDO fill-rei-from-transcript ==="
echo "URL:         $FUNCTION_URL"
echo "Recording:   $RECORDING_ID"
echo "Project:     ${PROJECT_ID:-'(sera detectado pelo recording)'}"
echo ""

# Monta o body
BODY="{\"recordingId\": \"${RECORDING_ID}\""
if [ -n "$PROJECT_ID" ]; then
  BODY="${BODY}, \"projectId\": \"${PROJECT_ID}\""
fi
BODY="${BODY}}"

echo "Body: $BODY"
echo ""

# Chama a funcao
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "$BODY")

HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo "HTTP Status: $HTTP_CODE"
echo "Response:    $HTTP_BODY"
echo ""

# Parse resultado
SUCCESS=$(echo "$HTTP_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" 2>/dev/null || echo "parse_error")
FIELDS=$(echo "$HTTP_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('fieldsPopulated',0))" 2>/dev/null || echo "0")
EXTRACTED=$(echo "$HTTP_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(', '.join(d.get('fieldsExtracted',[])))" 2>/dev/null || echo "")

echo "=== RESULTADO ==="
if [ "$HTTP_CODE" = "200" ] && [ "$SUCCESS" = "True" ]; then
  echo "STATUS:  OK"
  echo "Campos preenchidos: $FIELDS"
  if [ -n "$EXTRACTED" ]; then
    echo "Campos: $EXTRACTED"
  fi
else
  echo "STATUS:  FALHOU"
  ERROR=$(echo "$HTTP_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error','unknown'))" 2>/dev/null || echo "unknown")
  echo "Erro: $ERROR"
fi
echo ""

# Verifica no banco se rei_responses foi atualizado
if [ -n "$PROJECT_ID" ] && [ "$SUCCESS" = "True" ]; then
  echo "=== VERIFICANDO BANCO ==="
  DB_RESPONSE=$(curl -s \
    "${SUPABASE_URL}/rest/v1/rei_responses?project_id=eq.${PROJECT_ID}&select=id,responses,updated_at&order=created_at.desc&limit=1" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY")

  echo "rei_responses entry:"
  echo "$DB_RESPONSE" | python3 -c "
import sys,json
data = json.load(sys.stdin)
if data:
    r = data[0]
    print(f'  id:         {r.get(\"id\")}')
    fd = r.get('responses',{}).get('form_data',{})
    print(f'  form_data campos preenchidos: {len([v for v in fd.values() if v])}')
    autofill = r.get('responses',{}).get('transcript_autofill_at')
    print(f'  autofill_at: {autofill}')
else:
    print('  NENHUM RESULTADO')
" 2>/dev/null || echo "$DB_RESPONSE"
fi

echo ""
echo "=== VALIDACAO CONCLUIDA ==="
