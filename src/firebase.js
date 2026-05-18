import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBls7oYHjyenuDaCualyB4QfqqJ6W5MlxM",
  authDomain: "jay-lip-care-ed4d1.firebaseapp.com",
  projectId: "jay-lip-care-ed4d1",
  storageBucket: "jay-lip-care-ed4d1.firebasestorage.app",
  messagingSenderId: "269875639157",
  appId: "1:269875639157:web:0dca53b1ad40ceb639d93c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  experimentalForceLongPolling: true,   // avoids QUIC / WebChannel errors on some networks
  useFetchStreams: false,
});

