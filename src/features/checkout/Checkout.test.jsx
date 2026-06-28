import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../../test/server';
import Checkout from './Checkout.jsx';

const event = { id: 'e1', title: 'X', categories: [] };
const cat = { id: 'c1', event_id: 'e1', name: 'GA', price_cents: 5000, available_quantity: 5, max_per_customer: 4 };

function renderCheckout() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><Checkout event={event} category={cat} onClose={() => {}} /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Checkout', () => {
  it('reserves, pays, and reaches the paid state', async () => {
    const future = new Date(Date.now() + 120000).toISOString();
    server.use(
      http.post('/api/v1/reservations', () => HttpResponse.json({ success: true, data: { reservation: { id: 'r1', status: 'held', expires_at: future, category_id: 'c1', quantity: 1, payment_deadline: null }, expiresAt: future } }, { status: 201 })),
      http.post('/api/v1/orders', () => HttpResponse.json({ success: true, data: { order: { id: 'o1', status: 'pending', amount_cents: 5000, created_at: '' } } }, { status: 201 })),
      http.get('/api/v1/orders/o1', () => HttpResponse.json({ success: true, data: { id: 'o1', status: 'paid', amount_cents: 5000, created_at: '', tickets: [{ id: 't1', order_id: 'o1', qr_token: 'TKN', status: 'issued' }] } })),
    );
    renderCheckout();
    await userEvent.type(screen.getByLabelText(/email/i), 'fan@b.co');
    await userEvent.click(screen.getByRole('button', { name: /reserve/i }));
    await userEvent.click(await screen.findByRole('button', { name: /pay/i }));
    expect(await screen.findByText(/paid|redirecting|finalizing/i)).toBeInTheDocument();
  });

  it('adjusts quantity (capped at max) and updates the total', async () => {
    renderCheckout();
    const inc = screen.getByRole('button', { name: /increase quantity/i });
    await userEvent.click(inc); // 2
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    await userEvent.click(inc); // 3
    await userEvent.click(inc); // 4 (max_per_customer)
    expect(inc).toBeDisabled();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });
});
