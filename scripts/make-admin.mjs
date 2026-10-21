// Grant store admin rights to an existing Firebase Auth user.
// Usage: npm run make-admin -- you@example.com path/to/service-account.json
//    or: npm run make-admin -- you@example.com   (uses FIREBASE_SERVICE_ACCOUNT_BASE64 from the environment or .env.local)
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const [email, keyPath] = process.argv.slice(2);
if (!email || !email.includes('@')) {
  console.error('Usage: npm run make-admin -- you@example.com path/to/service-account.json');
  process.exit(1);
}

function loadServiceAccount() {
  const raw = keyPath
    ? readFileSync(keyPath, 'utf8')
    : Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString('utf8');
  try {
    const sa = JSON.parse(raw);
    if (sa.type === 'service_account' && sa.private_key) return sa;
  } catch { /* reported below */ }
  console.error(keyPath
    ? `${keyPath} is not a Firebase service account JSON file.`
    : 'FIREBASE_SERVICE_ACCOUNT_BASE64 is missing or is not base64 of the service account JSON. Pass the JSON file path instead.');
  process.exit(1);
}

const app = initializeApp({ credential: cert(loadServiceAccount()) });
const user = await getAuth(app).getUserByEmail(email).catch(() => null);
if (!user) { console.error(`No Firebase Auth user with email ${email}.`); process.exit(1); }

await getFirestore(app).collection('admins').doc(user.uid).set({ email, addedAt: FieldValue.serverTimestamp() }, { merge: true });
console.log(`${email} (uid ${user.uid}) is now an admin. Sign out and back in on /admin.`);
