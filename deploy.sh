#!/bin/bash
LOCAL="$1"
FTP="$2"
AUTH="$3"
f="$4"
rel="${f#$LOCAL/}"
result=$(curl -m 30 -s -T "$f" "$FTP/$rel" --user "$AUTH" --ftp-create-dirs 2>&1)
if [ $? -eq 0 ]; then
  echo "✅ $rel"
else
  echo "❌ ERRO: $rel - $result"
fi
