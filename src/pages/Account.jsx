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
    <div className="reveal" style={{ maxWidth: 720 }}>
      <span className="eyebrow">Your account</span>
      <h1 style={{ marginTop: 12 }}>{user ? user.name : 'Account'}</h1>
      {user && (
        <p className="mono muted" style={{ fontSize: '0.84rem' }}>
          {user.email} · <span className="badge" style={{ marginLeft: 4 }}>{user.role}</span>
        </p>
      )}

      <h2 style={{ marginTop: 40 }}>Active sessions</h2>
      <hr className="rule" style={{ margin: '14px 0' }} />
      {isLoading && <p className="muted">Loading sessions…</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {(sessions ?? []).map((s) => (
          <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 2px', borderBottom: '1px solid var(--border)' }}>
            <span>
              <span style={{ fontWeight: 600 }}>{s.user_agent || 'Unknown device'}</span>
              <span className="mono muted" style={{ display: 'block', fontSize: '0.74rem', marginTop: 3 }}>
                {s.ip} · last used {s.last_used_at ? new Date(s.last_used_at).toLocaleString() : '—'}
              </span>
            </span>
            <button onClick={() => revoke.mutate(s.id)} disabled={revoke.isPending}>Revoke</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
