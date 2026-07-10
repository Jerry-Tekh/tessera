import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../test/server';
import AdminUsers from './AdminUsers.jsx';

function renderAdminUsers() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><AdminUsers /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminUsers', () => {
  it('lists users and updates a role', async () => {
    let users = [
      { id: 'u1', name: 'Ada', email: 'ada@tessera.local', role: 'registered_user', created_at: '' },
      { id: 'u2', name: 'Ola', email: 'ola@tessera.local', role: 'event_staff', created_at: '' },
    ];
    let roleBody = null;
    server.use(
      http.get('/api/v1/admin/users', () => HttpResponse.json({ success: true, data: users })),
      http.patch('/api/v1/admin/users/u1/role', async ({ request }) => {
        roleBody = await request.json();
        users = users.map((user) => (user.id === 'u1' ? { ...user, role: roleBody.role } : user));
        return HttpResponse.json({ success: true, data: users[0] });
      }),
    );

    renderAdminUsers();
    expect(await screen.findByText('ada@tessera.local')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getAllByLabelText(/role/i)[0], 'organizer');
    await userEvent.click(screen.getAllByRole('button', { name: /save/i })[0]);

    expect(await screen.findByText(/user role updated/i)).toBeInTheDocument();
    expect(roleBody).toEqual({ role: 'organizer' });
  });
});
