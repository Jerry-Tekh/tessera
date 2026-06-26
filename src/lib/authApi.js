import { apiGet, apiPost } from './api';

export const login = (creds) => apiPost('/auth/login', creds);
export const register = (info) => apiPost('/auth/register', info);
export const logout = () => apiPost('/auth/logout', {});
export const me = () => apiGet('/auth/me');
export const listSessions = () => apiGet('/auth/sessions');
export const revokeSession = (id) => apiPost(`/auth/sessions/${id}/revoke`, {});
