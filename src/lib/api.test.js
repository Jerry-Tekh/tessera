import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { apiGet, apiPost, ApiError, setAccessToken } from './api';

describe('api client', () => {
  it('unwraps the data field on success', async () => {
    server.use(http.get('/api/v1/events/e1', () =>
      HttpResponse.json({ success: true, data: { id: 'e1' } })));
    expect(await apiGet('/events/e1')).toEqual({ id: 'e1' });
  });

  it('throws ApiError with code on failure', async () => {
    server.use(http.post('/api/v1/reservations', () =>
      HttpResponse.json({ success: false, error: { code: 'SOLD_OUT', message: 'x' } }, { status: 409 })));
    await expect(apiPost('/reservations', {})).rejects.toMatchObject({ code: 'SOLD_OUT', status: 409 });
  });

  it('sends an Idempotency-Key when asked', async () => {
    let seen = null;
    server.use(http.post('/api/v1/orders', ({ request }) => {
      seen = request.headers.get('idempotency-key');
      return HttpResponse.json({ success: true, data: {} }, { status: 201 });
    }));
    await apiPost('/orders', { reservationId: 'r1' }, { idempotency: true });
    expect(seen).toMatch(/[0-9a-f-]{36}/);
  });

  it('refreshes once on 401 and replays the original request', async () => {
    document.cookie = 'csrf=tok123';
    let first = true;
    server.use(
      http.get('/api/v1/auth/me', () => {
        if (first) { first = false; return HttpResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'expired' } }, { status: 401 }); }
        return HttpResponse.json({ success: true, data: { id: 'u1' } });
      }),
      http.post('/api/v1/auth/refresh', () => HttpResponse.json({ success: true, data: { accessToken: 'fresh' } })),
    );
    expect(await apiGet('/auth/me')).toEqual({ id: 'u1' });
    setAccessToken(null);
  });
});
