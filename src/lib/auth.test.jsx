import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../test/server';
import { AuthProvider, useAuth } from './auth.jsx';

function Probe() {
  const { user, login } = useAuth();
  return (
    <div>
      <span>user:{user ? user.email : 'none'}</span>
      <button onClick={() => login({ email: 'a@b.co', password: 'x' })}>login</button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('starts logged out and sets the user after login', async () => {
    server.use(http.post('/api/v1/auth/login', () => HttpResponse.json({
      success: true, data: { accessToken: 'tok', user: { id: 'u1', name: 'A', email: 'a@b.co', role: 'registered_user' } },
    })));
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByText('user:none')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'login' }));
    expect(await screen.findByText('user:a@b.co')).toBeInTheDocument();
  });
});
