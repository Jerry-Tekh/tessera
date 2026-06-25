import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../test/server';
import Browse from './Browse.jsx';

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><Browse /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Browse', () => {
  it('renders event cards from GET /events', async () => {
    server.use(http.get('/api/v1/events', () => HttpResponse.json({
      success: true,
      data: [{ id: 'e1', title: 'Midnight Symphony', location: 'Royal Hall', starts_at: '2026-07-12T20:00:00Z', status: 'published', description: null, created_at: '' }],
      meta: { page: 1, pageSize: 20, count: 1 },
    })));
    renderPage();
    expect(await screen.findByText('Midnight Symphony')).toBeInTheDocument();
  });
});
