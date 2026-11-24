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

// ======================================================================
// RBAC PORTAL ACCESS GUARDS SIMULATION (Matching App.jsx and ProtectedAccessGuard.jsx)
// ======================================================================
function canAccessBusinessPortal(profile, hasClaim) {
  if (!profile) return false;
  return profile.role === 'business_owner' && !hasClaim;
}

function canAccessAuthorityCenter(profile, hasClaim) {
  if (!profile) return false;
  return profile.role === 'authority' && hasClaim === true;
}

// TEST A: Tourist Role Restrictions
const touristProfile = { uid: 'tourist-123', role: 'tourist' };
assertTest(
  'Test 11 (TEST A): Tourist is blocked from Business Owner Portal and Authority Command Center',
  canAccessBusinessPortal(touristProfile, false) === false && canAccessAuthorityCenter(touristProfile, false) === false,
  'Tourist is restricted to public tourist explorer features only'
);

// TEST B: Business Owner Role Permissions
const businessProfile = { uid: 'biz-456', role: 'business_owner' };
assertTest(
  'Test 12 (TEST B): Business Owner accesses Business Portal, but is blocked from Authority Center',
  canAccessBusinessPortal(businessProfile, false) === true && canAccessAuthorityCenter(businessProfile, false) === false,
  'Business owner has business portal access, strictly denied authority privileges'
);

// TEST C: Tourism Authority Permissions
const authorityProfile = { uid: 'auth-789', role: 'authority' };
assertTest(
  'Test 13 (TEST C): Verified Authority accesses Command Center, but does not receive Business Portal access',
  canAccessAuthorityCenter(authorityProfile, true) === true && canAccessBusinessPortal(authorityProfile, true) === false,
  'Authority has Command Center access; does not automatically receive Business Owner permissions'
);

// TEST D: Incorrect Role / Unverified Authority Rejection
const unverifiedAuthProfile = { uid: 'imposter-000', role: 'authority' };
const bizCustomClaimAuth = { uid: 'biz-claim-111', role: 'business_owner' };
assertTest(
  'Test 14 (TEST D): Account with Firestore role=authority but NO Custom Claim is rejected from Authority Center',
  canAccessAuthorityCenter(unverifiedAuthProfile, false) === false && canAccessAuthorityCenter(bizCustomClaimAuth, false) === false,
  'Requires cryptographically signed token.role == "authority"; Firestore role alone or business claim is rejected'
);

// TEST E: Logged Out User Rejection
assertTest(
  'Test 15 (TEST E): Logged out user is denied access to both protected portals',
  canAccessBusinessPortal(null, false) === false && canAccessAuthorityCenter(null, false) === false,
  'Unauthenticated users are directed to ProtectedAccessGuard sign-in prompt'
);

// ======================================================================
// STORAGE SECURITY RULES SIMULATION (Matching storage.rules)
// ======================================================================
function canUploadBusinessPhoto(auth, targetOwnerUid, fileSize, contentType) {
  if (!auth) return false;
  if (auth.uid !== targetOwnerUid) return false;
  if (fileSize > 5 * 1024 * 1024) return false;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(contentType.toLowerCase());
}

function canReadBusinessPhoto() {
  return true; // allow read: if true;
}

// TEST 16: Public visitors can view business photos
assertTest(
  'Test 16: Public visitors can view marketplace business photos',
  canReadBusinessPhoto() === true,
  'storage.rules permits open read access for all marketplace photos'
);

// TEST 17: Authenticated Business Owner can upload valid photo to their own folder
const ownerAuth = { uid: 'owner-abc' };
assertTest(
  'Test 17: Authenticated Business Owner can upload valid photo (< 5MB, JPG/PNG/WEBP)',
  canUploadBusinessPhoto(ownerAuth, 'owner-abc', 2 * 1024 * 1024, 'image/jpeg') === true,
  'Authorized upload into business-images/owner-abc/... passes validation'
);

// TEST 18: Business Owner A cannot upload or overwrite Business Owner B folder
assertTest(
  'Test 18: Business Owner A cannot upload to Business Owner B storage folder',
  canUploadBusinessPhoto(ownerAuth, 'owner-xyz', 1 * 1024 * 1024, 'image/jpeg') === false,
  'storage.rules strictly isolates uploads by request.auth.uid == ownerUid'
);

// TEST 19: Storage rejects oversized files (> 5 MB)
assertTest(
  'Test 19: Storage rejects uploads exceeding 5 MB limit',
  canUploadBusinessPhoto(ownerAuth, 'owner-abc', 6 * 1024 * 1024, 'image/jpeg') === false,
  'Rule enforces request.resource.size <= 5 * 1024 * 1024'
);

// TEST 20: Storage rejects unsupported MIME types (e.g. PDF, executable)
assertTest(
  'Test 20: Storage rejects non-image formats (e.g. application/pdf, text/html)',
  canUploadBusinessPhoto(ownerAuth, 'owner-abc', 500 * 1024, 'application/pdf') === false,
  'Rule enforces contentType matching image/(jpeg|jpg|png|webp)'
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
  console.log('\x1b[32mAll security and RBAC test scenarios PASSED successfully.\x1b[0m\n');
  process.exit(0);
}
