/**
 * GoaSmart Platform - Unified API Keys & Connectivity Diagnostic Tool
 * 
 * Tests both Frontend and Backend API keys against live provider services:
 * 1. [Frontend] Firebase Configuration (.env.local) -> Live Firestore & Auth Check
 * 2. [Backend]  Google Gemini API Key (server/.env) -> Live Travel Companion Call
 * 3. [Backend]  OpenRouteService Key (server/.env)  -> Live Road Directions Route
 * 
 * Note: Never prints or logs full secrets to the console.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Helper to mask secret keys: e.g. "AIzaSy...4x9Q (39 chars)"
function maskSecret(val) {
  if (!val) return '\x1b[31m(NOT CONFIGURED)\x1b[0m';
  const str = String(val).trim();
  if (str === 'your_gemini_api_key' || str === 'your_gemini_api_key_here' || 
      str === 'your_ors_api_key' || str === 'your_ors_api_key_here') {
    return '\x1b[33m(PLACEHOLDER - NOT SET)\x1b[0m';
  }
  if (str.length <= 10) return `${str.slice(0, 2)}***${str.slice(-2)} (${str.length} chars)`;
  return `\x1b[36m${str.slice(0, 6)}...${str.slice(-4)}\x1b[0m (${str.length} chars)`;
}

// Simple dependency-free .env parser
function loadEnv(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;
  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        env[key] = val;
      }
    }
  }
  return env;
}

console.log('===============================================================');
console.log('       GOASMART PLATFORM - API KEYS & CONNECTIVITY AUDIT');
console.log('===============================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function reportResult(name, passed, message) {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${name}`);
    if (message) console.log(`       \x1b[90m${message}\x1b[0m`);
  } else {
    failedChecks++;
    console.log(`\x1b[31m[FAIL]\x1b[0m ${name}`);
    if (message) console.log(`       \x1b[31m${message}\x1b[0m`);
  }
}

async function checkFrontendFirebase() {
  console.log('\n--- 1. FRONTEND: FIREBASE CONFIGURATION (.env.local) ---');
  const envLocalPath = resolve(process.cwd(), '.env.local');

  if (!existsSync(envLocalPath)) {
    reportResult('Firebase .env.local file', false, '.env.local file not found in project root.');
    return;
  }

  const env = loadEnv(envLocalPath);
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  let allKeysPresent = true;
  for (const k of requiredKeys) {
    const val = env[k];
    const isPresent = Boolean(val && !val.includes('your_'));
    if (!isPresent) allKeysPresent = false;
    console.log(`  • ${k.padEnd(35)}: ${maskSecret(val)}`);
  }

  reportResult('Firebase Environment Keys Present', allKeysPresent, 
    allKeysPresent ? 'All 6 VITE_FIREBASE_* variables populated' : 'One or more Firebase variables missing');

  // Test live Firebase initialization and Firestore read
  try {
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore, collection, getDocs, limit, query } = await import('firebase/firestore');

    const app = initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    }, 'diagnosticApp');

    const auth = getAuth(app);
    reportResult('Firebase Client Auth Initialization', Boolean(auth && auth.app), `Auth client ready for project: ${env.VITE_FIREBASE_PROJECT_ID}`);

    const db = getFirestore(app);
    // Attempt Firestore connection (read 1 destination doc)
    const q = query(collection(db, 'destinations'), limit(1));
    const snapshot = await getDocs(q);
    reportResult('Live Firestore Database Connection', true, 
      `Successfully queried Firestore: found ${snapshot.size} document(s) in 'destinations' collection`);
  } catch (err) {
    reportResult('Live Firestore Database Connection', false, `Firestore query error: ${err.message}`);
  }
}

async function checkBackendGemini() {
  console.log('\n--- 2. BACKEND: GOOGLE GEMINI AI (server/.env) ---');
  const serverEnvPath = resolve(process.cwd(), 'server', '.env');

  if (!existsSync(serverEnvPath)) {
    reportResult('Backend server/.env file', false, 'server/.env file not found.');
    return;
  }

  const serverEnv = loadEnv(serverEnvPath);
  const geminiKey = serverEnv.GEMINI_API_KEY;
  console.log(`  • GEMINI_API_KEY                     : ${maskSecret(geminiKey)}`);
  console.log(`  • GEMINI_MODEL                       : ${serverEnv.GEMINI_MODEL || 'gemini-2.5-flash (default)'}`);

  const isConfigured = Boolean(
    geminiKey && 
    geminiKey !== 'your_gemini_api_key' && 
    geminiKey !== 'your_gemini_api_key_here'
  );

  reportResult('Gemini API Key Configured', isConfigured, 
    isConfigured ? 'GEMINI_API_KEY is present and not a placeholder' : 'GEMINI_API_KEY is missing or placeholder');

  if (!isConfigured) return;

  // Perform live API call to Gemini
  try {
    process.env.GEMINI_API_KEY = geminiKey;
    process.env.GEMINI_MODEL = serverEnv.GEMINI_MODEL || 'gemini-2.5-flash';

    const { generateGeminiChat } = await import('../server/services/geminiService.js');
    console.log('       Sending probe query to Gemini AI...');
    const result = await generateGeminiChat('Hello GoaSmart! Are you active? Please reply in 5 words.');
    
    const isValidResponse = Boolean(result && result.text && result.text.length > 0 && !result.text.includes('Gemini API Key Required'));
    reportResult('Live Gemini API Communication', isValidResponse, 
      `Model: ${serverEnv.GEMINI_MODEL || 'gemini-2.5-flash'} | Response: "${result.text.slice(0, 60).replace(/\n/g, ' ')}..."`);
  } catch (err) {
    reportResult('Live Gemini API Communication', false, `Gemini API call failed: ${err.message}`);
  }
}

async function checkBackendOrs() {
  console.log('\n--- 3. BACKEND: OPENROUTESERVICE (server/.env) ---');
  const serverEnvPath = resolve(process.cwd(), 'server', '.env');
  const serverEnv = loadEnv(serverEnvPath);
  const orsKey = serverEnv.ORS_API_KEY;

  console.log(`  • ORS_API_KEY                        : ${maskSecret(orsKey)}`);

  const isConfigured = Boolean(
    orsKey && 
    orsKey !== 'your_ors_api_key' && 
    orsKey !== 'your_ors_api_key_here'
  );

  reportResult('OpenRouteService API Key Configured', isConfigured, 
    isConfigured ? 'ORS_API_KEY is present and not a placeholder' : 'ORS_API_KEY is missing or placeholder');

  if (!isConfigured) return;

  // Perform live directions call to OpenRouteService
  try {
    process.env.ORS_API_KEY = orsKey;
    const { calculateDirections } = await import('../server/services/orsService.js');
    console.log('       Querying live road directions: Panaji -> Calangute Beach...');
    
    // Panaji to Calangute coordinates [longitude, latitude]
    const testCoordinates = [
      [73.8278, 15.4909],
      [73.7554, 15.5434]
    ];

    const route = await calculateDirections(testCoordinates);
    const isValidRoute = Boolean(route && typeof route.distanceKm === 'number' && route.distanceKm > 0);
    
    reportResult('Live OpenRouteService Directions API', isValidRoute, 
      `Driving distance: ${route.distanceKm} km | Drive duration: ${route.durationMinutes} mins | Profile: driving-car`);
  } catch (err) {
    reportResult('Live OpenRouteService Directions API', false, `OpenRouteService error: ${err.message}`);
  }
}

async function runAudit() {
  await checkFrontendFirebase();
  await checkBackendGemini();
  await checkBackendOrs();

  console.log('\n===============================================================');
  console.log(`TOTAL AUDIT CHECKS: ${totalChecks}`);
  console.log(`PASSED:             \x1b[32m${passedChecks}\x1b[0m`);
  console.log(`FAILED:             \x1b[31m${failedChecks}\x1b[0m`);
  console.log('===============================================================\n');

  if (failedChecks > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});

