/**
 * GoaSmart Platform - Express Backend & Gemini AI Gateway
 */

// Load environment variables relative to this entry file before any routes or services load
import './env.js';

import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import routesRouter from './routes/routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. CORS Configuration
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy for GoaSmart'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Request body parsing with sensible size limits
app.use(express.json({ limit: '100kb' }));

// 3. Health Check Endpoint
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key' &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  const hasOrsKey = Boolean(
    process.env.ORS_API_KEY &&
    process.env.ORS_API_KEY !== 'your_ors_api_key' &&
    process.env.ORS_API_KEY !== 'your_ors_api_key_here'
  );

  res.status(200).json({
    status: 'ok',
    service: 'GoaSmart AI Companion & Routing Backend',
    geminiConfigured: hasGeminiKey,
    orsConfigured: hasOrsKey,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
});

// 4. Mount API Routes
app.use('/api/chat', chatRouter);
app.use('/api/routes', routesRouter);

// 5. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error.'
  });
});

// 6. Start Server
app.listen(PORT, () => {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key' &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  const hasOrsKey = Boolean(
    process.env.ORS_API_KEY &&
    process.env.ORS_API_KEY !== 'your_ors_api_key' &&
    process.env.ORS_API_KEY !== 'your_ors_api_key_here'
  );

  console.log('===============================================================');
  console.log(`🚀 GoaSmart Backend running on http://localhost:${PORT}`);
  console.log(`   Frontend Origin:   ${FRONTEND_URL}`);
  console.log(`   Gemini AI Status:  ${hasGeminiKey ? '✓ Configured' : '⚠️ Missing / Not set in server/.env'}`);
  console.log(`   ORS Route Status:  ${hasOrsKey ? '✓ Configured' : '⚠️ Missing / Not set in server/.env'}`);
  console.log(`   Target AI Model:   ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
  console.log('===============================================================\n');
});
