import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '../lib/api';
import { updateEvent, createCategory, eventSales, eventOrders, refundOrder } from '../lib/organizerApi';
import { messageFor } from '../lib/errors';
import { heroFor } from '../lib/images';
import { EVENT_STATUSES, fromDateTimeLocal, optionalText, toDateTimeLocal } from '../lib/eventForms';

const money = (c) => `$${(c / 100).toFixed(2)}`;

export default function OrganizerEvent() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [status, setStatus] = useState('draft');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [maxPerCustomer, setMaxPerCustomer] = useState('');
  const [salesOpenAt, setSalesOpenAt] = useState('');
  const [salesCloseAt, setSalesCloseAt] = useState('');
  const [err, setErr] = useState(null);

  const event = useQuery({ queryKey: ['event', id], queryFn: () => apiGet(`/events/${id}`) });
  const sales = useQuery({ queryKey: ['sales', id], queryFn: () => eventSales(id) });
  const orders = useQuery({ queryKey: ['event-orders', id], queryFn: () => eventOrders(id) });

  useEffect(() => {
    if (!event.data) return;
    setEventTitle(event.data.title ?? '');
    setDescription(event.data.description ?? '');
    setLocation(event.data.location ?? '');
    setStartsAt(toDateTimeLocal(event.data.starts_at));
    setStatus(event.data.status ?? 'draft');
  }, [event.data]);

  const refund = useMutation({
    mutationFn: refundOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-orders', id] });
      qc.invalidateQueries({ queryKey: ['sales', id] });
      qc.invalidateQueries({ queryKey: ['event', id] });
    },
    onError: (e) => setErr(messageFor(e)),
  });

  const publish = useMutation({
    mutationFn: () => updateEvent(id, { status: 'published' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', id] }),
    onError: (e) => setErr(messageFor(e)),
  });
  const saveDetails = useMutation({
    mutationFn: () => updateEvent(id, {
      title: eventTitle,
      description: optionalText(description),
      location: optionalText(location),
      startsAt: fromDateTimeLocal(startsAt),
      status,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event', id] });
      qc.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: (e) => setErr(messageFor(e)),
  });
  const addCategory = useMutation({
    mutationFn: () => createCategory(id, {
      name,
      priceCents: Number(price),
      totalQuantity: Number(qty),
      maxPerCustomer: maxPerCustomer ? Number(maxPerCustomer) : undefined,
      salesOpenAt: fromDateTimeLocal(salesOpenAt),
      salesCloseAt: fromDateTimeLocal(salesCloseAt),
    }),
    onSuccess: () => {
      setName('');
      setPrice('');
      setQty('');
      setMaxPerCustomer('');
      setSalesOpenAt('');
      setSalesCloseAt('');
      qc.invalidateQueries({ queryKey: ['event', id] });
    },
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

      <form onSubmit={(e) => { e.preventDefault(); setErr(null); saveDetails.mutate(); }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 32, padding: 20, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <label>Title<input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required /></label>
        <label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} /></label>
        <label>Starts at<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></label>
        <label>Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {EVENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ gridColumn: '1 / -1' }}>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></label>
        <button className="primary" type="submit" disabled={!eventTitle || saveDetails.isPending}>Save details</button>
      </form>

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
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, alignItems: 'end', padding: 20, border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <label style={{ flex: '1 1 160px' }}>Category name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Price (cents)<input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required /></label>
        <label>Quantity<input type="number" value={qty} onChange={(e) => setQty(e.target.value)} required /></label>
        <label>Max per customer<input type="number" min="1" value={maxPerCustomer} onChange={(e) => setMaxPerCustomer(e.target.value)} placeholder="10" /></label>
        <label>Sales open<input type="datetime-local" value={salesOpenAt} onChange={(e) => setSalesOpenAt(e.target.value)} /></label>
        <label>Sales close<input type="datetime-local" value={salesCloseAt} onChange={(e) => setSalesCloseAt(e.target.value)} /></label>
        <button className="primary" type="submit" disabled={addCategory.isPending}>Add category</button>
      </form>

      <h2 style={{ marginTop: 40 }}>Orders</h2>
      <hr className="rule" style={{ margin: '14px 0' }} />
      {orders.isLoading && <p className="muted">Loading orders…</p>}
      {orders.data && orders.data.length === 0 && <p className="muted">No orders yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {(orders.data ?? []).map((o) => (
          <li key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '14px 2px', borderBottom: '1px solid var(--border)' }}>
            <span>
              <span style={{ fontWeight: 600 }}>{o.email}</span>
              <span className="mono muted" style={{ display: 'block', fontSize: '0.74rem', marginTop: 3 }}>
                {o.category_name} · {o.quantity}× · {money(o.amount_cents)}
              </span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={`badge${o.status === 'paid' ? ' ok' : ''}`}>{o.status}</span>
              <button
                onClick={() => { setErr(null); refund.mutate(o.id); }}
                disabled={o.status !== 'paid' || refund.isPending}
              >
                Refund
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
