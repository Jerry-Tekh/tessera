import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listUsers, updateUserRole } from '../lib/authApi';
import { messageFor } from '../lib/errors';

const ROLES = ['super_admin', 'organizer', 'event_staff', 'registered_user'];

export default function AdminUsers() {
  const qc = useQueryClient();
  const [pendingRoles, setPendingRoles] = useState({});
  const [message, setMessage] = useState(null);
  const { data: users, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: listUsers });
  const roleChange = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: (_user, variables) => {
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
      setMessage({ ok: true, text: 'User role updated.' });
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e) => setMessage({ ok: false, text: messageFor(e) }),
  });

  return (
    <div className="reveal">
      <span className="eyebrow">Super admin</span>
      <h1 style={{ marginTop: 12 }}>Users</h1>
      {message && (
        <p role="status" style={{ marginBottom: 18, color: message.ok ? 'var(--accent)' : 'var(--danger)' }}>
          {message.text}
        </p>
      )}

      {isLoading ? <p className="muted">Loading users…</p> : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {(users ?? []).map((u) => {
            const nextRole = pendingRoles[u.id] ?? u.role;
            return (
              <li
                key={u.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                  gap: 14,
                  alignItems: 'center',
                  padding: '16px 2px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span>
                  <span style={{ fontWeight: 700 }}>{u.name}</span>
                  <span className="mono muted" style={{ display: 'block', fontSize: '0.76rem', marginTop: 3 }}>
                    {u.email}
                  </span>
                </span>
                <label>
                  Role
                  <select value={nextRole} onChange={(e) => setPendingRoles((prev) => ({ ...prev, [u.id]: e.target.value }))}>
                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={nextRole === u.role || roleChange.isPending}
                  onClick={() => {
                    setMessage(null);
                    roleChange.mutate({ id: u.id, role: nextRole });
                  }}
                >
                  Save
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
