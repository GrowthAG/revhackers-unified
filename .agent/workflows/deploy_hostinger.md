---
description: Deploy completo para Hostinger via FTP (build + prerender + upload paralelo)
---

# Deploy RevHackers → Hostinger

## Credenciais
As credenciais FTP estao no arquivo `.env` do projeto (nunca commitar no git):
- `FTP_HOST`
- `FTP_USER`
- `FTP_PASSWORD`
- Pasta destino: raiz FTP = public_html

## Passos

### 1. Build de produção (Vite + Prerender)
// turbo
```bash
npm run build
```
Aguardar conclusão. O script de prerender gera ~79 rotas estáticas em `dist/`.

### 2. Zipar o dist
// turbo
```bash
cd dist && zip -r ../deploy.zip . -x "*.DS_Store" && cd ..
echo "ZIP: $(du -sh deploy.zip | cut -f1)"
```

### 3. Upload do ZIP para o servidor
// turbo
```bash
curl -T deploy.zip "ftp://$FTP_HOST/deploy.zip" \
  --user "$FTP_USER:$FTP_PASSWORD" \
  --progress-bar
```

### 4. Deploy completo - upload paralelo de todos os arquivos
// turbo
```bash
FTP="ftp://$FTP_HOST"
AUTH="$FTP_USER:$FTP_PASSWORD"
LOCAL="$(pwd)/dist"

echo "🚀 Iniciando deploy de $(find $LOCAL -type f | wc -l) arquivos..."

find "$LOCAL" -type f | xargs -P 8 -I{} bash -c '
  f="{}"
  rel="${f#'"$LOCAL"'/}"
  result=$(curl -s -T "$f" "'"$FTP"'/$rel" --user "'"$AUTH"'" --ftp-create-dirs 2>&1)
  if [ $? -eq 0 ]; then
    echo "✅ $rel"
  else
    echo "❌ ERRO: $rel - $result"
  fi
'

echo "✅ Deploy concluído!"
```

### 5. Verificar no ar
// turbo
```bash
curl -s -o /dev/null -w "%{http_code}" https://revhackers.com.br/
```
Deve retornar `200`.

## Notas
- SSH não disponível externamente na Hostinger (porta 65002 bloqueada para IPs externos)
- FTP root = public_html (sem subdiretório)
- O ZIP fica no servidor mas não é extraído automaticamente (sem PHP habilitado para SPA estático)
- O `xargs -P 8` faz 8 uploads simultaneos - se a Hostinger limitar conexões FTP, reduzir para `-P 4`
