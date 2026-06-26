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
    <form onSubmit={onSubmit} style={{ maxWidth: 360, display: 'grid', gap: 12 }}>
      <h1>Create account</h1>
      {err && <p style={{ color: '#f87171' }}>{err}</p>}
      <label>Name<br /><input value={name} onChange={(e) => setName(e.target.value)} required /></label>
      <label>Email<br /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<br /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} /></label>
      <button className="primary" disabled={busy} type="submit">Create account</button>
      <p style={{ color: 'var(--muted)' }}>Have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link></p>
    </form>
  );
}
