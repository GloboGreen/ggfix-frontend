import { masterApi } from './client';

export async function getBrands() {
  const list = await masterApi.get('/master/brands');
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}

export async function getModelsByBrand(brandId) {
  if (!brandId) return [];
  const list = await masterApi.get(`/master/brands/${brandId}/models`);
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}

export async function getRamOptions() {
  const list = await masterApi.get('/master/ram-options');
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}

export async function getStorageOptions() {
  const list = await masterApi.get('/master/storage-options');
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}

export async function getRepairServices() {
  const list = await masterApi.get('/master/repair-services');
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}
