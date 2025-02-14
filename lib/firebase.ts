import { initializeApp, getApps } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache,
  persistentSingleTabManager,
  type PersistentSingleTabManagerSettings 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "scio-sprints.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: "scio-sprints.appspot.com",
  messagingSenderId: "651646895309",
  appId: "1:651646895309:web:8bc2782642be4b3bd91584",
  measurementId: "G-6VBNYM9M6L"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with persistence settings
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({
      forceOwnership: true
    } as PersistentSingleTabManagerSettings),
    cacheSizeBytes: 100 * 1024 * 1024 // 100MB cache size
  })
});

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics in client side only
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { db, analytics, auth };
