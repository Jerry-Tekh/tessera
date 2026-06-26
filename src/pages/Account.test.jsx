import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../test/server';
import { AuthProvider } from '../lib/auth.jsx';
import Account from './Account.jsx';

function renderAccount() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <MemoryRouter><Account /></MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('Account', () => {
  it('lists active sessions and revokes one', async () => {
    let sessions = [
      { id: 's1', user_agent: 'Firefox', ip: '10.0.0.1', last_used_at: '2026-06-26T10:00:00Z', created_at: '' },
      { id: 's2', user_agent: 'Safari', ip: '10.0.0.2', last_used_at: '2026-06-26T09:00:00Z', created_at: '' },
    ];
    server.use(
      http.get('/api/v1/auth/sessions', () => HttpResponse.json({ success: true, data: sessions })),
      http.post('/api/v1/auth/sessions/s2/revoke', () => { sessions = sessions.filter((s) => s.id !== 's2'); return HttpResponse.json({ success: true, data: { ok: true } }); }),
    );
    renderAccount();
    expect(await screen.findByText(/Firefox/)).toBeInTheDocument();
    expect(screen.getByText(/Safari/)).toBeInTheDocument();
    const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
    await userEvent.click(revokeButtons[1]);
    await screen.findByText(/Firefox/);
    expect(screen.queryByText(/Safari/)).not.toBeInTheDocument();
  });
});
