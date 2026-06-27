import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import { updateEvent, createCategory, eventSales } from '../lib/organizerApi';
import { messageFor } from '../lib/errors';

const money = (c) => `$${(c / 100).toFixed(2)}`;

export default function OrganizerEvent() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [err, setErr] = useState(null);

  const event = useQuery({ queryKey: ['event', id], queryFn: () => apiGet(`/events/${id}`) });
  const sales = useQuery({ queryKey: ['sales', id], queryFn: () => eventSales(id) });

  const publish = useMutation({
    mutationFn: () => updateEvent(id, { status: 'published' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', id] }),
    onError: (e) => setErr(messageFor(e)),
  });
  const addCategory = useMutation({
    mutationFn: () => createCategory(id, { name, priceCents: Number(price), totalQuantity: Number(qty) }),
    onSuccess: () => { setName(''); setPrice(''); setQty(''); qc.invalidateQueries({ queryKey: ['event', id] }); },
    onError: (e) => setErr(messageFor(e)),
  });

  if (event.isLoading || !event.data) return <p>Loading…</p>;
  const ev = event.data;
  const totals = sales.data?.totals;

  return (
    <div>
      <h1>{ev.title}</h1>
      <p style={{ color: 'var(--muted)' }}>Status: {ev.status}</p>
      {totals && <p>{totals.sold} sold · {money(totals.revenueCents)} revenue</p>}
      {ev.status === 'draft' && <button className="primary" onClick={() => { setErr(null); publish.mutate(); }} disabled={publish.isPending}>Publish</button>}
      {err && <p style={{ color: '#f87171' }}>{err}</p>}

      <h2 style={{ marginTop: 24 }}>Ticket categories</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(ev.categories ?? []).map((c) => (
          <li key={c.id} style={{ border: '1px solid var(--border)', padding: 10, marginBottom: 6 }}>
            {c.name} — {money(c.price_cents)} <small style={{ color: 'var(--muted)' }}>({c.available_quantity}/{c.total_quantity} left)</small>
          </li>
        ))}
      </ul>

      <form onSubmit={(e) => { e.preventDefault(); setErr(null); addCategory.mutate(); }}
        style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
        <label>Category name<br /><input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Price (cents)<br /><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required /></label>
        <label>Quantity<br /><input type="number" value={qty} onChange={(e) => setQty(e.target.value)} required /></label>
        <button className="primary" type="submit" disabled={addCategory.isPending}>Add category</button>
      </form>
    </div>
  );
}
