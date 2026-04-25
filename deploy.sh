#!/bin/bash
source .env

export FTP="ftp://$FTP_HOST"
export AUTH="$FTP_USER:$FTP_PASSWORD"
export LOCAL="$(pwd)/dist"

echo "🚀 Iniciando deploy de $(find "$LOCAL" -type f | wc -l) arquivos..."

chmod +x upload_worker.sh
find "$LOCAL" -type f | xargs -P 8 -I{} ./upload_worker.sh "{}"

echo "✅ Deploy concluído!"
