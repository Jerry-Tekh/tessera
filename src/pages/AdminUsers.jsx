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
    <div className="page reveal">
      <header className="page-hero">
        <span className="eyebrow">Super admin</span>
        <h1>Users</h1>
        <p>Review account roles and update access levels for the platform.</p>
      </header>
      {message && (
        <p role="status" className={`alert ${message.ok ? 'ok' : 'danger'}`}>
          {message.text}
        </p>
      )}

      {isLoading ? <p className="muted">Loading users…</p> : (
        <section className="table-card card">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {(users ?? []).map((u) => {
            const nextRole = pendingRoles[u.id] ?? u.role;
            return (
              <tr key={u.id}>
                <td><strong>{u.name}</strong><span className="mono muted" style={{ display: 'block', fontSize: '0.72rem' }}>{u.id}</span></td>
                <td>{u.email}</td>
                <td>
                <label>
                  Role
                  <select value={nextRole} onChange={(e) => setPendingRoles((prev) => ({ ...prev, [u.id]: e.target.value }))}>
                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </label>
                </td>
                <td>
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
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
        </section>
      )}
    </div>
  );
}
