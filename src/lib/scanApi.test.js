import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { listScannableEvents, scanTicket } from './scanApi';

describe('scanApi', () => {
  it('lists events assigned to the current staff user', async () => {
    server.use(http.get('/api/v1/staff/events', () => HttpResponse.json({
      success: true,
      data: [{ id: 'e1', title: 'Gate Night' }],
    })));
    expect((await listScannableEvents())[0].id).toBe('e1');
  });

  it('posts scan tokens to the event scanner endpoint', async () => {
    let body = null;
    server.use(http.post('/api/v1/events/e1/scan', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ success: true, data: { result: 'accepted' } });
    }));
    expect((await scanTicket('e1', 'QR-TOKEN')).result).toBe('accepted');
    expect(body).toEqual({ token: 'QR-TOKEN' });
  });
});
