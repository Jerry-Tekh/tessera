import axios from 'axios';

let accessToken = null;
export function setAccessToken(t) { accessToken = t; }

export class ApiError extends Error {
  constructor(code, status, message) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const http = axios.create({ baseURL: '/api/v1', withCredentials: true });

// Attach bearer token when present.
http.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Unwrap the { success, data } envelope; turn { success:false } and transport
// failures into a typed ApiError.
http.interceptors.response.use(
  (res) => {
    if (res.data && res.data.success === false) {
      const e = res.data.error || {};
      throw new ApiError(e.code || 'UNKNOWN', res.status, e.message || 'Error');
    }
    return res.data?.data;
  },
  (err) => {
    const res = err.response;
    const e = res?.data?.error;
    throw new ApiError(e?.code || 'NETWORK', res?.status || 0, e?.message || err.message);
  },
);

export const apiGet = (path) => http.get(path);

export const apiPost = (path, body, opts = {}) =>
  http.post(path, body, opts.idempotency ? { headers: { 'Idempotency-Key': crypto.randomUUID() } } : undefined);
