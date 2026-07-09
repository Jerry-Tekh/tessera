import { useState } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Browse from './pages/Browse.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';
import MyTickets from './pages/MyTickets.jsx';
import OrganizerDashboard from './pages/OrganizerDashboard.jsx';
import OrganizerEvent from './pages/OrganizerEvent.jsx';
import Scanner from './pages/Scanner.jsx';

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const link = ({ isActive }) => ({
    fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
    color: isActive ? 'var(--accent)' : 'var(--muted)', paddingBottom: 2,
    borderBottom: isActive ? '1px solid var(--accent)' : '1px solid transparent',
  });
  return (
    <>
      <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>☰</button>
      <div className={`nav ${open ? 'open' : ''}`}>
        {user ? (
          <>
            {(user.role === 'organizer' || user.role === 'super_admin') && <NavLink to="/organizer" style={link} onClick={close}>Organizer</NavLink>}
            {(user.role === 'event_staff' || user.role === 'super_admin') && <NavLink to="/scan" style={link} onClick={close}>Scan</NavLink>}
            <NavLink to="/tickets" style={link} onClick={close}>My tickets</NavLink>
            <NavLink to="/account" style={link} onClick={close}>Account</NavLink>
            <span className="mono" style={{ color: 'var(--faint)', fontSize: '0.74rem' }}>{user.email}</span>
            <button onClick={async () => { close(); await logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <NavLink to="/login" style={link} onClick={close}>Log in</NavLink>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 28px', borderBottom: '1px solid var(--border)',
        background: 'rgba(10,10,11,0.72)', backdropFilter: 'blur(12px)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 11, height: 11, background: 'var(--accent)', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 600, letterSpacing: '0.02em' }}>Tessera</span>
        </Link>
        <Nav />
      </header>
      <main style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '40px 28px 80px' }}>
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/orders/:id" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/events/:id" element={<OrganizerEvent />} />
          <Route path="/scan" element={<Scanner />} />
        </Routes>
      </main>
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px', textAlign: 'center' }}>
        <span className="eyebrow">Tessera — Live Events</span>
      </footer>
    </>
  );
}
