import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { listAllEvents, updateEvent, eventSales } from './organizerApi';

describe('organizerApi', () => {
  it('listAllEvents hits the admin route', async () => {
    server.use(http.get('/api/v1/admin/events', () => HttpResponse.json({ success: true, data: [{ id: 'e1', title: 'X', status: 'draft' }] })));
    expect((await listAllEvents())[0].id).toBe('e1');
  });

  it('updateEvent PATCHes the event', async () => {
    let body = null;
    server.use(http.patch('/api/v1/events/e1', async ({ request }) => { body = await request.json(); return HttpResponse.json({ success: true, data: { id: 'e1', status: 'published' } }); }));
    const r = await updateEvent('e1', { status: 'published' });
    expect(r.status).toBe('published');
    expect(body).toEqual({ status: 'published' });
  });

  it('eventSales fetches the sales summary', async () => {
    server.use(http.get('/api/v1/events/e1/sales', () => HttpResponse.json({ success: true, data: { eventId: 'e1', categories: [], totals: { sold: 0, revenueCents: 0 } } })));
    expect((await eventSales('e1')).eventId).toBe('e1');
  });
});
