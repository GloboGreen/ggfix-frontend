import {
  AUTH_BASE,
  MASTER_BASE,
  TICKET_BASE,
  TECHNICIAN_BASE,
  SHOP_BASE,
  INVENTORY_BASE,
  MARKETPLACE_BASE,
  PICKUP_BASE,
  ORDER_BASE,
  USER_BASE,
} from './config';
import { getToken } from '../auth/session';

async function request(baseUrlOrNull, method, path, { query, body, headers } = {}) {
  let base = baseUrlOrNull && typeof baseUrlOrNull === 'string' ? baseUrlOrNull.trim() : '';
  if (!base || !base.startsWith('http')) base = 'http://localhost:8081/';
  else if (!base.endsWith('/')) base = base + '/';
  const url = new URL(path, base);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }

  const token = await getToken();
  const urlString = url.toString();
  let res;
  try {
    res = await fetch(urlString, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const baseHint =
      baseUrlOrNull && typeof baseUrlOrNull === 'string' && baseUrlOrNull.includes('localhost')
        ? ' (note: localhost on a phone means the phone itself)'
        : '';
    const msg = e?.message || 'Network request failed';
    const err = new Error(`Network request failed${baseHint}. URL: ${urlString}. ${msg}`);
    err.status = 0;
    throw err;
  }

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message = (json && (json.message || json.error)) || text || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  return json;
}

function createClient(baseUrl) {
  return {
    get: (path, opts) => request(baseUrl, 'GET', path, opts),
    post: (path, opts) => request(baseUrl, 'POST', path, opts),
    put: (path, opts) => request(baseUrl, 'PUT', path, opts),
    patch: (path, opts) => request(baseUrl, 'PATCH', path, opts),
    del: (path, opts) => request(baseUrl, 'DELETE', path, opts),
  };
}

export const authApi = createClient(AUTH_BASE);
export const masterApi = createClient(MASTER_BASE);
export const ticketApi = createClient(TICKET_BASE);
export const technicianApi = createClient(TECHNICIAN_BASE);
export const shopApi = createClient(SHOP_BASE);
export const inventoryApi = createClient(INVENTORY_BASE);
export const marketplaceApi = createClient(MARKETPLACE_BASE);
export const pickupApi = createClient(PICKUP_BASE);
export const orderApi = createClient(ORDER_BASE);
export const userApi = createClient(USER_BASE);
