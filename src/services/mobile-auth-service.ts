import { apiClient } from './api-client';
import { getFrappeErrorMessage } from './frappe-error';
import { storage } from './storage';

const BASE_PATH = 'ury.ury.api.mobile_auth';
const AUTH_TOKEN_KEY = 'mobile_auth_token';
const CUSTOMER_NAME_KEY = 'mobile_auth_customer_name';
const PHONE_KEY = 'mobile_auth_phone';

async function saveSession(authToken: string, customerName: string, phone: string) {
  await storage.set(AUTH_TOKEN_KEY, authToken);
  await storage.set(CUSTOMER_NAME_KEY, customerName);
  await storage.set(PHONE_KEY, phone);
}

export function getAuthToken() {
  return storage.get(AUTH_TOKEN_KEY);
}

export function getCachedCustomerName() {
  return storage.get(CUSTOMER_NAME_KEY);
}

export function getCachedPhone() {
  return storage.get(PHONE_KEY);
}

export async function isLoggedIn() {
  const token = await getAuthToken();
  return !!token;
}

/** Step 1 of login: send a 6-digit OTP to `phone` (must include country code, e.g. "+923001234567"). */
export async function requestOtp(phone: string): Promise<boolean> {
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.request_otp`, { phone });
    return response.data?.message?.status === 'sent';
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not send OTP. Please try again.'));
  }
}

/** Step 2 of login: verify the OTP and persist the resulting auth_token. */
export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.verify_otp`, { phone, otp });
    const message = response.data?.message;
    if (!message?.auth_token) return false;
    await saveSession(message.auth_token, message.customer_name ?? phone, phone);
    return true;
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not verify OTP. Please try again.'));
  }
}

async function requireToken(): Promise<string> {
  const token = await getAuthToken();
  if (!token) throw new Error('Not logged in');
  return token;
}

export async function getProfile(): Promise<Record<string, any>> {
  const token = await requireToken();
  const response = await apiClient.post(`/api/method/${BASE_PATH}.get_profile`, { auth_token: token });
  const message = response.data?.message;
  if (!message) throw new Error('Invalid response format');
  if (message.name) await storage.set(CUSTOMER_NAME_KEY, message.name);
  return message;
}

export async function updateProfile(params: { name?: string; email?: string }) {
  const token = await requireToken();
  await apiClient.post(`/api/method/${BASE_PATH}.update_profile`, { auth_token: token, ...params });
  if (params.name) await storage.set(CUSTOMER_NAME_KEY, params.name);
}

export async function addAddress(params: {
  addressLine1: string;
  city: string;
  pincode?: string;
  country?: string;
  addressTitle?: string;
}): Promise<Record<string, any>> {
  const token = await requireToken();
  const response = await apiClient.post(`/api/method/${BASE_PATH}.add_address`, {
    auth_token: token,
    address_line1: params.addressLine1,
    city: params.city,
    pincode: params.pincode,
    country: params.country ?? 'Pakistan',
    address_title: params.addressTitle,
  });
  return response.data?.message ?? {};
}

export async function listAddresses(): Promise<any[]> {
  const token = await requireToken();
  const response = await apiClient.post(`/api/method/${BASE_PATH}.list_addresses`, { auth_token: token });
  return response.data?.message ?? [];
}

/** Only returns paid/submitted orders — an order stays out of history while still an open, unpaid draft. */
export async function getOrderHistory(limit = 20): Promise<any[]> {
  const token = await requireToken();
  const response = await apiClient.post(`/api/method/${BASE_PATH}.get_order_history`, {
    auth_token: token,
    limit,
  });
  return response.data?.message ?? [];
}

export async function getOrderDetail(invoiceName: string): Promise<Record<string, any>> {
  const token = await requireToken();
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.get_order_detail`, {
      auth_token: token,
      invoice: invoiceName,
    });
    const message = response.data?.message;
    if (!message) throw new Error('Invalid response format');
    return message;
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not load order details.'));
  }
}

export async function listFavorites(): Promise<Record<string, any>[]> {
  const token = await getAuthToken();
  if (!token) return [];
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.list_favorites`, { auth_token: token });
    const message = response.data?.message;
    return Array.isArray(message) ? message : [];
  } catch {
    return [];
  }
}

export async function getFavoriteItemCodes(): Promise<Set<string>> {
  const favorites = await listFavorites();
  return new Set(favorites.map((f) => f.item_code as string));
}

export async function addFavorite(itemCode: string) {
  const token = await getAuthToken();
  if (!token) throw new Error('Please sign in to save favorites');
  try {
    await apiClient.post(`/api/method/${BASE_PATH}.add_favorite`, { auth_token: token, item_code: itemCode });
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not add favorite.'));
  }
}

export async function removeFavorite(itemCode: string) {
  const token = await getAuthToken();
  if (!token) throw new Error('Please sign in to manage favorites');
  try {
    await apiClient.post(`/api/method/${BASE_PATH}.remove_favorite`, { auth_token: token, item_code: itemCode });
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not remove favorite.'));
  }
}

/** Revokes the auth_token server-side, then clears it locally regardless of the server result. */
export async function logout() {
  const token = await getAuthToken();
  if (token) {
    try {
      await apiClient.post(`/api/method/${BASE_PATH}.logout`, { auth_token: token });
    } catch {
      // Best-effort — clear the local token regardless.
    }
  }
  await storage.remove(AUTH_TOKEN_KEY);
  await storage.remove(CUSTOMER_NAME_KEY);
  await storage.remove(PHONE_KEY);
}
