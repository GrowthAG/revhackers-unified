#!/usr/bin/env node
// Gera Firebase custom token usando IAM Credentials API (SignJWT) + troca por ID token
// Requer: iam.serviceAccounts.signJwt na SA firebase-adminsdk
// Uso: FIREBASE_API_KEY=xxx node generate-firebase-token-v3.mjs [uid]
import { GoogleAuth } from 'google-auth-library';

const UID = process.argv[2] ?? 'synthetic-growthmap-e2e';
const PROJECT_ID = 'revhackers-staging';
const SA = `firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com`;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const API_URL = process.env.GCP_API_URL ?? 'https://revhackers-api-staging-254666331430.southamerica-east1.run.app';

if (!FIREBASE_API_KEY) { console.error('Falta FIREBASE_API_KEY'); process.exit(1); }

async function main() {
  // 1. Pega access token do ADC (giulliano@usefunnels.io)
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();

  // 2. Monta JWT claims para Firebase custom token
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: SA,
    sub: SA,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid: UID,
    claims: { staging: true },
  })).toString('base64url');
  const toSign = `${header}.${payload}`;

  // 3. SignJWT via IAM Credentials API (diferente de SignBlob)
  const signRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SA}:signJwt`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: JSON.stringify({
        iss: SA,
        sub: SA,
        aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
        iat: now,
        exp: now + 3600,
        uid: UID,
        claims: { staging: true },
      }) }),
    }
  );

  if (!signRes.ok) {
    const err = await signRes.text();
    console.error('SignJWT falhou:', signRes.status, err);
    process.exit(1);
  }

  const { signedJwt: customToken } = await signRes.json();
  console.log(`Custom token gerado (${UID}): ${customToken.substring(0, 60)}...`);

  // 4. Troca custom token por ID token via Firebase Auth REST
  const exchRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );

  if (!exchRes.ok) {
    const err = await exchRes.text();
    console.error('Troca de token falhou:', exchRes.status, err);
    process.exit(1);
  }

  const { idToken, localId, expiresIn } = await exchRes.json();
  console.log(`\nUID Firebase: ${localId}`);
  console.log(`Expira em: ${expiresIn}s`);
  console.log(`\n=== COMANDOS DE TESTE ===`);
  console.log(`\n# 1. /v1/me`);
  console.log(`curl -s -H "Authorization: Bearer ${idToken}" ${API_URL}/v1/me | python3 -m json.tool`);
  console.log(`\n# 2. GET growthmap`);
  console.log(`curl -s -H "Authorization: Bearer ${idToken}" "${API_URL}/v1/growthmaps/00000000-0000-0000-0000-000000000100" | python3 -m json.tool`);
  console.log(`\n# 3. PUT growthmap`);
  console.log(`curl -s -X PUT -H "Authorization: Bearer ${idToken}" -H "Content-Type: application/json" -H "Idempotency-Key: test-$(date +%s)" -d '{"companyName":"Acme","companyDescription":"Test","reiScore":7.5,"growthmapScore":6.0,"reiConnectionsCount":3,"frameworks":{"test":{"id":"test","name":"Test"}},"generatedAt":"2026-07-22T18:00:00Z"}' "${API_URL}/v1/growthmaps/00000000-0000-0000-0000-000000000100" | python3 -m json.tool`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
