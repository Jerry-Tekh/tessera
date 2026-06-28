import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import { heroFor } from '../lib/images';
import Checkout from '../features/checkout/Checkout.jsx';

const money = (c) => `$${(c / 100).toFixed(2)}`;
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA');

export default function EventDetail() {
  const { id } = useParams();
  const [activeCat, setActiveCat] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ['event', id], queryFn: () => apiGet(`/events/${id}`) });
  if (isLoading || !data) return <p className="muted">Loading…</p>;

  return (
    <div>
      <Link to="/" className="eyebrow" style={{ color: 'var(--muted)' }}>← All events</Link>

      <section className="reveal" style={{ position: 'relative', marginTop: 18, height: 'min(58vh, 480px)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <img src={heroFor(data.id)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,11,0.95) 5%, rgba(10,10,11,0.25) 55%, rgba(10,10,11,0.1))' }} />
        <div style={{ position: 'absolute', left: 32, right: 32, bottom: 30 }}>
          <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent)', letterSpacing: '0.08em' }}>
            {fmtDate(data.starts_at)}{data.location ? `   ·   ${data.location}` : ''}
          </span>
          <h1 style={{ margin: '10px 0 0', fontSize: 'clamp(2.4rem, 6vw, 4.6rem)' }}>{data.title}</h1>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)', gap: 48, marginTop: 44, alignItems: 'start' }}>
        <div className="reveal" style={{ animationDelay: '80ms' }}>
          <span className="eyebrow">About</span>
          <p style={{ fontSize: '1.08rem', color: 'var(--text)', marginTop: 14 }}>
            {data.description || 'An unmissable live event. Choose your ticket tier and check out in seconds — your QR ticket is issued instantly.'}
          </p>
        </div>

        <div className="reveal" style={{ animationDelay: '140ms' }}>
          <span className="eyebrow">Tickets</span>
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)' }}>
            {data.categories.map((cat) => {
              const soldOut = cat.available_quantity <= 0;
              return (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '20px 4px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{cat.name}</div>
                    <div className="mono" style={{ fontSize: '0.74rem', color: soldOut ? 'var(--danger)' : 'var(--muted)', marginTop: 4, letterSpacing: '0.06em' }}>
                      {soldOut ? 'SOLD OUT' : `${cat.available_quantity} remaining`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <span className="mono" style={{ fontSize: '1.25rem', color: 'var(--text)' }}>{money(cat.price_cents)}</span>
                    <button className="primary" disabled={soldOut} onClick={() => setActiveCat(cat)}>
                      {soldOut ? 'Sold out' : 'Get tickets'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeCat && <Checkout event={data} category={activeCat} onClose={() => setActiveCat(null)} />}
    </div>
  );
}
