#!/bin/bash
f="$1"
rel="${f#$LOCAL/}"
result=$(curl -s -T "$f" "$FTP/$rel" --user "$AUTH" --ftp-create-dirs 2>&1)
if [ $? -eq 0 ]; then
  echo "✅ $rel"
else
  echo "❌ ERRO: $rel - $result"
fi
