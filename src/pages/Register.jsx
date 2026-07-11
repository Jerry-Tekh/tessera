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
    <div className="auth-wrap reveal">
      <section className="auth-card panel">
        <span className="eyebrow">Join Zireva</span>
        <h1 style={{ fontSize: '2.2rem', marginTop: 10 }}>Create account</h1>
        {err && <p className="alert danger" style={{ marginTop: 16 }}>{err}</p>}
        <form onSubmit={onSubmit} className="stack" style={{ marginTop: 22 }}>
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} /></label>
          <button className="primary" disabled={busy} type="submit">{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="muted" style={{ marginTop: 22, fontSize: '0.9rem' }}>
          Have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 800 }}>Log in</Link>
        </p>
      </section>
    </div>
  );
}
