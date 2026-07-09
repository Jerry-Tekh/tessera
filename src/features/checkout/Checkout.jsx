import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet, apiPost } from '../../lib/api';
import { messageFor } from '../../lib/errors';
import Countdown from '../../components/Countdown.jsx';

const money = (c) => `$${(c / 100).toFixed(2)}`;

export default function Checkout({ category, onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [qty, setQty] = useState(1);
  const [reservation, setReservation] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [err, setErr] = useState(null);

  const maxQty = useMemo(
    () => Math.max(1, Math.min(category.max_per_customer ?? 10, category.available_quantity ?? 1)),
    [category],
  );
  const total = qty * category.price_cents;

  // Escape to close, focus the dialog, and lock background scroll while open.
  const dialogRef = useRef(null);
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  async function reserve() {
    setErr(null);
    try {
      const r = await apiPost('/reservations',
        { categoryId: category.id, quantity: qty, holder: { kind: 'guest', email } }, { idempotency: true });
      setReservation(r.reservation);
    } catch (e) { setErr(messageFor(e)); }
  }

  async function pay() {
    setErr(null);
    try {
      const r = await apiPost('/orders', { reservationId: reservation.id }, { idempotency: true });
      setOrderId(r.order.id);
    } catch (e) { setErr(messageFor(e)); }
  }

  const poll = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => apiGet(`/orders/${orderId}`),
    enabled: !!orderId,
    refetchInterval: (q) => (q.state.data?.status === 'paid' ? false : 1500),
  });
  const paid = poll.data?.status === 'paid';
  useEffect(() => { if (paid && orderId) navigate(`/orders/${orderId}`); }, [paid, orderId, navigate]);

  const step = (d) => setQty((q) => Math.min(maxQty, Math.max(1, q + d)));

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(6,6,7,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Checkout — ${category.name}`} className="reveal" style={{ width: 'min(440px, 100%)', background: 'var(--surface)', border: '1px solid var(--line-strong)', boxShadow: 'var(--shadow)', padding: 28, outline: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <span className="eyebrow">Checkout</span>
            <h2 style={{ margin: '8px 0 0' }}>{category.name}</h2>
            <span className="mono muted" style={{ fontSize: '0.82rem' }}>{money(category.price_cents)} each</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ padding: '6px 11px', border: '1px solid var(--border)' }}>✕</button>
        </div>

        <hr className="rule" style={{ margin: '20px 0' }} />
        {err && <p style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>{err}</p>}

        {!reservation && (
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <label>Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <button type="button" aria-label="Decrease quantity" onClick={() => step(-1)} disabled={qty <= 1} style={{ width: 42, padding: '8px 0', fontSize: '1.1rem' }}>−</button>
                <span className="mono" style={{ fontSize: '1.3rem', minWidth: 24, textAlign: 'center' }}>{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => step(1)} disabled={qty >= maxQty} style={{ width: 42, padding: '8px 0', fontSize: '1.1rem' }}>+</button>
                <span className="mono muted" style={{ fontSize: '0.74rem' }}>max {maxQty}</span>
              </div>
            </div>
            <label>Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderTop: '1px solid var(--border)' }}>
              <span className="mono muted" style={{ fontSize: '0.82rem' }}>{qty} × {money(category.price_cents)}</span>
              <span className="mono" style={{ fontSize: '1.2rem' }}>{money(total)}</span>
            </div>

            <button className="primary" disabled={!email} onClick={reserve}>Reserve</button>
          </div>
        )}

        {reservation && !orderId && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="mono muted" style={{ fontSize: '0.82rem' }}>{qty} ticket{qty === 1 ? '' : 's'}</span>
              <span className="mono" style={{ fontSize: '1.2rem' }}>{money(total)}</span>
            </div>
            <p className="mono" style={{ fontSize: '0.9rem' }}>
              Hold expires in <span style={{ color: 'var(--accent)' }}><Countdown deadline={reservation.expires_at} onExpire={() => { setReservation(null); setErr('Your hold expired. Please start again.'); }} /></span>
            </p>
            <button className="primary" onClick={pay}>Pay {money(total)}</button>
          </div>
        )}

        {orderId && (
          <p className="mono" style={{ fontSize: '0.92rem', color: paid ? 'var(--accent)' : 'var(--muted)' }}>
            {paid ? 'Paid — redirecting…' : 'Finalizing your order…'}
          </p>
        )}
      </div>
    </div>
  );
}
