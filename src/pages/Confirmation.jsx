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
  if (isLoading || !data) return <p>Loading order…</p>;
  if (data.status !== 'paid') return <p>Finalizing your order…</p>;
  return (
    <div>
      <h1>You're in.</h1>
      <p style={{ color: 'var(--muted)' }}>Order {data.id} · {money(data.amount_cents)}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {(data.tickets ?? []).map((t) => (
          <div key={t.id} style={{ border: '1px solid var(--border)', padding: 12, background: '#fff' }}>
            <QrCode value={t.qr_token} />
          </div>
        ))}
      </div>
    </div>
  );
}
