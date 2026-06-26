import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { messageFor } from '../lib/errors';

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

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, display: 'grid', gap: 12 }}>
      <h1>Log in</h1>
      {err && <p style={{ color: '#f87171' }}>{err}</p>}
      <label>Email<br /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<br /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      <button className="primary" disabled={busy} type="submit">Log in</button>
      <p style={{ color: 'var(--muted)' }}>No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link></p>
    </form>
  );
}
