import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { messageFor } from '../lib/errors';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (ex) {
      setErr(messageFor(ex));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="reveal" style={{ maxWidth: 400, margin: '40px auto', border: '1px solid var(--border)', background: 'var(--surface)', padding: 36 }}>
      <span className="eyebrow">Join Tessera</span>
      <h1 style={{ fontSize: '2.4rem', margin: '12px 0 24px' }}>Create account</h1>
      {err && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{err}</p>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 18 }}>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} /></label>
        <button className="primary" disabled={busy} type="submit">Create account</button>
      </form>
      <p className="muted" style={{ marginTop: 22, fontSize: '0.9rem' }}>
        Have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
      </p>
    </div>
  );
}
