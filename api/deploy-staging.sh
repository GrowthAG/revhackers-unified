#!/usr/bin/env bash
# Deploy da API no Cloud Run staging
# Uso: ./api/deploy-staging.sh
set -euo pipefail

PROJECT="revhackers-staging"
REGION="southamerica-east1"
SERVICE="revhackers-api-staging"
IMAGE="southamerica-east1-docker.pkg.dev/${PROJECT}/revhackers-staging/revhackers-api:manual"

echo "==> Deploying ${SERVICE} com imagem ${IMAGE}"

gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --project="${PROJECT}" \
  --region="${REGION}" \
  --platform=managed \
  --no-allow-unauthenticated \
  --service-account="revhackers-api@${PROJECT}.iam.gserviceaccount.com" \
  --add-cloudsql-instances="${PROJECT}:${REGION}:revhackers-staging-pg" \
  --set-env-vars="NODE_ENV=production,SERVICE_NAME=${SERVICE},GOOGLE_CLOUD_PROJECT=${PROJECT}" \
  --set-secrets="DATABASE_URL=cloudsql-connection-string:latest" \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=100 \
  --memory=512Mi \
  --cpu=1 \
  --timeout=60s \
  --quiet 2>&1

echo "==> Deploy concluido."
echo "==> URL: $(gcloud run services describe ${SERVICE} --project=${PROJECT} --region=${REGION} --format='value(status.url)')"
