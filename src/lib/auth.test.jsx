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

// Bootstrap (me → refresh) resolves to logged-out.
function loggedOutBootstrap() {
  server.use(
    http.get('/api/v1/auth/me', () => HttpResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'no' } }, { status: 401 })),
    http.post('/api/v1/auth/refresh', () => HttpResponse.json({ success: false, error: { code: 'INVALID_REFRESH', message: 'no' } }, { status: 401 })),
  );
}

describe('AuthProvider', () => {
  it('starts logged out and sets the user after login', async () => {
    loggedOutBootstrap();
    server.use(http.post('/api/v1/auth/login', () => HttpResponse.json({
      success: true, data: { accessToken: 'tok', user: { id: 'u1', name: 'A', email: 'a@b.co', role: 'registered_user' } },
    })));
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByText('user:none')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'login' }));
    expect(await screen.findByText('user:a@b.co')).toBeInTheDocument();
  });

  it('rehydrates the session on load via me() (refreshing if needed)', async () => {
    document.cookie = 'csrf=tok123';
    let firstMe = true;
    server.use(
      http.get('/api/v1/auth/me', () => {
        if (firstMe) { firstMe = false; return HttpResponse.json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'expired' } }, { status: 401 }); }
        return HttpResponse.json({ success: true, data: { id: 'u1', name: 'A', email: 'a@b.co', role: 'registered_user' } });
      }),
      http.post('/api/v1/auth/refresh', () => HttpResponse.json({ success: true, data: { accessToken: 'fresh' } })),
    );
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(await screen.findByText('user:a@b.co')).toBeInTheDocument();
  });
});
