export const API_BASE_URL = 'http://194.60.87.92:8090';

/**
 * Bootstrap token for the self-ordering session (branch: Gulberg III, mode: pickup).
 * Ported as-is from the source app's menu screen — there is no QR-scan flow yet on
 * either side, so every session starts from this fixed pickup context.
 */
export const DEFAULT_PICKUP_TOKEN =
  'R3VsYmVyZyBJSUkgU2VsZiBPcmRlcnxQSUNLVVB8MTU5ZDAyYzIwZmYxYjUzYzA0YzE1YjhiOTJjMmFjNjMwYTQ0NTUxZDA1YjVlOTAzZjE4YTYxNTZlOTMwODRjOA';

/** Resolves a possibly-relative image path from the backend into an absolute URL. */
export function resolveImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
}
