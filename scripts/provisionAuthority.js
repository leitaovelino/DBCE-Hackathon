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

const args = process.argv.slice(2);
const isCheckMode = args.includes('--check');
const isRevokeMode = args.includes('--revoke');
const targetIdentifier = args.find((a) => !a.startsWith('--'));

if (!targetIdentifier) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Target user email or UID is required.');
  console.log('\nUsage:');
  console.log('  node scripts/provisionAuthority.js <email-or-uid>          # Provision / convert to Authority');
  console.log('  node scripts/provisionAuthority.js --check <email-or-uid>  # Inspect user claims and profile');
  console.log('  node scripts/provisionAuthority.js --revoke <email-or-uid> # Revoke Authority back to Tourist');
  console.log('\nExample:');
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

  // Read existing Firestore Profile
  const userDocRef = db.collection('users').doc(userRecord.uid);
  const userDocSnap = await userDocRef.get();
  const existingProfile = userDocSnap.exists ? userDocSnap.data() : null;

  console.log('\n---------------------------------------------------------');
  console.log(`Found User:       ${userRecord.displayName || existingProfile?.name || 'No Name'} (${userRecord.email})`);
  console.log(`UID:              ${userRecord.uid}`);
  console.log(`Current Claims:   ${JSON.stringify(userRecord.customClaims || {})}`);
  console.log(`Firestore Role:   ${existingProfile ? existingProfile.role : 'No Profile in users/' + userRecord.uid}`);
  console.log('---------------------------------------------------------');

  if (isCheckMode) {
    const isAuthority = userRecord.customClaims?.role === 'authority';
    console.log(`\nVerification Result:`);
    console.log(`  Custom Claim 'authority': ${isAuthority ? '✓ YES (Verified)' : '✗ NO'}`);
    console.log(`  Firestore Role:           ${existingProfile?.role || 'None'}`);
    if (isAuthority && existingProfile?.role === 'authority') {
      console.log('\x1b[32m%s\x1b[0m', '  Status: FULLY PROVISIONED AS TOURISM AUTHORITY');
    } else if (existingProfile?.role === 'business_owner') {
      console.log('\x1b[33m%s\x1b[0m', '  Status: REGISTERED AS BUSINESS OWNER (Not Authority)');
    } else {
      console.log('\x1b[34m%s\x1b[0m', '  Status: STANDARD USER / TOURIST');
    }
    console.log('');
    return;
  }

  if (isRevokeMode) {
    console.log('Revoking Authority privileges...');
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'tourist',
      authorityRevokedAt: new Date().toISOString()
    });

    await userDocRef.set({
      role: 'tourist',
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('\x1b[33m%s\x1b[0m', '\n✓ SUCCESS: Authority Custom Claim revoked. Role set back to tourist.');
    return;
  }

  // 1. Assign cryptographically verified Custom Claim on Firebase Auth
  console.log('Assigning Firebase Custom Claim: { role: "authority" } ...');
  await auth.setCustomUserClaims(userRecord.uid, {
    role: 'authority',
    authorityAssignedAt: new Date().toISOString()
  });

  // 2. Synchronize Firestore user document (role & updatedAt)
  console.log('Synchronizing Firestore document users/' + userRecord.uid + ' ...');
  const profilePayload = {
    uid: userRecord.uid,
    email: userRecord.email,
    name: userRecord.displayName || existingProfile?.name || (userRecord.email ? userRecord.email.split('@')[0] : 'Authority Official'),
    role: 'authority',
    updatedAt: FieldValue.serverTimestamp()
  };
  if (!existingProfile?.createdAt) {
    profilePayload.createdAt = FieldValue.serverTimestamp();
  }

  await userDocRef.set(profilePayload, { merge: true });

  console.log('\x1b[32m%s\x1b[0m', '\n✓ SUCCESS: Authority Custom Claim successfully provisioned!');
  console.log('  Assigned Role: authority');
  console.log('  Updated Document: users/' + userRecord.uid);
  console.log('\nImportant Token Refresh Instruction:');
  console.log('Because Firebase ID tokens are cached on the client for up to 1 hour,');
  console.log('the official must either:');
  console.log('  1. Sign out and sign back in, OR');
  console.log('  2. Click "Sync Claims" in their User Profile or Access Guard in the app.');
  console.log('---------------------------------------------------------\n');
}

provisionAuthority()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during provisioning:', err);
    process.exit(1);
  });
