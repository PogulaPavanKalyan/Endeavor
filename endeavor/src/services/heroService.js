import { api } from '../utils/api';

const BASE_UPLOADS = 'http://localhost:8081';

/**
 * Fetch the active hero banner.
 * Returns null on 404 (no active hero set yet).
 */
export const fetchHero = async () => {
  try {
    const data = await api.get('/api/hero');
    // Resolve background image URL
    if (data?.backgroundImage) {
      data.backgroundImageUrl = `${BASE_UPLOADS}/uploads/hero/${data.backgroundImage}`;
    }
    // Resolve right-side hero visual image URL
    if (data?.heroImage) {
      data.heroImageUrl = `${BASE_UPLOADS}/uploads/hero/${data.heroImage}`;
    }
    return data;
  } catch (err) {
    // 404 = no active hero — return null for graceful fallback
    console.warn('No active hero banner found:', err.message);
    return null;
  }
};

/**
 * Fetch live site statistics.
 */
export const fetchStatistics = async () => {
  try {
    return await api.get('/api/statistics');
  } catch (err) {
    console.error('Failed to fetch statistics:', err);
    return { conferencesCount: 150, countriesCount: 50, researchersCount: 10000, publicationsCount: 500 };
  }
};

/**
 * Fetch active trust badges ordered by displayOrder.
 */
export const fetchTrustBadges = async () => {
  try {
    return await api.get('/api/trust-badges');
  } catch (err) {
    console.error('Failed to fetch trust badges:', err);
    return [];
  }
};
