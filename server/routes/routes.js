/**
 * GoaSmart Platform - Routing & Directions Router
 * POST /api/routes/directions
 */

import { Router } from 'express';
import { calculateDirections, validateCoordinates } from '../services/orsService.js';

const router = Router();

router.post('/directions', async (req, res) => {
  try {
    const { coordinates } = req.body;

    // 1. Validate request body
    if (!coordinates) {
      return res.status(400).json({
        success: false,
        error: 'coordinates field is required in request body.'
      });
    }

    const validation = validateCoordinates(coordinates);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // 2. Call ORS Service
    const routeResult = await calculateDirections(coordinates);

    return res.status(200).json({
      success: true,
      distanceKm: routeResult.distanceKm,
      durationMinutes: routeResult.durationMinutes,
      segments: routeResult.segments || [],
      geometry: routeResult.geometry || null,
      provider: routeResult.provider
    });

  } catch (error) {
    if (error.code === 'CONFIG_MISSING') {
      return res.status(503).json({
        success: false,
        error: 'OpenRouteService API key is not configured in server/.env.'
      });
    }

    if (error.code === 'INVALID_INPUT') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    if (error.code === 'UNAUTHORIZED') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or unauthorized OpenRouteService API key.'
      });
    }

    if (error.code === 'QUOTA_EXCEEDED') {
      return res.status(429).json({
        success: false,
        error: 'OpenRouteService rate limit exceeded. Please try again in a few moments.'
      });
    }

    if (error.code === 'ROUTING_ERROR') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(502).json({
      success: false,
      error: error.message || 'An error occurred during route calculation.'
    });
  }
});

export default router;
