import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Browse from './pages/Browse.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 14 }}>
      {user ? (
        <>
          <Link to="/account" style={{ color: 'var(--accent)' }}>Account</Link>
          <span style={{ color: 'var(--muted)' }}>{user.email}</span>
          <button onClick={async () => { await logout(); navigate('/'); }}>Log out</button>
        </>
      ) : (
        <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ letterSpacing: 2, color: 'var(--accent)' }}>TESSERA</Link>
        <Nav />
      </header>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/orders/:id" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </main>
    </>
  );
}
