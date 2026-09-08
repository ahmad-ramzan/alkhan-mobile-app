import { apiClient } from './api-client';
import { getFrappeErrorMessage } from './frappe-error';
import { getAuthToken } from './mobile-auth-service';

const BASE_PATH = 'ury.ury.api.reservation';

export async function getBranches(): Promise<string[]> {
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.get_branches`, {});
    const message = response.data?.message;
    return Array.isArray(message) ? message.map((b) => String(b.name)) : [];
  } catch {
    return [];
  }
}

/** `reservationTime` must be "HH:mm:ss" (24-hour). */
export async function createReservation(params: {
  branch: string;
  reservationDate: Date;
  reservationTime: string;
  partySize: number;
  occasion?: string;
}): Promise<string> {
  const token = await getAuthToken();
  if (!token) throw new Error('Not logged in');

  try {
    const dateStr = params.reservationDate.toISOString().slice(0, 10);
    const response = await apiClient.post(`/api/method/${BASE_PATH}.create_reservation`, {
      auth_token: token,
      branch: params.branch,
      reservation_date: dateStr,
      reservation_time: params.reservationTime,
      party_size: params.partySize,
      occasion: params.occasion || undefined,
    });
    return response.data?.message?.reservation ?? '';
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not create reservation. Please try again.'));
  }
}

export async function listMyReservations(): Promise<Record<string, any>[]> {
  const token = await getAuthToken();
  if (!token) return [];
  try {
    const response = await apiClient.post(`/api/method/${BASE_PATH}.list_my_reservations`, { auth_token: token });
    const message = response.data?.message;
    return Array.isArray(message) ? message : [];
  } catch {
    return [];
  }
}

export async function cancelReservation(reservation: string) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not logged in');
  try {
    await apiClient.post(`/api/method/${BASE_PATH}.cancel_reservation`, { auth_token: token, reservation });
  } catch (e) {
    throw new Error(getFrappeErrorMessage(e, 'Could not cancel reservation.'));
  }
}
