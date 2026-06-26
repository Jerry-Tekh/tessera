import { createContext, useContext, useState } from 'react';
import { setAccessToken } from './api';
import * as authApi from './authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

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

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
