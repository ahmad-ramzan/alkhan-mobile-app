import { apiClient } from './api-client';

const BASE_PATH = 'ury.ury.api.offers';

/** Public promo-code listing — guest-accessible, same trust level as the menu itself. */
export async function listActiveOffers(): Promise<Record<string, any>[]> {
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.list_active_offers`, {});
    const message = response.data?.message;
    return Array.isArray(message) ? message : [];
  } catch {
    return [];
  }
}
