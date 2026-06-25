import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../test/server';
import EventDetail from './EventDetail.jsx';

function renderAt(id) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/events/${id}`]}>
        <Routes><Route path="/events/:id" element={<EventDetail />} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('EventDetail', () => {
  it('shows categories with prices and a disabled buy button when sold out', async () => {
    server.use(http.get('/api/v1/events/e1', () => HttpResponse.json({
      success: true, data: {
        id: 'e1', title: 'Midnight Symphony', location: 'Royal Hall', starts_at: null, status: 'published', description: null, created_at: '',
        categories: [{ id: 'c1', event_id: 'e1', name: 'GA', price_cents: 5000, total_quantity: 10, available_quantity: 0, sales_open_at: null, sales_close_at: null, max_per_customer: 4 }],
      },
    })));
    renderAt('e1');
    expect(await screen.findByText('GA', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled();
  });
});
