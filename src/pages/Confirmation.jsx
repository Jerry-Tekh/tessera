import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import QrCode from '../components/QrCode.jsx';

const money = (c) => `$${(c / 100).toFixed(2)}`;

export default function Confirmation() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => apiGet(`/orders/${id}`),
    refetchInterval: (q) => (q.state.data?.status === 'paid' ? false : 1500),
  });
  if (isLoading || !data) return <p className="muted">Loading order…</p>;
  if (data.status !== 'paid') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <span className="eyebrow">Processing</span>
        <h1 style={{ marginTop: 12 }}>Finalizing your order…</h1>
        <p className="muted">Reversing the charge and minting your tickets. This only takes a moment.</p>
      </div>
    );
  }

  return (
    <div className="reveal">
      <span className="eyebrow" style={{ color: 'var(--accent)' }}>Confirmed</span>
      <h1 style={{ marginTop: 12 }}>You're in.</h1>
      <p className="mono muted" style={{ fontSize: '0.82rem', letterSpacing: '0.04em' }}>
        ORDER {data.id.slice(0, 8).toUpperCase()} · {money(data.amount_cents)} · {(data.tickets ?? []).length} TICKET(S)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20, marginTop: 32 }}>
        {(data.tickets ?? []).map((t, i) => (
          <div key={t.id} className="reveal" style={{ display: 'flex', border: '1px solid var(--line-strong)', background: 'var(--surface)', animationDelay: `${i * 80}ms` }}>
            <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="eyebrow">Admit one</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginTop: 8 }}>Tessera</div>
              </div>
              <span className="badge ok" style={{ alignSelf: 'flex-start', marginTop: 18 }}>{t.status}</span>
            </div>
            <div style={{ borderLeft: '2px dashed var(--line-strong)', padding: 14, background: '#fff', display: 'flex', alignItems: 'center' }}>
              <QrCode value={t.qr_token} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
