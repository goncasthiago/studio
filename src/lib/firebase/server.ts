// src/lib/firebase/server.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const apps = getApps();
let app: App | undefined = apps.find(a => a.name === 'admin');

if (!app && serviceAccount) {
  app = initializeApp(
    {
      credential: cert(serviceAccount),
    },
    'admin'
  );
}

const adminAuth = app ? getAuth(app) : undefined;
const adminDb = app ? getFirestore(app) : undefined;

export const auth = (): Auth | undefined => adminAuth;
export const db = (): Firestore | undefined => adminDb;
