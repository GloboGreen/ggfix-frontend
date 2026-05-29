import { orderApi } from './client';

function unwrap(list) {
  return Array.isArray(list) ? list : (list?.content ?? list?.data ?? []);
}

// Unified order list (Buy / Sell / Pickup / Enquiry / Repair tabs)
export async function listMyOrders({ orderType, status } = {}) {
  return unwrap(await orderApi.get('/customer-orders', { query: { orderType, status } }));
}
export async function getMyOrder(id) {
  return await orderApi.get(`/customer-orders/${id}`);
}
// Checkout the cart into a BUY order (shows in My Orders → Buy tab).
export async function createBuyOrder({ items, totalAmount }) {
  return await orderApi.post('/customer-orders/buy', { body: { items, totalAmount } });
}

// Repair bookings
export async function createRepairBooking(payload) {
  return await orderApi.post('/repair-bookings', { body: payload });
}
export async function listRepairBookings(status) {
  return unwrap(await orderApi.get('/repair-bookings', { query: status ? { status } : undefined }));
}
export async function getRepairBooking(id) {
  return await orderApi.get(`/repair-bookings/${id}`);
}
export async function updateRepairBookingStatus(id, status) {
  return await orderApi.patch(`/repair-bookings/${id}/status`, { query: { status } });
}
export async function rescheduleRepairBooking(id, payload) {
  return await orderApi.post(`/repair-bookings/${id}/reschedule`, { body: payload });
}

// Shop/owner side: list the shop's customer repair bookings and post a
// service-timeline status the customer's History screen renders.
export async function listShopRepairBookings() {
  return unwrap(await orderApi.get('/repair-bookings/shop'));
}
export async function postShopBookingStatus(id, payload) {
  return await orderApi.post(`/repair-bookings/${id}/shop-status`, { body: payload });
}
export async function cancelRepairBooking(id) {
  return await orderApi.post(`/repair-bookings/${id}/cancel`);
}

// Sell orders
export async function createSellOrder(payload) {
  return await orderApi.post('/sell-orders', { body: payload });
}
export async function listSellOrders() {
  return unwrap(await orderApi.get('/sell-orders'));
}
export async function getSellOrder(id) {
  return await orderApi.get(`/sell-orders/${id}`);
}
export async function getSellOrderQuotations(id) {
  return unwrap(await orderApi.get(`/sell-orders/${id}/quotations`));
}
export async function chooseSellQuotation(id, quotationId) {
  return await orderApi.post(`/sell-orders/${id}/choose-quotation`, { body: { quotationId } });
}
export async function cancelSellOrder(id) {
  return await orderApi.post(`/sell-orders/${id}/cancel`);
}
