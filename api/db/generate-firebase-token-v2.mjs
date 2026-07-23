#!/usr/bin/env node
// Gera Firebase ID token via Admin SDK com ADC
// Uso: node generate-firebase-token-v2.mjs [uid]
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

const UID = process.argv[2] ?? 'synthetic-growthmap-e2e';
const PROJECT_ID = 'revhackers-staging';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

if (!FIREBASE_API_KEY) {
  console.error('FIREBASE_API_KEY nao configurada');
  process.exit(1);
}

// Inicializa Firebase Admin com ADC (usa Application Default Credentials renovadas)
const app = initializeApp({
  credential: applicationDefault(),
  projectId: PROJECT_ID,
});

const auth = getAuth(app);

async function main() {
  console.log(`Gerando custom token para UID: ${UID}`);
  
  // Gera custom token (assina com firebase-adminsdk SA via ADC)
  const customToken = await auth.createCustomToken(UID, {
    staging: true,
    role: 'super_admin',
  });
  
  console.log(`Custom token: ${customToken.substring(0, 80)}...`);

  // Troca custom token por ID token via Firebase Auth REST
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );

  if (!res.ok) {
    console.error('Troca falhou:', res.status, await res.text());
    process.exit(1);
  }

  const { idToken, localId, expiresIn } = await res.json();
  
  console.log('\n=== ID TOKEN PARA TESTE ===');
  console.log(`UID Firebase: ${localId}`);
  console.log(`Expira em: ${expiresIn}s`);
  console.log(`\nID Token:\n${idToken}`);
  console.log('\n=== COMANDOS DE TESTE ===');
  console.log(`\n# /v1/me (auto-registro ou leitura):`);
  console.log(`curl -s -H "Authorization: Bearer ${idToken}" \\`);
  console.log(`  https://revhackers-api-staging-3na73syj5a-rj.a.run.app/v1/me | python3 -m json.tool`);
  console.log(`\n# GET growthmap:`);
  console.log(`curl -s -H "Authorization: Bearer ${idToken}" \\`);
  console.log(`  "https://revhackers-api-staging-3na73syj5a-rj.a.run.app/v1/growthmaps/00000000-0000-0000-0000-000000000100" | python3 -m json.tool`);
  
  process.exit(0);
}

main().catch(err => {
  console.error('Erro:', err.message);
  console.error(err.stack);
  process.exit(1);
});
