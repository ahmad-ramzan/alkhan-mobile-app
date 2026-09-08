import { apiClient } from './api-client';
import { getFrappeErrorMessage } from './frappe-error';
import { getAuthToken } from './mobile-auth-service';

const BASE_PATH = 'ury.ury.api.review';

/** Public per-item average rating + review count, keyed by item_code — guest-accessible. */
export async function getItemRatings(): Promise<Record<string, any>> {
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.get_item_ratings`, {});
    const message = response.data?.message;
    return message && typeof message === 'object' ? message : {};
  } catch {
    return {};
  }
}

export async function listMyReviews(): Promise<Record<string, any>[]> {
  const token = await getAuthToken();
  if (!token) return [];
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.list_my_reviews`, { auth_token: token });
    const message = response.data?.message;
    return Array.isArray(message) ? message : [];
  } catch {
    return [];
  }
}

export async function getReview(invoice: string): Promise<Record<string, any> | null> {
  const token = await getAuthToken();
  if (!token) return null;
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.get_review`, { auth_token: token, invoice });
    const message = response.data?.message;
    return message && typeof message === 'object' ? message : null;
  } catch {
    return null;
  }
}

/**
 * `itemRatings` is a list of {item_code, rating} — only items actually
 * included in `invoice` end up saved; anything else is dropped server-side.
 */
export async function submitReview(params: {
  invoice: string;
  overallRating: number;
  reviewText?: string;
  itemRatings?: { item_code: string; rating: number }[];
}) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not logged in');
  try {
    await apiClient.post(`/api/method/${BASE_PATH}.submit_review`, {
      auth_token: token,
      invoice: params.invoice,
      overall_rating: params.overallRating,
      review_text: params.reviewText || undefined,
      item_ratings: JSON.stringify(params.itemRatings ?? []),
    });
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not submit review. Please try again.'));
  }
}
