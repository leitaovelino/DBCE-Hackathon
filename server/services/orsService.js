/**
 * GoaSmart Platform - OpenRouteService (ORS) Routing Service
 * 
 * Interacts with OpenRouteService API:
 * POST https://api.openrouteservice.org/v2/directions/driving-car/geojson
 * 
 * Coordinate Format: [longitude, latitude] (Official ORS Specification)
 */

const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

/**
 * Validates array of coordinate pairs: [[lon, lat], [lon, lat], ...]
 */
export function validateCoordinates(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return {
      isValid: false,
      error: 'At least two coordinate pairs are required for route calculation.'
    };
  }

  if (coordinates.length > 25) {
    return {
      isValid: false,
      error: 'Too many stops requested. Maximum 25 stops permitted per route request.'
    };
  }

  for (let i = 0; i < coordinates.length; i++) {
    const pair = coordinates[i];
    if (!Array.isArray(pair) || pair.length < 2) {
      return {
        isValid: false,
        error: `Coordinate at index ${i} is invalid. Expected [longitude, latitude].`
      };
    }

    const lon = Number(pair[0]);
    const lat = Number(pair[1]);

    if (isNaN(lon) || isNaN(lat)) {
      return {
        isValid: false,
        error: `Coordinate at index ${i} contains non-numeric values.`
      };
    }

    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      return {
        isValid: false,
        error: `Coordinate at index ${i} (${lon}, ${lat}) is outside valid world bounds.`
      };
    }
  }

  return { isValid: true };
}

/**
 * Calculates road directions, driving distance and travel duration between waypoints.
 * 
 * @param {Array<[number, number]>} coordinates - Array of [longitude, latitude] points
 * @returns {Promise<Object>} Route details: distanceKm, durationMinutes, segments, geometry
 */
export async function calculateDirections(coordinates) {
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey || apiKey === 'your_ors_api_key' || apiKey === 'your_ors_api_key_here') {
    const err = new Error('ORS_API_KEY_NOT_CONFIGURED');
    err.code = 'CONFIG_MISSING';
    throw err;
  }

  const validation = validateCoordinates(coordinates);
  if (!validation.isValid) {
    const err = new Error(validation.error);
    err.code = 'INVALID_INPUT';
    throw err;
  }

  // Ensure numeric precision
  const sanitizedCoordinates = coordinates.map(([lon, lat]) => [
    Number(Number(lon).toFixed(6)),
    Number(Number(lat).toFixed(6))
  ]);

  try {
    const response = await fetch(ORS_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/geo+json'
      },
      body: JSON.stringify({
        coordinates: sanitizedCoordinates
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || response.statusText;
      console.error(`ORS API HTTP ${response.status}:`, errorMsg);

      if (response.status === 401 || response.status === 403) {
        const err = new Error('Invalid or unauthorized OpenRouteService API key.');
        err.code = 'UNAUTHORIZED';
        throw err;
      }
      if (response.status === 429) {
        const err = new Error('OpenRouteService rate limit exceeded. Please try again shortly.');
        err.code = 'QUOTA_EXCEEDED';
        throw err;
      }
      if (response.status === 400 || response.status === 404) {
        const err = new Error(`Route calculation failed: ${errorMsg}`);
        err.code = 'ROUTING_ERROR';
        throw err;
      }

      const err = new Error(`OpenRouteService error: ${errorMsg}`);
      err.code = 'SERVICE_ERROR';
      throw err;
    }

    // Process GeoJSON response
    const feature = data.features?.[0];
    if (!feature) {
      throw new Error('No route features returned by OpenRouteService.');
    }

    const summary = feature.properties?.summary || {};
    const totalDistanceMeters = summary.distance || 0;
    const totalDurationSeconds = summary.duration || 0;

    const distanceKm = Math.round((totalDistanceMeters / 1000) * 10) / 10;
    const durationMinutes = Math.round(totalDurationSeconds / 60);

    // Extract individual leg segments
    const rawSegments = feature.properties?.segments || [];
    const segments = rawSegments.map((seg, idx) => ({
      legIndex: idx,
      distanceKm: Math.round(((seg.distance || 0) / 1000) * 10) / 10,
      durationMinutes: Math.round((seg.duration || 0) / 60)
    }));

    // Extract geometry (GeoJSON LineString)
    const geometry = feature.geometry || null;

    return {
      success: true,
      distanceKm,
      durationMinutes,
      segments,
      geometry,
      stopsCount: sanitizedCoordinates.length,
      provider: 'OpenRouteService (Official driving-car)'
    };

  } catch (error) {
    if (error.code) throw error;

    console.error('Network error contacting OpenRouteService:', error.message);
    const netErr = new Error('Could not reach OpenRouteService API. Network error.');
    netErr.code = 'NETWORK_ERROR';
    throw netErr;
  }
}
