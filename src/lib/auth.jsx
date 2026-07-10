import { createContext, useContext, useEffect, useState } from 'react';
import { setAccessToken } from './api';
import * as authApi from './authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate on load: the access token lives only in memory, but the refresh token is an
  // httpOnly cookie. me() will 401, the api client silently refreshes from the cookie and
  // retries; if there's no valid session the refresh fails and we stay logged out.
  useEffect(() => {
    let active = true;
    authApi.me()
      .then((u) => { if (active) setUser(u); })
      .catch(() => { /* not signed in */ })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function login(creds) {
    const r = await authApi.login(creds);
    setAccessToken(r.accessToken);
    setUser(r.user);
    return r.user;
  }

  async function register(info) {
    const r = await authApi.register(info);
    setAccessToken(r.accessToken);
    setUser(r.user);
    return r.user;
  }

  async function logout() {
    try { await authApi.logout(); } catch { /* best-effort */ }
    setAccessToken(null);
    setUser(null);
  }

  function replaceUser(nextUser) {
    setUser(nextUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, replaceUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
