(() => {
  const role = document.currentScript.dataset.role;
  const tokenKey = 'hema_token_' + role;
  const userKey = role === 'commerciale' ? 'commercialeUser' : 'hema_client_session';
  const original = window.fetch.bind(window);
  window.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/api/')) return original(input, options);
    const headers = new Headers(options.headers);
    const token = localStorage.getItem(tokenKey);
    if (token) headers.set('Authorization', 'Bearer ' + token);
    const response = await original(input, { ...options, headers, signal: options.signal || AbortSignal.timeout(60000) });
    if (response.status === 401) {
      const result = await response.clone().json().catch(() => ({}));
      if (result.code === 'SESSION_REQUIRED') {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        window.location.reload();
      }
    }
    return response;
  };
})();
