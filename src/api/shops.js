import { shopApi, authApi } from './client';

function unwrap(list) {
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}

export async function listShops(q) {
  return unwrap(await shopApi.get('/shops', { query: q ? { q } : undefined }));
}

/**
 * Pickup-enabled shops within {radiusKm} of (lat,lng). Reads live data from
 * auth-service's Postgres (the source of truth for shop coords / pickup
 * windows) instead of shop-service which still runs its own in-memory H2 in
 * dev. Public endpoint — no auth header needed.
 *
 * If lat/lng are missing we just return [] (caller should request GPS first).
 */
export async function listNearbyShops({ lat, lng, radiusKm } = {}) {
  if (lat == null || lng == null) return [];
  return unwrap(await authApi.get('/auth/shops/pickup-nearby', { query: { lat, lng, radiusKm } }));
}
/**
 * Public shop detail. Reads from auth-service Postgres (same source as the
 * pickup-nearby feed) — shop-service still runs an isolated H2 in dev that
 * doesn't know about owner-created shops. When (lat,lng) are provided, the
 * server also returns distanceKm.
 */
export async function getShop(id, { lat, lng } = {}) {
  const query = lat != null && lng != null ? { lat, lng } : undefined;
  return await authApi.get(`/auth/shops/${id}/public`, { query });
}
export async function getShopBySlug(slug) {
  return await shopApi.get(`/shops/by-slug/${slug}`);
}
export async function getShopPickupSlots(id) {
  return unwrap(await shopApi.get(`/shops/${id}/pickup-slots`));
}
