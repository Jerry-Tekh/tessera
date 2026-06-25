import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../test/server';
import Confirmation from './Confirmation.jsx';

function renderAt(id) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/orders/${id}`]}>
        <Routes><Route path="/orders/:id" element={<Confirmation />} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Confirmation', () => {
  it('shows the order total and one ticket image per ticket', async () => {
    server.use(http.get('/api/v1/orders/o1', () => HttpResponse.json({
      success: true, data: { id: 'o1', status: 'paid', amount_cents: 5000, created_at: '', tickets: [{ id: 't1', order_id: 'o1', qr_token: 'TKN', status: 'issued' }] },
    })));
    renderAt('o1');
    expect(await screen.findByText(/\$50\.00/)).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: /ticket/i })).toBeInTheDocument();
  });
});
