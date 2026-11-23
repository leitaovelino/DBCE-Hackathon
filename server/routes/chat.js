/**
 * GoaSmart Platform - Chat Route
 * POST /api/chat
 */

import { Router } from 'express';
import { generateGeminiChat } from '../services/geminiService.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory, userPreferences } = req.body;

    // 1. Validation: Message required and non-empty
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string.'
      });
    }

    // 2. Validation: Request size guards
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long. Please keep queries under 2000 characters.'
      });
    }

    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return res.status(400).json({
        success: false,
        error: 'conversationHistory must be an array of prior messages.'
      });
    }

    // 3. Process with Gemini Service
    const aiResult = await generateGeminiChat(
      message.trim(),
      Array.isArray(conversationHistory) ? conversationHistory : [],
      userPreferences || {}
    );

    return res.status(200).json({
      success: true,
      response: {
        text: aiResult.text,
        recommendedDestinations: aiResult.recommendedDestinations || []
      }
    });

  } catch (error) {
    const code = error.message;

    if (code === 'INVALID_API_KEY') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or unauthorized Gemini API key. Please check your GEMINI_API_KEY in server/.env.'
      });
    }

    if (code === 'QUOTA_EXCEEDED') {
      return res.status(429).json({
        success: false,
        error: 'Gemini API rate limit or quota exceeded. Please try again in a few moments.'
      });
    }

    if (code === 'MODEL_NOT_AVAILABLE') {
      return res.status(503).json({
        success: false,
        error: 'The configured Gemini model is currently unavailable. Please verify GEMINI_MODEL in server/.env.'
      });
    }

    // Generic error (Do not expose private credentials)
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while communicating with Google Gemini. Please try again.'
    });
  }
});

export default router;
