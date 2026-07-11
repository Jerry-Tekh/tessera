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
import AdminUsers from './pages/AdminUsers.jsx';
import SystemHealth from './components/SystemHealth.jsx';
import { RequireAuth, RequireRole } from './components/RouteGuards.jsx';
import logoTicUrl from './assets/logoTic.jfif?url';

function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const link = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;
  return (
    <>
      <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Menu</button>
      <div className={`nav ${open ? 'open' : ''}`}>
        {user ? (
          <>
            {(user.role === 'organizer' || user.role === 'super_admin') && <NavLink to="/organizer" className={link} onClick={close}>Organizer</NavLink>}
            {(user.role === 'event_staff' || user.role === 'super_admin') && <NavLink to="/scan" className={link} onClick={close}>Scan</NavLink>}
            {user.role === 'super_admin' && <NavLink to="/admin/users" className={link} onClick={close}>Users</NavLink>}
            <NavLink to="/tickets" className={link} onClick={close}>My tickets</NavLink>
            <NavLink to="/account" className={link} onClick={close}>Account</NavLink>
            <span className="nav-email">{user.email}</span>
            <button className="ghost" onClick={async () => { close(); await logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <NavLink to="/login" className={link} onClick={close}>Log in</NavLink>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
        <Link to="/" className="brand">
          <img className="brand-logo" src={logoTicUrl} alt="" aria-hidden="true" />
          <span className="brand-name">Tessera</span>
        </Link>
        <Nav />
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/orders/:id" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="/tickets" element={<RequireAuth><MyTickets /></RequireAuth>} />
          <Route path="/organizer" element={<RequireRole roles={['organizer', 'super_admin']}><OrganizerDashboard /></RequireRole>} />
          <Route path="/organizer/events/:id" element={<RequireRole roles={['organizer', 'super_admin']}><OrganizerEvent /></RequireRole>} />
          <Route path="/scan" element={<RequireRole roles={['event_staff', 'super_admin']}><Scanner /></RequireRole>} />
          <Route path="/admin/users" element={<RequireRole roles={['super_admin']}><AdminUsers /></RequireRole>} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner">
        <span className="eyebrow">Tessera Live Events</span>
        <SystemHealth />
        </div>
      </footer>
    </div>
  );
}
