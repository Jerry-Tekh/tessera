import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { apiGet, apiPost, ApiError } from './api';

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
});
