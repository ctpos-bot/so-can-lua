import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyCrOMYHc7SUR2rjMHBRsLf77jJJbBRi_V0',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'so-can-lua-e2dbf.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'so-can-lua-e2dbf',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'so-can-lua-e2dbf.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '233557268633',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:233557268633:web:b201c39ee1dba3fa50c008',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<User> {
  if (!auth) {
    throw new Error('Chưa cấu hình Firebase cho ứng dụng.');
  }

  if (Capacitor.isNativePlatform()) {
    const nativeRes = await FirebaseAuthentication.signInWithGoogle();
    const idToken = nativeRes.credential?.idToken;
    if (!idToken) {
      throw new Error(
        'Không lấy được mã xác thực Google trên APK. Hãy kiểm tra file google-services.json.'
      );
    }
    const cred = GoogleAuthProvider.credential(idToken);
    const userCred = await signInWithCredential(auth, cred);
    return userCred.user;
  }

  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutGoogle(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await FirebaseAuthentication.signOut().catch(() => {});
  }
  if (!auth) return;
  await signOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { auth, db };
