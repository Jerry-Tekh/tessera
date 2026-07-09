import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { messageFor } from '../lib/errors';
import { DEMO_CREDENTIALS, DEMO_PASSWORD } from '../lib/demoCredentials';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (ex) {
      setErr(messageFor(ex));
    } finally {
      setBusy(false);
    }
  }

  function fillDemo(email) {
    setEmail(email);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div className="reveal" style={{ maxWidth: 400, margin: '40px auto', border: '1px solid var(--border)', background: 'var(--surface)', padding: 36 }}>
      <span className="eyebrow">Welcome back</span>
      <h1 style={{ fontSize: '2.4rem', margin: '12px 0 24px' }}>Log in</h1>
      {err && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{err}</p>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 18 }}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="primary" disabled={busy} type="submit">Log in</button>
      </form>
      <div style={{ marginTop: 24, display: 'grid', gap: 10 }}>
        <span className="eyebrow">Demo roles</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8 }}>
          {DEMO_CREDENTIALS.map((demo) => (
            <button key={demo.role} type="button" onClick={() => fillDemo(demo.email)}>
              {demo.label}
            </button>
          ))}
        </div>
      </div>
      <p className="muted" style={{ marginTop: 22, fontSize: '0.9rem' }}>
        No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Create one</Link>
      </p>
    </div>
  );
}
