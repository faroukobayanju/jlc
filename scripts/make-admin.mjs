// Grant store admin rights to an existing Firebase Auth user.
// Usage: npm run make-admin -- you@example.com
// Needs FIREBASE_SERVICE_ACCOUNT_BASE64 in the environment or in .env.local.
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const email = process.argv[2];
if (!email) { console.error('Usage: npm run make-admin -- you@example.com'); process.exit(1); }
const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (!encoded) { console.error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. See SETUP.md step 2.'); process.exit(1); }

const app = initializeApp({ credential: cert(JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))) });
const user = await getAuth(app).getUserByEmail(email).catch(() => null);
if (!user) { console.error(`No Firebase Auth user with email ${email}. Sign up in Firebase Authentication first.`); process.exit(1); }

await getFirestore(app).collection('admins').doc(user.uid).set({ email, addedAt: FieldValue.serverTimestamp() }, { merge: true });
console.log(`${email} (uid ${user.uid}) is now an admin. Sign out and back in on /admin.`);
