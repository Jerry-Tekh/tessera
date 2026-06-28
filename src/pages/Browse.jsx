import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { heroFor } from '../lib/images';

const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA');

export default function Browse() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events', 1],
    queryFn: () => apiGet('/events?page=1&pageSize=20'),
  });

  return (
    <div>
      <header className="reveal" style={{ marginBottom: 40, maxWidth: 760 }}>
        <span className="eyebrow">Now on sale</span>
        <h1 style={{ marginTop: 14 }}>Nights worth<br />remembering.</h1>
        <p className="muted" style={{ fontSize: '1.05rem', maxWidth: 520 }}>
          Concerts, festivals and one-off happenings. Secure seats in seconds — guest checkout, instant QR tickets.
        </p>
      </header>

      {isLoading && <p className="muted">Loading events…</p>}
      {error && <p className="muted">Could not load events.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 22 }}>
        {(data ?? []).map((ev, i) => (
          <Link
            key={ev.id}
            to={`/events/${ev.id}`}
            className="reveal"
            style={{ display: 'block', position: 'relative', aspectRatio: '4 / 5', overflow: 'hidden', border: '1px solid var(--border)', animationDelay: `${i * 70}ms` }}
          >
            <img src={heroFor(ev.id)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .6s cubic-bezier(.2,.7,.2,1)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,11,0.92) 8%, rgba(10,10,11,0.25) 45%, rgba(10,10,11,0.05) 100%)' }} />
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.08em' }}>
                {fmtDate(ev.starts_at)}{ev.location ? `  ·  ${ev.location}` : ''}
              </span>
              <h2 style={{ margin: '8px 0 0', fontSize: '1.7rem', lineHeight: 1.05 }}>{ev.title}</h2>
              <span style={{ display: 'inline-block', marginTop: 14, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text)' }}>
                Get tickets →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {!isLoading && !error && (data ?? []).length === 0 && (
        <p className="muted">No published events yet — check back soon.</p>
      )}
    </div>
  );
}
