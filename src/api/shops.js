import { shopApi } from './client';

function unwrap(list) {
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}

export async function listShops(q) {
  return unwrap(await shopApi.get('/shops', { query: q ? { q } : undefined }));
}
export async function listNearbyShops({ lat, lng, radiusKm } = {}) {
  return unwrap(await shopApi.get('/shops/nearby', { query: { lat, lng, radiusKm } }));
}
export async function getShop(id) {
  return await shopApi.get(`/shops/${id}`);
}
export async function getShopBySlug(slug) {
  return await shopApi.get(`/shops/by-slug/${slug}`);
}
export async function getShopPickupSlots(id) {
  return unwrap(await shopApi.get(`/shops/${id}/pickup-slots`));
}
