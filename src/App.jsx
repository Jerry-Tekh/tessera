import { Routes, Route, Link } from 'react-router-dom';
import Browse from './pages/Browse.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Confirmation from './pages/Confirmation.jsx';

export default function App() {
  return (
    <>
      <header style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', letterSpacing: 2, color: 'var(--accent)' }}>
        <Link to="/">TESSERA</Link>
      </header>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/orders/:id" element={<Confirmation />} />
        </Routes>
      </main>
    </>
  );
}
