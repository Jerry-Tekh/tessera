import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/auth.jsx';
import { changePassword, listSessions, revokeSession, updateMe } from '../lib/authApi';
import { messageFor } from '../lib/errors';

export default function Account() {
  const { user, replaceUser } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const { data: sessions, isLoading } = useQuery({ queryKey: ['sessions'], queryFn: listSessions });

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
  }, [user]);

  const saveProfile = useMutation({
    mutationFn: () => updateMe({ name, email }),
    onSuccess: (nextUser) => {
      replaceUser(nextUser);
      setProfileMessage({ ok: true, text: 'Profile updated.' });
    },
    onError: (e) => setProfileMessage({ ok: false, text: messageFor(e) }),
  });

  const savePassword = useMutation({
    mutationFn: () => changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage({ ok: true, text: 'Password updated.' });
    },
    onError: (e) => setPasswordMessage({ ok: false, text: messageFor(e) }),
  });

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

      <section style={{ marginTop: 34, padding: 20, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <h2>Profile</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setProfileMessage(null);
            saveProfile.mutate();
          }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, alignItems: 'end', marginTop: 16 }}
        >
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <button className="primary" type="submit" disabled={!name || !email || saveProfile.isPending}>Save profile</button>
        </form>
        {profileMessage && (
          <p role="status" style={{ marginTop: 12, color: profileMessage.ok ? 'var(--accent)' : 'var(--danger)' }}>
            {profileMessage.text}
          </p>
        )}
      </section>

      <section style={{ marginTop: 20, padding: 20, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <h2>Password</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPasswordMessage(null);
            savePassword.mutate();
          }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, alignItems: 'end', marginTop: 16 }}
        >
          <label>Current password<input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></label>
          <label>New password<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={10} /></label>
          <button type="submit" disabled={!currentPassword || !newPassword || savePassword.isPending}>Change password</button>
        </form>
        {passwordMessage && (
          <p role="status" style={{ marginTop: 12, color: passwordMessage.ok ? 'var(--accent)' : 'var(--danger)' }}>
            {passwordMessage.text}
          </p>
        )}
      </section>

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
