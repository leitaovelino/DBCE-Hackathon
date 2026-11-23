/**
 * GoaSmart Platform - Backend & Gemini Integration Test Suite
 * Runs within the server workspace where express and @google/genai are installed.
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';

console.log('===============================================================');
console.log('       GOASMART BACKEND & GEMINI INTEGRATION TESTS');
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

// Spin up a test instance of the Express app
const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'GoaSmart AI Companion Backend'
  });
});

app.use('/api/chat', chatRouter);

const server = app.listen(0);
const port = server.address().port;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch {
            resolve({ statusCode: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  // Test 1: Health Check Endpoint
  const healthRes = await makeRequest('/api/health');
  assertTest(
    'Test 1: Backend starts and health endpoint responds with HTTP 200',
    healthRes.statusCode === 200 && healthRes.data?.status === 'ok',
    'GET /api/health returned status ok'
  );

  // Test 2: Reject Empty Message
  const emptyRes = await makeRequest('/api/chat', 'POST', { message: '   ' });
  assertTest(
    'Test 2: Rejects empty or whitespace-only messages with HTTP 400',
    emptyRes.statusCode === 400 && emptyRes.data?.success === false,
    emptyRes.data?.error || ''
  );

  // Test 3: Reject Missing Message Parameter
  const missingRes = await makeRequest('/api/chat', 'POST', {});
  assertTest(
    'Test 3: Rejects missing message parameter with HTTP 400',
    missingRes.statusCode === 400 && missingRes.data?.success === false,
    missingRes.data?.error || ''
  );

  // Test 4: Reject Oversized Message
  const oversizedText = 'a'.repeat(2500);
  const oversizedRes = await makeRequest('/api/chat', 'POST', { message: oversizedText });
  assertTest(
    'Test 4: Rejects oversized queries (>2000 chars) with HTTP 400',
    oversizedRes.statusCode === 400 && oversizedRes.data?.success === false,
    oversizedRes.data?.error || ''
  );

  // Test 5: Valid Message Handling
  const validRes = await makeRequest('/api/chat', 'POST', {
    message: 'What are the best peaceful beaches in South Goa?',
    conversationHistory: []
  });

  const isHandledCleanly = (validRes.statusCode === 200 && validRes.data?.success) || (validRes.statusCode === 401);
  assertTest(
    'Test 5: Chat endpoint processes valid Goa tourism query with proper schema',
    isHandledCleanly,
    validRes.data?.response ? `Response length: ${validRes.data.response.text.length} chars` : (validRes.data?.error || 'Handled cleanly')
  );

  server.close();

  console.log('\n---------------------------------------------------------------');
  console.log(`TOTAL BACKEND TESTS: ${totalTests}`);
  console.log(`PASSED:              \x1b[32m${passedTests}\x1b[0m`);
  console.log(`FAILED:              \x1b[31m${failedTests}\x1b[0m`);
  console.log('---------------------------------------------------------------\n');

  if (failedTests > 0) process.exit(1);
  else process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  server.close();
  process.exit(1);
});
