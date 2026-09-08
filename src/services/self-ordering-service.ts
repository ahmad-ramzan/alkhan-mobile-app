import { apiClient } from './api-client';
import { getFrappeErrorMessage } from './frappe-error';
import { getAuthToken } from './mobile-auth-service';
import { storage } from './storage';

const BASE_PATH = '/api/method/ury.ury.api.self_ordering';
const SESSION_KEY = 'self_ordering_session';
const CAPABILITIES_KEY = 'self_ordering_capabilities';

export async function saveSession(sessionToken: string) {
  await storage.set(SESSION_KEY, sessionToken);
}

export function getSession() {
  return storage.get(SESSION_KEY);
}

/**
 * Server-controlled feature flags from the last `getOrderingContext` call
 * (pay_at_counter_enabled, customer_payment_enabled, delivery_enabled,
 * request_bill_enabled, ...). Drive checkout UI off these — never hardcode
 * which payment/order-type options to show.
 */
export async function getCapabilities(): Promise<Record<string, any>> {
  const raw = await storage.get(CAPABILITIES_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveCapabilities(capabilities: Record<string, any> | undefined) {
  if (!capabilities) return;
  await storage.set(CAPABILITIES_KEY, JSON.stringify(capabilities));
}

async function requireSession(): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error('No active session found.');
  return session;
}

export async function getOrderingContext(qrToken: string): Promise<Record<string, any>> {
  const response = await apiClient.post(`${BASE_PATH}.get_ordering_context`, { token: qrToken });
  const message = response.data?.message;
  if (!message) throw new Error('Invalid response format');
  if (message.session) await saveSession(message.session);
  await saveCapabilities(message.capabilities);
  return message;
}

export async function getCustomerMenu(): Promise<Record<string, any>> {
  const session = await requireSession();
  const response = await apiClient.post(`${BASE_PATH}.get_customer_menu`, { session });
  if (!response.data?.message) throw new Error('Invalid response format');
  return response.data.message;
}

export async function getCustomerProduct(itemCode: string): Promise<Record<string, any>> {
  const session = await requireSession();
  const response = await apiClient.post(`${BASE_PATH}.get_customer_product`, { session, item_code: itemCode });
  if (!response.data?.message) throw new Error('Invalid response format');
  return response.data.message;
}

/**
 * `orderType`: pass "Delivery" for a delivery order (requires the customer to
 * be signed in and `deliveryAddressName` to be one of their saved addresses).
 * Omit both for the default pickup/dine-in behavior.
 */
export async function addCustomerItems(
  items: Record<string, any>[],
  options: { orderType?: string; deliveryAddressName?: string } = {}
): Promise<Record<string, any>> {
  const session = await requireSession();
  // If the customer is signed in, attach their auth_token so the resulting
  // invoice is linked to their real account instead of an anonymous walk-in
  // customer. Anonymous checkout still works without this, except delivery,
  // which the backend requires sign-in for.
  const authToken = await getAuthToken();

  try {
    const response = await apiClient.post(`${BASE_PATH}.add_customer_items`, {
      session,
      items,
      auth_token: authToken ?? undefined,
      order_type: options.orderType,
      delivery_address: options.deliveryAddressName,
    });
    if (!response.data?.message) throw new Error('Invalid response format');
    return response.data.message;
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not place order. Please try again.'));
  }
}

export async function getCustomerOrder(): Promise<Record<string, any>> {
  const session = await requireSession();
  const response = await apiClient.post(`${BASE_PATH}.get_customer_order`, { session });
  if (!response.data?.message) throw new Error('Invalid response format');
  return response.data.message;
}

export async function getOrderStatus(): Promise<Record<string, any>> {
  const session = await requireSession();
  const response = await apiClient.post(`${BASE_PATH}.get_order_status`, { session });
  if (!response.data?.message) throw new Error('Invalid response format');
  return response.data.message;
}
