import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
  throw new Error('Firebase admin credentials are missing');
}

const apps = getApps();
const firebaseAdmin = apps.length === 0 
  ? initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    })
  : apps[0];

const adminAuth = getAuth(firebaseAdmin);
const adminDb = getFirestore(firebaseAdmin);

export { adminAuth, adminDb };
