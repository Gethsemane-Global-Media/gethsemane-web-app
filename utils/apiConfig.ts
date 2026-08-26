/**
 * Dynamic API Base URL resolver.
 * Handles localhost, LAN IP testing (e.g. 10.223.169.5 on mobile), and production domains.
 */
export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_ROOTED_API_URL) {
    return import.meta.env.VITE_ROOTED_API_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
};
