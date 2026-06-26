import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { login, register, me } from './authApi';

describe('authApi', () => {
  it('login returns accessToken and user', async () => {
    server.use(http.post('/api/v1/auth/login', () => HttpResponse.json({
      success: true, data: { accessToken: 'tok', user: { id: 'u1', name: 'A', email: 'a@b.co', role: 'registered_user' } },
    })));
    const r = await login({ email: 'a@b.co', password: 'x' });
    expect(r.accessToken).toBe('tok');
    expect(r.user.email).toBe('a@b.co');
  });

  it('register posts name/email/password', async () => {
    let body = null;
    server.use(http.post('/api/v1/auth/register', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ success: true, data: { accessToken: 't', user: { id: 'u1', name: 'A', email: 'a@b.co', role: 'registered_user' } } }, { status: 201 });
    }));
    await register({ name: 'A', email: 'a@b.co', password: 'password1234' });
    expect(body).toEqual({ name: 'A', email: 'a@b.co', password: 'password1234' });
  });

  it('me returns the current user', async () => {
    server.use(http.get('/api/v1/auth/me', () => HttpResponse.json({
      success: true, data: { id: 'u1', name: 'A', email: 'a@b.co', role: 'registered_user' },
    })));
    expect((await me()).id).toBe('u1');
  });
});
