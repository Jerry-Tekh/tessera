import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

// Mock the camera library: start() immediately reports one decoded token.
vi.mock('html5-qrcode', () => ({
  Html5Qrcode: class {
    async start(_camera, _config, onSuccess) { onSuccess('CAM-TOKEN'); }
    async stop() {}
    clear() {}
  },
}));
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../test/server';
import Scanner from './Scanner.jsx';

function renderScanner() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><Scanner /></MemoryRouter>
    </QueryClientProvider>,
  );
}

function mockEvents() {
  server.use(http.get('/api/v1/events', () => HttpResponse.json({ success: true, data: [{ id: 'e1', title: 'Gate Night', location: 'Hall' }] })));
}

async function fillAndScan(token) {
  const tokenInput = screen.getByLabelText(/ticket code/i);
  await userEvent.clear(tokenInput);
  await userEvent.type(tokenInput, token);
  await userEvent.click(screen.getByRole('button', { name: /scan/i }));
}

describe('Scanner', () => {
  it('admits a valid ticket then rejects a duplicate', async () => {
    mockEvents();
    server.use(
      http.post('/api/v1/events/e1/scan', () => HttpResponse.json({ success: true, data: { result: 'accepted', ticketId: 't1' } })),
    );
    renderScanner();
    await userEvent.type(screen.getByLabelText(/event id/i), 'e1');
    await fillAndScan('TKN');
    expect(await screen.findByText(/admitted/i)).toBeInTheDocument();

    server.use(
      http.post('/api/v1/events/e1/scan', () => HttpResponse.json(
        { success: false, error: { code: 'TICKET_ALREADY_USED', message: 'used' } }, { status: 409 })),
    );
    await fillAndScan('TKN');
    expect(await screen.findByText(/already scanned/i)).toBeInTheDocument();
  });

  it('scans via the camera and admits', async () => {
    mockEvents();
    server.use(http.post('/api/v1/events/e1/scan', () => HttpResponse.json({ success: true, data: { result: 'accepted' } })));
    renderScanner();
    await screen.findByRole('option', { name: /gate night/i });
    await userEvent.selectOptions(await screen.findByLabelText(/^event$/i), 'e1');
    await userEvent.click(screen.getByRole('button', { name: /use camera/i }));
    expect(await screen.findByText(/admitted/i)).toBeInTheDocument();
  });
});
