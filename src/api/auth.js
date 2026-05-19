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

export async function logout() {
  await clearSession();
}
