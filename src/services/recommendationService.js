import { DESTINATIONS } from '../data/destinations';

/**
 * Smart Destination Recommendation Service
 * Prepared for backend Machine Learning / LightGBM recommendation endpoint:
 * Endpoint: POST /api/recommendations/personalized
 */

export function getRecommendationsByCategory(category) {
  if (!category || category === 'All Recommendations') {
    return DESTINATIONS;
  }

  return DESTINATIONS.filter((d) => {
    return d.recCategories && d.recCategories.includes(category);
  });
}

export function generatePersonalizedRecommendations({
  persona = 'peaceful', // 'peaceful', 'culture', 'budget', 'adventure'
  region = 'All',
  maxCrowd = 50
}) {
  return DESTINATIONS.filter((d) => {
    if (region !== 'All' && d.region !== region) return false;

    if (persona === 'peaceful') {
      return d.crowdScore <= maxCrowd || d.tags.includes('Quiet & Peaceful');
    }
    if (persona === 'culture') {
      return (
        d.recCategories?.includes('Historical and cultural places') ||
        d.mapCategory === 'Historical places' ||
        d.mapCategory === 'Religious places'
      );
    }
    if (persona === 'adventure') {
      return (
        d.recCategories?.includes('Nature and adventure') ||
        d.mapCategory === 'Adventure and activities' ||
        d.mapCategory === 'Nature and waterfalls'
      );
    }
    if (persona === 'budget') {
      return d.entryFee.toLowerCase().includes('free') && d.crowdScore < 60;
    }
    return true;
  }).slice(0, 6);
}
