import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';
import { login, register, me, listSessions, revokeSession } from './authApi';

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

  it('listSessions returns the session array', async () => {
    server.use(http.get('/api/v1/auth/sessions', () => HttpResponse.json({
      success: true, data: [{ id: 's1', user_agent: 'UA', ip: '127.0.0.1', last_used_at: '', created_at: '' }],
    })));
    const rows = await listSessions();
    expect(rows[0].id).toBe('s1');
  });

  it('revokeSession posts to the revoke endpoint', async () => {
    let hit = false;
    server.use(http.post('/api/v1/auth/sessions/s1/revoke', () => { hit = true; return HttpResponse.json({ success: true, data: { ok: true } }); }));
    await revokeSession('s1');
    expect(hit).toBe(true);
  });
});
