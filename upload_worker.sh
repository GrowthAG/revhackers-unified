#!/bin/sh

printf '%s\n' '{"ok":false,"code":"LEGACY_FTP_DEPLOY_DISABLED","entrypoint":"upload_worker.sh","reason":"GCP_MIGRATION_IN_PROGRESS"}' >&2
exit 1
