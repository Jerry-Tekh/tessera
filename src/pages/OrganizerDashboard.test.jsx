import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../test/server';
import OrganizerDashboard from './OrganizerDashboard.jsx';

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><OrganizerDashboard /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OrganizerDashboard', () => {
  it('lists events and creates a new one', async () => {
    let events = [{ id: 'e1', title: 'Existing', status: 'draft', starts_at: null }];
    server.use(
      http.get('/api/v1/admin/events', () => HttpResponse.json({ success: true, data: events })),
      http.post('/api/v1/events', async ({ request }) => {
        const b = await request.json();
        const ev = { id: 'e2', title: b.title, status: b.status ?? 'draft', starts_at: null };
        events = [ev, ...events];
        return HttpResponse.json({ success: true, data: ev }, { status: 201 });
      }),
    );
    renderPage();
    expect(await screen.findByText('Existing')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/event title/i), 'Brand New');
    await userEvent.click(screen.getByRole('button', { name: /create event/i }));
    expect(await screen.findByText('Brand New')).toBeInTheDocument();
  });
});
