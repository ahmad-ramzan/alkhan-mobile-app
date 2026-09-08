import { isAxiosError } from 'axios';

/**
 * Extracts the clean, customer-safe message from a Frappe error response
 * instead of surfacing a raw Python traceback to the UI. Frappe errors come
 * back either as a JSON-encoded `_server_messages` array or as an
 * `exception` string shaped like "frappe.exceptions.ValidationError: <msg>".
 */
export function getFrappeErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if (typeof record._server_messages === 'string') {
        try {
          const messages = JSON.parse(record._server_messages) as string[];
          if (messages.length > 0) {
            const first = JSON.parse(messages[0]) as { message?: string };
            if (first.message) return first.message;
          }
        } catch {
          // Fall through to fallback below.
        }
      }
      if (typeof record.exception === 'string') {
        const idx = record.exception.indexOf(': ');
        if (idx !== -1) return record.exception.slice(idx + 2);
      }
    }
  }
  return fallback;
}
