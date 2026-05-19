import Constants from 'expo-constants';

const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};
const host = typeof extra.API_HOST === 'string' && extra.API_HOST.trim()
  ? extra.API_HOST.trim()
  : 'localhost';

function baseUrl(port) {
  return `http://${host}:${port}/`;
}

export const API_BASE_URL = extra.API_BASE_URL || baseUrl(8080);
export const AUTH_BASE = extra.AUTH_BASE || baseUrl(8081);
export const MASTER_BASE = extra.MASTER_BASE || baseUrl(8091);
export const TICKET_BASE = extra.TICKET_BASE || baseUrl(8082);
export const TECHNICIAN_BASE = extra.TECHNICIAN_BASE || baseUrl(8085);
export const SHOP_BASE = extra.SHOP_BASE || baseUrl(8084);
export const INVENTORY_BASE = extra.INVENTORY_BASE || baseUrl(8086);
export const MARKETPLACE_BASE = extra.MARKETPLACE_BASE || baseUrl(8087);
export const PICKUP_BASE = extra.PICKUP_BASE || baseUrl(8088);
export const ORDER_BASE = extra.ORDER_BASE || baseUrl(8092);
