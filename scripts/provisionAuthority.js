/**
 * GoaSmart Platform - Authority Custom Claims Provisioning Script
 * 
 * Usage:
 *   node scripts/provisionAuthority.js <user-email-or-uid>
 * 
 * Requirements:
 *   1. Download your Firebase Admin Service Account Key from Firebase Console:
 *      Project Settings -> Service Accounts -> Generate new private key.
 *   2. Save the file as 'serviceAccountKey.json' in the project root OR set
 *      GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json" in your environment.
 * 
 * Note:
 *   Authority privileges CANNOT be assigned from client-side Firestore writes
 *   or frontend registration. This script uses the privileged Firebase Admin SDK
 *   to cryptographically stamp 'role: "authority"' onto the user's Auth token.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const targetIdentifier = process.argv[2];

if (!targetIdentifier) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Target user email or UID is required.');
  console.log('\nUsage:');
  console.log('  node scripts/provisionAuthority.js <email-or-uid>');
  console.log('Example:');
  console.log('  node scripts/provisionAuthority.js official@goa.gov.in\n');
  process.exit(1);
}

// Locate service account credentials
const defaultKeyPath = resolve(process.cwd(), 'serviceAccountKey.json');
let credential = null;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  console.log(`Using credentials from GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  const serviceAccount = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  credential = cert(serviceAccount);
} else if (existsSync(defaultKeyPath)) {
  console.log(`Using credentials from local file: ${defaultKeyPath}`);
  const serviceAccount = JSON.parse(readFileSync(defaultKeyPath, 'utf8'));
  credential = cert(serviceAccount);
} else {
  console.error('\x1b[31m%s\x1b[0m', 'Error: No Firebase Admin service account key found.');
  console.log('\nTo configure:');
  console.log('1. Go to Firebase Console -> Project Settings -> Service accounts.');
  console.log('2. Click "Generate new private key" and download the JSON file.');
  console.log('3. Save it as "serviceAccountKey.json" in this directory, or set GOOGLE_APPLICATION_CREDENTIALS.\n');
  process.exit(1);
}

// Initialize Firebase Admin
let app;
try {
  app = getApps().length ? getApps()[0] : initializeApp({ credential });
} catch (e) {
  console.error('Failed to initialize Firebase Admin SDK:', e.message);
  process.exit(1);
}

async function provisionAuthority() {
  const auth = getAuth(app);
  const db = getFirestore(app);

  let userRecord;
  try {
    if (targetIdentifier.includes('@')) {
      userRecord = await auth.getUserByEmail(targetIdentifier);
    } else {
      userRecord = await auth.getUser(targetIdentifier);
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Failed to find user "${targetIdentifier}": ${error.message}`);
    process.exit(1);
  }

  console.log('\n---------------------------------------------------------');
  console.log(`Found User: ${userRecord.displayName || 'No Name'} (${userRecord.email})`);
  console.log(`UID:        ${userRecord.uid}`);
  console.log('---------------------------------------------------------');

  // 1. Assign cryptographically verified Custom Claim on Firebase Auth
  console.log('Setting Firebase Custom Claim: { role: "authority" } ...');
  await auth.setCustomUserClaims(userRecord.uid, {
    role: 'authority',
    authorityAssignedAt: new Date().toISOString()
  });

  // 2. Synchronize Firestore user document (role & updatedAt)
  console.log('Synchronizing Firestore document users/' + userRecord.uid + ' ...');
  const userDocRef = db.collection('users').doc(userRecord.uid);
  await userDocRef.set({
    uid: userRecord.uid,
    email: userRecord.email,
    role: 'authority',
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  console.log('\x1b[32m%s\x1b[0m', '\n✓ SUCCESS: Authority Custom Claim successfully provisioned!');
  console.log('\nImportant Token Refresh Instruction:');
  console.log('Because Firebase ID tokens are cached on the client for up to 1 hour,');
  console.log('the official must either:');
  console.log('  1. Sign out and sign back in, OR');
  console.log('  2. In the GoaSmart web app, the AuthContext automatically force-refreshes the token.');
  console.log('---------------------------------------------------------\n');
}

provisionAuthority()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during provisioning:', err);
    process.exit(1);
  });
