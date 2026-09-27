import { API_BASE } from './utils';
// Centralize credentials for existing API callers, never for third-party URLs.
export function installAuthFetch() {
  const original = window.fetch.bind(window);
  const api = new URL(API_BASE, window.location.href);
  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
    if (url.origin !== api.origin || !(url.pathname === api.pathname || url.pathname.startsWith(api.pathname + '/'))) return original(input, options);
    const headers = new Headers(options.headers || (input instanceof Request ? input.headers : undefined));
    const token = sessionStorage.getItem('hr_token');
    if (token) headers.set('Authorization', 'Bearer ' + token);
    const response = await original(input, { ...options, headers, credentials: 'include', signal: options.signal || AbortSignal.timeout(60000) });
    if (response.status === 401 && !url.pathname.endsWith('/auth/login')) {
      const result = await response.clone().json().catch(() => ({}));
      if (result.code === 'SESSION_REQUIRED') window.dispatchEvent(new Event('hr-session-expired'));
    }
    return response;
  };
}
