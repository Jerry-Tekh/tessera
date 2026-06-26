import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../test/server';
import MyTickets from './MyTickets.jsx';

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><MyTickets /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('MyTickets', () => {
  it('lists the user orders with event title and a QR per ticket', async () => {
    server.use(http.get('/api/v1/orders', () => HttpResponse.json({
      success: true, data: [{
        id: 'o1', amount_cents: 2000, status: 'paid', created_at: '', quantity: 2,
        category_name: 'GA', event_id: 'e1', event_title: 'My Show', event_starts_at: null,
        tickets: [{ id: 't1', order_id: 'o1', qr_token: 'A', status: 'issued' }, { id: 't2', order_id: 'o1', qr_token: 'B', status: 'issued' }],
      }],
    })));
    renderPage();
    expect(await screen.findByText('My Show')).toBeInTheDocument();
    expect(screen.getByText(/\$20\.00/)).toBeInTheDocument();
    expect(await screen.findAllByRole('img', { name: /ticket/i })).toHaveLength(2);
  });

  it('shows an empty state when there are no orders', async () => {
    server.use(http.get('/api/v1/orders', () => HttpResponse.json({ success: true, data: [] })));
    renderPage();
    expect(await screen.findByText(/no tickets yet/i)).toBeInTheDocument();
  });
});
