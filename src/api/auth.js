import { authApi } from './client';
import { saveSession, clearSession } from '../auth/session';

export async function login(email, password, shopSlug) {
  const body = { email, password };
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

export async function customerLogin({ mobile, email, password }) {
  const data = await authApi.post('/auth/customer-login', {
    body: { mobile, email, password },
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

export async function logout() {
  await clearSession();
}
