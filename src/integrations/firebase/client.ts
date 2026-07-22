import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

function required(name: string, value: string | undefined): string {
  if (!value?.trim()) throw new Error(`${name} não configurada.`);
  return value.trim();
}

let app: FirebaseApp | null = null;

export function getFirebaseAuth(): Auth {
  if (!app) {
    app = getApps()[0] ?? initializeApp({
      apiKey: required('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
      authDomain: required('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
      projectId: required('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
    });
  }
  return getAuth(app);
}

export async function requireGoogleIdToken(): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Sessão Google ausente. Faça login novamente.');
  return user.getIdToken();
}

export async function signInWithGooglePopup(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return (await signInWithPopup(getFirebaseAuth(), provider)).user;
}

export function observeGoogleAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signOutGoogle(): Promise<void> {
  await signOut(getFirebaseAuth());
}
