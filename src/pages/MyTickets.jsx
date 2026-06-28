import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import { heroFor } from '../lib/images';
import QrCode from '../components/QrCode.jsx';

const money = (c) => `$${(c / 100).toFixed(2)}`;

export default function MyTickets() {
  const { data, isLoading, error } = useQuery({ queryKey: ['my-orders'], queryFn: () => apiGet('/orders') });
  if (isLoading) return <p className="muted">Loading your tickets…</p>;
  if (error) return <p className="muted">Could not load your tickets.</p>;
  if (!data.length) {
    return (
      <div style={{ padding: '70px 0' }}>
        <span className="eyebrow">Your tickets</span>
        <h1 style={{ marginTop: 12 }}>Nothing here yet.</h1>
        <p className="muted">No tickets yet — browse events to grab some, and your QR tickets will live here.</p>
      </div>
    );
  }

  return (
    <div>
      <span className="eyebrow">Your tickets</span>
      <h1 style={{ marginTop: 12, marginBottom: 28 }}>Wallet</h1>

      {data.map((o, i) => (
        <section key={o.id} className="reveal" style={{ border: '1px solid var(--border)', marginBottom: 24, animationDelay: `${i * 70}ms` }}>
          <div style={{ position: 'relative', height: 150, overflow: 'hidden' }}>
            <img src={heroFor(o.event_id)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,11,0.95), rgba(10,10,11,0.2))' }} />
            <div style={{ position: 'absolute', left: 20, right: 20, bottom: 16 }}>
              <h2 style={{ margin: 0 }}>{o.event_title}</h2>
              <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--accent)' }}>
                {o.category_name} · {o.quantity} ticket{o.quantity === 1 ? '' : 's'} · {money(o.amount_cents)} · {o.status}
                {o.event_starts_at ? ` · ${new Date(o.event_starts_at).toLocaleDateString()}` : ''}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, padding: 18 }}>
            {(o.tickets ?? []).map((t) => (
              <div key={t.id} style={{ background: '#fff', padding: 10, border: '1px solid var(--line-strong)' }}><QrCode value={t.qr_token} /></div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
