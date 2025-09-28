// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth as getClientAuth, connectAuthEmulator } from 'firebase/auth';
//import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';


const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
  measurementId: '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,

};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getClientAuth(app);
//const functions: Functions = getFunctions(app);

// O IF É EXATAMENTE O MESMO
//if (process.env.NODE_ENV === 'development') {
//  console.log("🔥 Ambiente de DEV: Conectando aos Emuladores do Firebase...");
  
  // Verifique as portas no seu terminal se forem diferentes
//  connectAuthEmulator(auth, "http://127.0.0.1:9099");
//  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  //connectFunctionsEmulator(functions, "127.0.0.1", 5001);
//}

//export { db, auth, functions };
export { db, auth};
