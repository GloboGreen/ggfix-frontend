import { masterApi } from './client';

function unwrap(list) {
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}

// Existing
export async function getBrands() {
  return unwrap(await masterApi.get('/master/brands'));
}
export async function getModelsByBrand(brandId) {
  if (!brandId) return [];
  return unwrap(await masterApi.get(`/master/brands/${brandId}/models`));
}
export async function getRamOptions() {
  return unwrap(await masterApi.get('/master/ram-options'));
}
export async function getStorageOptions() {
  return unwrap(await masterApi.get('/master/storage-options'));
}
export async function getRepairServices() {
  return unwrap(await masterApi.get('/master/repair-services'));
}

// New: device categories, series, colors
export async function getDeviceCategories() {
  return unwrap(await masterApi.get('/master/device-categories'));
}
export async function getSeriesByBrand(brandId) {
  if (!brandId) return [];
  return unwrap(await masterApi.get(`/master/brands/${brandId}/series`));
}
export async function getColors() {
  return unwrap(await masterApi.get('/master/colors'));
}
export async function getModelVariants(modelId) {
  if (!modelId) return [];
  return unwrap(await masterApi.get(`/master/models/${modelId}/variants`));
}

// Repair categories
export async function getRepairCategories() {
  return unwrap(await masterApi.get('/master/repair-categories'));
}

// Sell flow master data
export async function getScreeningQuestions(flow) {
  return unwrap(await masterApi.get('/master/screening-questions', { query: flow ? { flow } : undefined }));
}
export async function getConditionGroups() {
  return unwrap(await masterApi.get('/master/condition-groups'));
}
export async function getConditionOptions(groupId) {
  return unwrap(await masterApi.get(`/master/condition-groups/${groupId}/options`));
}
export async function getFunctionalIssues() {
  return unwrap(await masterApi.get('/master/functional-issues'));
}
export async function getAccessoryOptions() {
  return unwrap(await masterApi.get('/master/accessory-options'));
}
export async function getWarrantyOptions() {
  return unwrap(await masterApi.get('/master/warranty-options'));
}

// Content
export async function getBanners() {
  return unwrap(await masterApi.get('/master/banners'));
}
export async function getFaqItems() {
  return unwrap(await masterApi.get('/master/faq-items'));
}
export async function getAppContent(code) {
  if (code) return await masterApi.get(`/master/app-content/${code}`);
  return unwrap(await masterApi.get('/master/app-content'));
}
export async function getSupportContacts() {
  return unwrap(await masterApi.get('/master/support-contacts'));
}
