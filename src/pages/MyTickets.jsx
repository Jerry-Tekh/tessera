import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import QrCode from '../components/QrCode.jsx';

const money = (c) => `$${(c / 100).toFixed(2)}`;

export default function MyTickets() {
  const { data, isLoading, error } = useQuery({ queryKey: ['my-orders'], queryFn: () => apiGet('/orders') });
  if (isLoading) return <p>Loading your tickets…</p>;
  if (error) return <p>Could not load your tickets.</p>;
  if (!data.length) return <p>No tickets yet. Browse events to grab some.</p>;

  return (
    <div>
      <h1>Your tickets</h1>
      {data.map((o) => (
        <section key={o.id} style={{ border: '1px solid var(--border)', padding: 16, marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>{o.event_title}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            {o.category_name} · {o.quantity} ticket{o.quantity === 1 ? '' : 's'} · {money(o.amount_cents)} · {o.status}
            {o.event_starts_at ? ` · ${new Date(o.event_starts_at).toLocaleString()}` : ''}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {(o.tickets ?? []).map((t) => (
              <div key={t.id} style={{ background: '#fff', padding: 10 }}><QrCode value={t.qr_token} /></div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
