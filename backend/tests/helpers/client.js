// =============================================
// MINIMAL COOKIE-JAR HTTP CLIENT FOR INTEGRATION TESTS
//
// Node's global fetch does not persist cookies across requests, so
// each Client instance keeps its own jar — mirroring one browser
// session. Each simulated user (Learner A, Learner B, Admin,
// anonymous) gets its own Client instance.
// =============================================
import { BASE_URL } from './setup.js';

export class Client {
  #cookies = new Map();
  #csrfToken = null;

  #applySetCookies(res) {
    const setCookies = res.headers.getSetCookie?.() || [];
    for (const raw of setCookies) {
      const [pair] = raw.split(';');
      const idx = pair.indexOf('=');
      const name = pair.slice(0, idx);
      const value = pair.slice(idx + 1);
      this.#cookies.set(name, value);
    }
  }

  #cookieHeader() {
    return [...this.#cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const cookieHeader = this.#cookieHeader();
    if (cookieHeader) headers.Cookie = cookieHeader;
    if (this.#csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      headers['X-CSRF-Token'] = this.#csrfToken;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    this.#applySetCookies(res);

    let json = null;
    try { json = await res.json(); } catch { /* no body */ }
    return { status: res.status, body: json };
  }

  get(path) { return this.request('GET', path); }
  post(path, body) { return this.request('POST', path, body); }
  patch(path, body) { return this.request('PATCH', path, body); }
  delete(path) { return this.request('DELETE', path); }

  setCsrfToken(token) { this.#csrfToken = token; }

  async initCsrf() {
    const res = await this.get('/api/auth/csrf');
    this.#csrfToken = res.body.data.csrfToken;
    return this.#csrfToken;
  }

  async login(email, password, rememberMe = false) {
    if (!this.#csrfToken) await this.initCsrf();
    const res = await this.post('/api/auth/login', { email, password, rememberMe });
    if (res.body?.data?.csrfToken) this.#csrfToken = res.body.data.csrfToken;
    return res;
  }

  clearCookies() { this.#cookies.clear(); this.#csrfToken = null; }
}
