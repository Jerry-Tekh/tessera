import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import {
  assignEventStaff,
  eventRefundRequests,
  eventSales,
  listAllEvents,
  listEventStaff,
  removeEventStaff,
  reviewRefundRequest,
  updateCategory,
  updateEvent,
} from './organizerApi';

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

  it('updates ticket categories', async () => {
    let body = null;
    server.use(http.patch('/api/v1/events/e1/categories/c1', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ success: true, data: { id: 'c1', total_quantity: body.totalQuantity } });
    }));
    expect((await updateCategory('e1', 'c1', { totalQuantity: 12 })).total_quantity).toBe(12);
    expect(body).toEqual({ totalQuantity: 12 });
  });

  it('manages event staff assignments', async () => {
    let assigned = false;
    let removed = false;
    server.use(
      http.get('/api/v1/events/e1/staff', () => HttpResponse.json({ success: true, data: [{ id: 'u1', email: 'staff@b.co' }] })),
      http.post('/api/v1/events/e1/staff', async ({ request }) => {
        assigned = (await request.json()).email === 'staff@b.co';
        return HttpResponse.json({ success: true, data: { id: 'u1' } }, { status: 201 });
      }),
      http.delete('/api/v1/events/e1/staff/u1', () => {
        removed = true;
        return HttpResponse.json({ success: true, data: { ok: true } });
      }),
    );
    expect((await listEventStaff('e1'))[0].id).toBe('u1');
    await assignEventStaff('e1', 'staff@b.co');
    await removeEventStaff('e1', 'u1');
    expect(assigned).toBe(true);
    expect(removed).toBe(true);
  });

  it('reviews event refund requests', async () => {
    let reviewBody = null;
    server.use(
      http.get('/api/v1/events/e1/refund-requests', () => HttpResponse.json({ success: true, data: [{ id: 'rr1', status: 'pending' }] })),
      http.patch('/api/v1/refund-requests/rr1', async ({ request }) => {
        reviewBody = await request.json();
        return HttpResponse.json({ success: true, data: { id: 'rr1', status: 'approved' } });
      }),
    );
    expect((await eventRefundRequests('e1'))[0].id).toBe('rr1');
    expect((await reviewRefundRequest('rr1', { decision: 'approve' })).status).toBe('approved');
    expect(reviewBody).toEqual({ decision: 'approve' });
  });
});
