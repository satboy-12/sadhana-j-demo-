// Canonical Firebase exports live in ./firebase/firebase (Cloud Firestore + Authentication).
// Re-export here so all imports share the single initialized Firebase App, Auth, and Firestore instance.
export {
  app,
  auth,
  db,
  firestore,
  googleProvider,
  storage,
  firebaseConfig,
  testConnection,
} from './firebase/firebase';
