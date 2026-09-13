/**
 * Dynamic API Base URL resolver.
 * Supports VITE_ROOTED_API_URL, VITE_API_BASE_URL, and VITE_BACKEND_URL with
 * automatic sanitization (removes trailing slashes, appends /api/v1 if omitted).
 */
export const getApiBaseUrl = (): string => {
  const rawUrl =
    import.meta.env.VITE_ROOTED_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL;

  if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '') {
    const trimmed = rawUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }

  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Production domain automatic inference
    if (hostname.includes('gethsemaneglobal.org')) {
      return 'https://rooted.gethsemaneglobal.org/api/v1';
    }

    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
    if (isLocal) {
      return `${protocol}//${hostname}:8000/api/v1`;
    }

    // Default production fallback (same origin)
    return `${window.location.origin}/api/v1`;
  }

  return 'http://localhost:8000/api/v1';
};
