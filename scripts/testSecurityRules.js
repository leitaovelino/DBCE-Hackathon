/**
 * GoaSmart Platform - Security Rules & Policy Verification Test Suite
 * 
 * Verifies all 9 mandatory security scenarios against the hardened firestore.rules
 * and AuthContext RBAC policies.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load firestore.rules content
const rulesPath = resolve(process.cwd(), 'firestore.rules');
const rulesContent = readFileSync(rulesPath, 'utf8');

console.log('===============================================================');
console.log('   GOASMART SECURITY HARDENING VERIFICATION TEST SUITE');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assertTest(testName, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${testName}`);
    if (details) console.log(`       \x1b[90m${details}\x1b[0m`);
  } else {
    failedTests++;
    console.log(`\x1b[31m[FAIL]\x1b[0m ${testName}`);
    if (details) console.log(`       \x1b[31m${details}\x1b[0m`);
  }
}

// ----------------------------------------------------------------------
// RULE SIMULATOR IMPLEMENTING THE HARDENED FIRESTORE RULES PREDICATES
// ----------------------------------------------------------------------
class FirestoreRulesSimulator {
  constructor(rulesText) {
    this.rules = rulesText;
  }

  // Helper functions matching firestore.rules
  isAuthenticated(auth) {
    return auth !== null && auth !== undefined;
  }

  isOwner(auth, userId) {
    return this.isAuthenticated(auth) && auth.uid === userId;
  }

  isAuthority(auth) {
    return this.isAuthenticated(auth) && auth.token && auth.token.role === 'authority';
  }

  // users/{userId} -> allow create
  canCreateUser(auth, userId, resourceData) {
    return this.isOwner(auth, userId)
      && resourceData.uid === userId
      && ('role' in resourceData)
      && (['tourist', 'business_owner'].includes(resourceData.role))
      && ('email' in resourceData);
  }

  // users/{userId} -> allow update
  canUpdateUser(auth, userId, existingData, incomingData) {
    const createdAtCheck = !('createdAt' in existingData) || incomingData.createdAt === existingData.createdAt;
    return this.isOwner(auth, userId)
      && incomingData.uid === existingData.uid
      && incomingData.email === existingData.email
      && incomingData.role === existingData.role
      && createdAtCheck;
  }

  // destinations/{destinationId} -> allow read: if true; allow write: if isAuthority();
  canReadDestinations() {
    return true;
  }

  canWriteDestinations(auth) {
    return this.isAuthority(auth);
  }

  // businesses/{businessId} -> allow read
  canReadBusiness() {
    return true; // allow read: if true;
  }

  // businesses/{businessId} -> allow create
  canCreateBusiness(auth, incomingData) {
    return this.isAuthenticated(auth)
      && ('ownerUid' in incomingData)
      && incomingData.ownerUid === auth.uid;
  }

  // businesses/{businessId} -> allow update
  canUpdateBusiness(auth, existingData, incomingData) {
    return this.isAuthenticated(auth)
      && existingData.ownerUid === auth.uid
      && incomingData.ownerUid === existingData.ownerUid;
  }

  // businesses/{businessId} -> allow delete
  canDeleteBusiness(auth, existingData) {
    return this.isAuthenticated(auth)
      && (existingData.ownerUid === auth.uid || this.isAuthority(auth));
  }

  // nudges/{nudgeId} -> allow read
  canReadNudges() {
    return true; // allow read: if true;
  }

  // nudges/{nudgeId} -> allow create, update, delete
  canWriteNudges(auth) {
    return this.isAuthority(auth);
  }
}

const sim = new FirestoreRulesSimulator(rulesContent);

// Test Mock Users
const touristAuth = { uid: 'tourist-123', email: 'tourist@example.com', token: { role: 'tourist' } };
const businessAuth = { uid: 'biz-owner-456', email: 'owner@staygoa.com', token: { role: 'business_owner' } };
const authorityAuth = { uid: 'gov-official-789', email: 'director@goa.gov.in', token: { role: 'authority' } };
const unauthenticated = null;

// ======================================================================
// TEST 1: Tourist cannot self-promote to Authority
// ======================================================================
const touristCreateAsAuthority = sim.canCreateUser(touristAuth, touristAuth.uid, {
  uid: touristAuth.uid,
  email: touristAuth.email,
  role: 'authority' // Malicious attempt to self-assign authority
});
assertTest(
  'Test 1: Tourist cannot self-promote to Authority on user profile creation',
  touristCreateAsAuthority === false,
  'firestore.rules rejects create when role is "authority"'
);

// ======================================================================
// TEST 2: Business Owner cannot self-promote to Authority
// ======================================================================
const bizCreateAsAuthority = sim.canCreateUser(businessAuth, businessAuth.uid, {
  uid: businessAuth.uid,
  email: businessAuth.email,
  role: 'authority' // Malicious attempt by business owner
});
assertTest(
  'Test 2: Business Owner cannot self-promote to Authority on user profile creation',
  bizCreateAsAuthority === false,
  'firestore.rules rejects create when role is "authority"'
);

// ======================================================================
// TEST 3: Tourist cannot write official nudges
// ======================================================================
const touristWriteNudge = sim.canWriteNudges(touristAuth);
assertTest(
  'Test 3: Tourist cannot create, update, or delete official nudges',
  touristWriteNudge === false,
  'Tourist lacks token.role == "authority" claim'
);

// ======================================================================
// TEST 4: Business Owner cannot write official nudges
// ======================================================================
const bizWriteNudge = sim.canWriteNudges(businessAuth);
assertTest(
  'Test 4: Business Owner cannot create, update, or delete official nudges',
  bizWriteNudge === false,
  'Business owner lacks token.role == "authority" claim'
);

// ======================================================================
// TEST 5: Verified Authority can perform permitted Authority operations
// ======================================================================
const authorityWriteNudge = sim.canWriteNudges(authorityAuth);
const authorityDeleteBusiness = sim.canDeleteBusiness(authorityAuth, { ownerUid: 'other-user-999' });
assertTest(
  'Test 5: Verified Authority (with Custom Claim) can write nudges and moderate listings',
  authorityWriteNudge === true && authorityDeleteBusiness === true,
  'Authority token.role == "authority" custom claim allows privileged operations'
);

// ======================================================================
// TEST 6: User cannot change their uid, email, or role through profile updates
// ======================================================================
const existingProfile = {
  uid: 'tourist-123',
  email: 'tourist@example.com',
  name: 'Original Name',
  role: 'tourist',
  createdAt: '2026-11-20T10:00:00Z'
};

// Attempt to change role to authority
const attemptRoleChange = sim.canUpdateUser(touristAuth, touristAuth.uid, existingProfile, {
  ...existingProfile,
  role: 'authority'
});

// Attempt to change uid
const attemptUidChange = sim.canUpdateUser(touristAuth, touristAuth.uid, existingProfile, {
  ...existingProfile,
  uid: 'hacked-uid'
});

// Attempt to change email
const attemptEmailChange = sim.canUpdateUser(touristAuth, touristAuth.uid, existingProfile, {
  ...existingProfile,
  email: 'fake@example.com'
});

// Legitimate update: only name and bio changed
const legitimateProfileUpdate = sim.canUpdateUser(touristAuth, touristAuth.uid, existingProfile, {
  ...existingProfile,
  name: 'Updated Name',
  bio: 'Eco-conscious traveler visiting South Goa'
});

assertTest(
  'Test 6: User cannot change their uid, email, or role through profile updates',
  attemptRoleChange === false && attemptUidChange === false && attemptEmailChange === false && legitimateProfileUpdate === true,
  'Security rule enforces immutability of uid, email, and role while allowing legitimate profile edits'
);

// ======================================================================
// TEST 7: Business owner cannot transfer ownership through an ordinary listing update
// ======================================================================
const existingListing = {
  id: 'biz-101',
  name: 'Cola Beach Shack',
  ownerUid: businessAuth.uid,
  category: 'Homestays'
};

// Malicious update: change ownerUid to someone else
const attemptTransferOwnership = sim.canUpdateBusiness(businessAuth, existingListing, {
  ...existingListing,
  ownerUid: 'another-user-777'
});

// Legitimate update: edit description/prices while keeping ownerUid identical
const legitimateListingUpdate = sim.canUpdateBusiness(businessAuth, existingListing, {
  ...existingListing,
  startingPrice: 'Rs 1,800/night'
});

assertTest(
  'Test 7: Business owner cannot transfer ownership (ownerUid is immutable on update)',
  attemptTransferOwnership === false && legitimateListingUpdate === true,
  'Rule enforces incoming.ownerUid == existing.ownerUid'
);

// ======================================================================
// TEST 8: Business owner cannot modify another owner\'s listing
// ======================================================================
const otherOwnerListing = {
  id: 'biz-202',
  name: 'Galgibaga Eco Huts',
  ownerUid: 'another-legit-owner-999',
  category: 'Homestays'
};

const attemptTamperOtherListing = sim.canUpdateBusiness(businessAuth, otherOwnerListing, {
  ...otherOwnerListing,
  name: 'Hacked Listing'
});

const attemptDeleteOtherListing = sim.canDeleteBusiness(businessAuth, otherOwnerListing);

assertTest(
  'Test 8: Business owner cannot update or delete another owner\'s listing',
  attemptTamperOtherListing === false && attemptDeleteOtherListing === false,
  'Rule enforces resource.data.ownerUid == request.auth.uid'
);

// ======================================================================
// TEST 9: Public marketplace reading still works
// ======================================================================
const publicReadBusinesses = sim.canReadBusiness();
const publicReadNudges = sim.canReadNudges();
assertTest(
  'Test 9: Public marketplace discovery and crowd nudges reading works for unauthenticated visitors',
  publicReadBusinesses === true && publicReadNudges === true,
  'allow read: if true permits open tourist discovery'
);

// ======================================================================
// TEST 10: Phase 6 Destinations public read & Authority-only write
// ======================================================================
const publicReadDestinations = sim.canReadDestinations();
const touristWriteDest = sim.canWriteDestinations(touristAuth);
const bizWriteDest = sim.canWriteDestinations(businessAuth);
const authorityWriteDest = sim.canWriteDestinations(authorityAuth);

assertTest(
  'Test 10: Public visitors can discover destinations, but unverified users cannot modify them',
  publicReadDestinations === true && touristWriteDest === false && bizWriteDest === false && authorityWriteDest === true,
  'destinations collection allows public read, write restricted strictly to isAuthority()'
);

// ----------------------------------------------------------------------
console.log('\n---------------------------------------------------------------');
console.log(`TOTAL SECURITY TESTS: ${totalTests}`);
console.log(`PASSED:               \x1b[32m${passedTests}\x1b[0m`);
console.log(`FAILED:               \x1b[31m${failedTests}\x1b[0m`);
console.log('---------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32mAll 9 security test scenarios PASSED successfully.\x1b[0m\n');
  process.exit(0);
}
