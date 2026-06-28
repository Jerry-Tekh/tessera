import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import { updateEvent, createCategory, eventSales } from '../lib/organizerApi';
import { messageFor } from '../lib/errors';
import { heroFor } from '../lib/images';

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

  if (event.isLoading || !event.data) return <p className="muted">Loading…</p>;
  const ev = event.data;
  const totals = sales.data?.totals;

  return (
    <div className="reveal">
      <span className="eyebrow">Manage event</span>
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', border: '1px solid var(--border)', margin: '14px 0 24px' }}>
        <img src={heroFor(ev.id)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,11,0.95), rgba(10,10,11,0.25))' }} />
        <div style={{ position: 'absolute', left: 22, bottom: 18 }}>
          <h1 style={{ margin: 0 }}>{ev.title}</h1>
          <span className="mono muted" style={{ fontSize: '0.82rem' }}>Status: {ev.status}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
        {totals && (
          <div style={{ padding: '14px 20px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <span className="mono" style={{ fontSize: '1.1rem' }}>{totals.sold} sold</span>
            <span className="mono muted" style={{ marginLeft: 12 }}>{money(totals.revenueCents)} revenue</span>
          </div>
        )}
        {ev.status === 'draft' && <button className="primary" onClick={() => { setErr(null); publish.mutate(); }} disabled={publish.isPending}>Publish</button>}
      </div>
      {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}

      <h2>Ticket categories</h2>
      <hr className="rule" style={{ margin: '14px 0' }} />
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
        {(ev.categories ?? []).map((c) => (
          <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 2px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>{c.name}</span>
            <span className="mono">{money(c.price_cents)} <span className="muted">· {c.available_quantity}/{c.total_quantity} left</span></span>
          </li>
        ))}
      </ul>

      <form onSubmit={(e) => { e.preventDefault(); setErr(null); addCategory.mutate(); }}
        style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap', padding: 20, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <label style={{ flex: '1 1 160px' }}>Category name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Price (cents)<input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required /></label>
        <label>Quantity<input type="number" value={qty} onChange={(e) => setQty(e.target.value)} required /></label>
        <button className="primary" type="submit" disabled={addCategory.isPending}>Add category</button>
      </form>
    </div>
  );
}
