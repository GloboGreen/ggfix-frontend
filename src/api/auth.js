import { authApi } from './client';
import { saveSession, clearSession, getSession } from '../auth/session';

export async function login(email, { password, otp, shopSlug } = {}) {
  const body = { email };
  if (otp) body.otp = otp;
  else if (password) body.password = password;
  if (shopSlug) body.shopSlug = shopSlug;
  const data = await authApi.post('/auth/login', { body });
  await saveSession(data);
  return data;
}

export async function register(shopName, shopSlug, email, password, name) {
  const data = await authApi.post('/auth/register', {
    body: { shopName, shopSlug, email, password, name },
  });
  return data;
}

export async function customerRegister({ fullName, email, mobile, password }) {
  const data = await authApi.post('/auth/customer-register', {
    body: { fullName, email, mobile, password },
  });
  const session = {
    accessToken: data.accessToken,
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    mobile: data.mobile,
    roles: data.roles || ['CUSTOMER'],
  };
  await saveSession(session);
  return session;
}

export async function customerLogin({ mobile, email, password, otp }) {
  const body = { mobile, email };
  if (otp) body.otp = otp;
  else if (password) body.password = password;
  const data = await authApi.post('/auth/customer-login', { body });
  const session = {
    accessToken: data.accessToken,
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    mobile: data.mobile,
    roles: data.roles || ['CUSTOMER'],
  };
  await saveSession(session);
  return session;
}

export async function switchShop(shopId) {
  const data = await authApi.post('/auth/switch-shop', { body: { shopId } });
  await saveSession(data);
  return data;
}

/**
 * Fetch the current authenticated owner's full profile + locations from
 * /auth/me, then merge non-secret fields into the persisted session so
 * subsequent screen reads see live data (shopName, shops list, phone,
 * avatar, structured address, etc.). Returns the /auth/me payload.
 *
 * Heals old sessions taken before LoginResponse added shopName/shops.
 */
export async function fetchMe() {
  const me = await authApi.get('/auth/me');
  if (!me || !me.id) return me;
  const prev = (await getSession()) || {};
  const activeShop = (me.locations || []).find((s) => s.id === prev.shopId) || (me.locations || [])[0] || null;
  const merged = {
    ...prev,
    userId: me.id,
    name: me.name ?? prev.name,
    email: me.email ?? prev.email,
    phone: me.phone ?? prev.phone,
    secondaryMobile: me.secondaryMobile ?? prev.secondaryMobile,
    avatarUrl: me.avatarUrl ?? prev.avatarUrl,
    idProofUrl: me.idProofUrl ?? prev.idProofUrl,
    personalAddress: me.personalAddress ?? prev.personalAddress,
    addrState: me.addrState ?? prev.addrState,
    addrDistrict: me.addrDistrict ?? prev.addrDistrict,
    addrTaluk: me.addrTaluk ?? prev.addrTaluk,
    addrArea: me.addrArea ?? prev.addrArea,
    addrStreet: me.addrStreet ?? prev.addrStreet,
    addrPincode: me.addrPincode ?? prev.addrPincode,
    emailVerified: me.emailVerified,
    isActive: me.isActive,
    roles: me.role ? [me.role] : (prev.roles || []),
    shops: (me.locations || []).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      isActive: activeShop ? s.id === activeShop.id : false,
    })),
    shopId: activeShop ? activeShop.id : prev.shopId,
    shopName: activeShop ? activeShop.name : prev.shopName,
    activeShop, // full active shop object: mobile, address, etc.
  };
  await saveSession(merged);
  return merged;
}

export async function logout() {
  await clearSession();
}

/**
 * Update one of the current owner's shops. PATCH semantics — only the fields
 * you include are written; everything else is preserved server-side.
 * Returns the refreshed ShopOwnerView (same shape as GET /auth/shop-owners/{id}).
 */
export async function updateOwnerShop(ownerId, shopId, patch) {
  return await authApi.patch(`/auth/shop-owners/${ownerId}/locations/${shopId}`, { body: patch });
}
