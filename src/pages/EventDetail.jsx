import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import { heroFor } from '../lib/images';
import Checkout from '../features/checkout/Checkout.jsx';

const money = (c) => `$${(c / 100).toFixed(2)}`;

export default function EventDetail() {
  const { id } = useParams();
  const [activeCat, setActiveCat] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ['event', id], queryFn: () => apiGet(`/events/${id}`) });
  if (isLoading || !data) return <p>Loading…</p>;

  return (
    <div>
      <img src={heroFor(data.id)} alt="" style={{ width: '100%', height: 280, objectFit: 'cover' }} />
      <h1 style={{ fontWeight: 900 }}>{data.title}</h1>
      {data.location && <p style={{ color: 'var(--muted)' }}>{data.location}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data.categories.map((cat) => {
          const soldOut = cat.available_quantity <= 0;
          return (
            <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', padding: 14, marginBottom: 10 }}>
              <span>{cat.name} — {money(cat.price_cents)} <small style={{ color: 'var(--muted)' }}>({cat.available_quantity} left)</small></span>
              <button className="primary" disabled={soldOut} onClick={() => setActiveCat(cat)}>
                {soldOut ? 'Sold out' : 'Get tickets'}
              </button>
            </li>
          );
        })}
      </ul>
      {activeCat && <Checkout event={data} category={activeCat} onClose={() => setActiveCat(null)} />}
    </div>
  );
}
