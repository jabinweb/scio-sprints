import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentSingleTabManager,
  type PersistentSingleTabManagerSettings,
  type Firestore 
} from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let analytics: Analytics | null = null;

// Only initialize Firebase on the client side
if (typeof window !== 'undefined') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "scio-sprints.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: "scio-sprints.appspot.com",
    messagingSenderId: "651646895309",
    appId: "1:651646895309:web:8bc2782642be4b3bd91584",
    measurementId: "G-6VBNYM9M6L"
  };

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager({
        forceOwnership: true
      } as PersistentSingleTabManagerSettings),
      cacheSizeBytes: 100 * 1024 * 1024 // 100MB cache size
    })
  });

  auth = getAuth(app);

  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { db, analytics, auth };
