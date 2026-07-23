#!/usr/bin/env node
// Gera um Firebase custom token e o troca por um ID token real
// Usa o ADC local para autenticar como firebase-adminsdk
// Uso: node generate-firebase-token.mjs [subject]
import { GoogleAuth } from 'google-auth-library';

const SUBJECT = process.argv[2] ?? 'synthetic-growthmap-e2e';
const PROJECT_ID = 'revhackers-staging';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const SA = `firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com`;

if (!FIREBASE_API_KEY) {
  console.error('FIREBASE_API_KEY nao configurada');
  process.exit(1);
}

async function main() {
  // 1. Gera custom token via Firebase Auth REST + impersonation da SA
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/identitytoolkit'],
    impersonatedServiceAccount: SA,
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // 2. Troca o access token por um custom token Firebase
  // (Firebase Admin SDK internamente: POST /identitytoolkit/v3.1/accounts:signInWithCustomToken)
  // Alternativa: usa o endpoint de impersonation do IAM para assinar JWT

  // Gera JWT claims para custom token Firebase
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: SA,
    sub: SA,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid: SUBJECT,
  };

  // Assina o JWT via IAM SignBlob (usando ADC local com permissao iam.serviceAccounts.signBlob)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const unsigned = `${header}.${payload}`;

  const signResponse = await fetch(
    `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts/${SA}:signBlob`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bytesToSign: Buffer.from(unsigned).toString('base64') }),
    }
  );

  if (!signResponse.ok) {
    const err = await signResponse.text();
    console.error('SignBlob falhou:', signResponse.status, err);
    process.exit(1);
  }

  const { signedBlob } = await signResponse.json();
  const signature = Buffer.from(signedBlob, 'base64').toString('base64url');
  const customToken = `${unsigned}.${signature}`;

  console.log('Custom Token gerado:', customToken.substring(0, 80) + '...');

  // 3. Troca custom token por ID token via Firebase Auth REST
  const exchangeResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );

  if (!exchangeResponse.ok) {
    const err = await exchangeResponse.text();
    console.error('Troca de token falhou:', exchangeResponse.status, err);
    process.exit(1);
  }

  const { idToken, localId } = await exchangeResponse.json();
  console.log('\n=== TOKEN PARA TESTE ===');
  console.log(`UID Firebase: ${localId}`);
  console.log(`ID Token: ${idToken}`);
  console.log('\nComando de teste:');
  console.log(`curl -H "Authorization: Bearer ${idToken}" \\`);
  console.log(`  https://revhackers-api-staging-3na73syj5a-rj.a.run.app/v1/me`);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
