import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth.jsx';
import { listSessions, revokeSession } from '../lib/authApi';

export default function Account() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: sessions, isLoading } = useQuery({ queryKey: ['sessions'], queryFn: listSessions });
  const revoke = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  return (
    <div>
      <h1>Your account</h1>
      {user && <p style={{ color: 'var(--muted)' }}>{user.name} · {user.email} · {user.role}</p>}

      <h2 style={{ marginTop: 24 }}>Active sessions</h2>
      {isLoading && <p>Loading sessions…</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(sessions ?? []).map((s) => (
          <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', padding: 12, marginBottom: 8 }}>
            <span>{s.user_agent || 'Unknown device'} <small style={{ color: 'var(--muted)' }}>· {s.ip} · last used {s.last_used_at ? new Date(s.last_used_at).toLocaleString() : '—'}</small></span>
            <button onClick={() => revoke.mutate(s.id)} disabled={revoke.isPending}>Revoke</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
